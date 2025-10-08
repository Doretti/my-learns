import fs from 'fs/promises'
import path from 'path'

export class LSMTree {
  constructor({ dir, memTableSize }) {
    if (!dir) throw new Error('Directory path is required')
    this.dir = dir
    if (typeof memTableSize !== 'number' || memTableSize <= 0) {
      throw new Error('memTableSize must be a positive number')
    }
    this.memTableSize = memTableSize
    this.memTable = new Map()
    this.walPath = path.join(dir, 'wal.log')
    this.sstFiles = []
  }

  static async open(options = {}) {
    const { dir = 'lsm_tree_db', memTableSize = 1 } = options

    await fs.mkdir(dir, { recursive: true })

    const instance = new LSMTree({ dir, memTableSize })

    await instance._restoreFromWAL()

    return instance
  }

  async _flush() {
    const sortedMemTable = Array.from(this.memTable.entries()).sort((a, b) => {
      const bufA = Buffer.from(a[0], 'utf8')
      const bufB = Buffer.from(b[0], 'utf8')
      return Buffer.compare(bufA, bufB)
    })

    const sstName = Date.now() + '.sst'
    const sstPath = path.join(this.dir, sstName)
    const lines = []
    for (const [key, value] of sortedMemTable) {
      const keyLen = Buffer.byteLength(key, 'utf8')
      const valLen = Buffer.byteLength(value, 'utf8')
      lines.push(`${keyLen}\n${key}\n${valLen}\n${value}`)
    }
    const data = lines.join('\n') + '\n'

    await fs.writeFile(sstPath, data)

    this.memTable = new Map()

    this.sstFiles.push(sstPath)

    console.log('MemTable size limit reached. Flushing to disk...')
  }

  _readLine(buffer, currentPosition) {
    const endSymbolIndex = buffer.indexOf(10, currentPosition)

    if (endSymbolIndex === -1) {
      throw new Error('Expected newline not found')
    }

    const valueInBytes = buffer.subarray(currentPosition, endSymbolIndex)
    const value = valueInBytes.toString('utf-8')

    const newPosition = endSymbolIndex + 1

    return {
      value,
      position: newPosition
    }
  }

  _readRecord(buffer, currentPosition) {
    const record = {
      key: null,
      value: null,
      keyLength: null,
      valueLength: null
    }

    let position = currentPosition

    const result = this._readLine(buffer, currentPosition)

    if (result.value !== 'PUT') {
      throw new Error('Corrupted WAL file')
    }

    position = result.position

    const keyLengthResult = this._readLine(buffer, position)

    const keyLen = parseInt(keyLengthResult.value, 10)
    if (isNaN(keyLen) || keyLen < 0) {
      throw new Error('Invalid key length in WAL')
    }
    record.keyLength = keyLen
    position = keyLengthResult.position

    if (position + record.keyLength > buffer.length) {
      throw new Error('Unexpected end of WAL (key truncated)')
    }
    const keyBytes = buffer.subarray(position, position + record.keyLength)
    const key = keyBytes.toString('utf-8')

    record.key = key

    if (buffer[position + record.keyLength] !== 10) {
      throw new Error('Expected newline after key')
    }

    position = position + record.keyLength + 1

    const valueLengthResult = this._readLine(buffer, position)

    const valueLen = parseInt(valueLengthResult.value, 10)
    if (isNaN(valueLen) || valueLen < 0) {
      throw new Error('Invalid value length in WAL')
    }
    record.valueLength = valueLen
    position = valueLengthResult.position

    if (position + record.valueLength > buffer.length) {
      throw new Error('Unexpected end of WAL (value truncated)')
    }
    const valueBytes = buffer.subarray(position, position + record.valueLength)
    const value = valueBytes.toString('utf-8')

    record.value = value

    if (buffer[position + record.valueLength] !== 10) {
      throw new Error('Expected newline after key')
    }

    position = position + record.valueLength + 1

    return {
      record,
      position
    }
  }

  async _restoreFromWAL() {
    const walBuffer = await fs.readFile(this.walPath)

    if (walBuffer.length === 0) return

    let pos = 0

    while (pos < walBuffer.length) {
      const { position, record } = this._readRecord(walBuffer, pos)

      this.memTable.set(record.key, record.value)
      pos = position
    }
  }

  async put(key, value) {
    if (!key) throw new Error('Key is required')

    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new Error('Key and value must be strings')
    }

    const keyLength = Buffer.byteLength(key, 'utf-8')
    const valueLength = Buffer.byteLength(value, 'utf-8')

    const wal_record = `PUT\n${keyLength}\n${key}\n${valueLength}\n${value}\n`

    await fs.appendFile(this.walPath, wal_record)

    this.memTable.set(key, value)

    if (this.memTable.size >= this.memTableSize) {
      setImmediate(() => this._flush())
    }
  }

  get(key) {
    if (!key) throw new Error('Key is required')

    if (typeof key !== 'string') {
      throw new Error('Key must be a string')
    }

    if (this.memTable.has(key)) {
      return {
        found: true,
        value: this.memTable.get(key)
      }
    }

    return { found: false, value: undefined }
  }
}

class SkipListNode {
  constructor(value, level) {
    this.value = value
    this.nexts = Array(level).fill(null)
  }
}

class SkipList {
  static MAX_LEVEL = 16

  constructor() {
    this.currentMaxLevel = 0
    this.head = new SkipListNode(Number.NEGATIVE_INFINITY, SkipList.MAX_LEVEL)
  }

  randomLevel(maxLevel) {
    let currentLevel = 1

    while (Math.random() < 0.5 && currentLevel < maxLevel) {
      currentLevel++
    }

    return currentLevel
  }

  print() {
    for (let level = this.currentMaxLevel - 1; level >= 0; level--) {
      let line = `Level ${level}: `
      let node = this.head.nexts[level]

      while (node) {
        line += node.value + ' -> '
        node = node.nexts[level]
      }

      console.log(line + 'null')
    }
  }

  delete(value) {
    const update = Array(SkipList.MAX_LEVEL).fill(null)
    let current = this.head

    for (let level = SkipList.MAX_LEVEL - 1; level >= 0; level--) {
      while (
        current.nexts[level] !== null &&
        current.nexts[level].value < value
      ) {
        current = current.nexts[level]
      }
      update[level] = current
    }

    const nodeToDelete = update[0].nexts[0]

    if (nodeToDelete === null || nodeToDelete.value !== value) {
      return false
    }

    const deletedLevel = nodeToDelete.nexts.length
    for (let i = 0; i < deletedLevel; i++) {
      update[i].nexts[i] = nodeToDelete.nexts[i]
    }

    while (
      this.currentMaxLevel > 1 &&
      this.head.nexts[this.currentMaxLevel - 1] === null
    ) {
      this.currentMaxLevel--
    }

    return true
  }

  insert(value) {
    const update = Array(SkipList.MAX_LEVEL).fill(null)
    let current = this.head

    for (let level = SkipList.MAX_LEVEL - 1; level >= 0; level--) {
      while (
        current.nexts[level] !== null &&
        current.nexts[level].value < value
      ) {
        current = current.nexts[level]
      }
      update[level] = current
    }

    const existingNode = current.nexts[0]
    if (existingNode !== null && existingNode.value === value) {
      return
    }

    const newLevel = this.randomLevel(SkipList.MAX_LEVEL)

    if (newLevel > this.currentMaxLevel) {
      for (let i = this.currentMaxLevel; i < newLevel; i++) {
        update[i] = this.head
      }

      this.currentMaxLevel = newLevel
    }

    const newNode = new SkipListNode(value, newLevel)

    for (let i = 0; i < newLevel; i++) {
      newNode.nexts[i] = update[i].nexts[i]
      update[i].nexts[i] = newNode
    }
  }

  search(value) {
    let current = this.head

    for (let level = this.currentMaxLevel - 1; level >= 0; level--) {
      while (
        current.nexts[level] !== null &&
        current.nexts[level].value < value
      ) {
        current = current.nexts[level]
      }
    }

    const foundNode = current.nexts[0]

    return foundNode !== null && foundNode.value === value
  }
}

exports.SkipList = SkipList

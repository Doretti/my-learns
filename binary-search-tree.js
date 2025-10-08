class BinarySearchTreeNode {
  constructor(value, left = null, right = null) {
    this.value = value
    this.left = left
    this.right = right
  }
}

export class BinarySearchTree {
  constructor() {
    this.root = null
  }

  _insert(node, value) {
    if (node === null) return new BinarySearchTreeNode(value)

    if (node.value > value) {
      node.left = this._insert(node.left, value)
    } else {
      node.right = this._insert(node.right, value) // node.value >= value
    }

    return node
  }

  _search(node, value) {
    if (node === null) return false

    if (node.value === value) {
      return true
    } else if (node.value > value) {
      return this._search(node.left, value)
    } else {
      return this._search(node.right, value)
    }
  }

  _inOrder(node, result) {
    if (node === null) return

    this._inOrder(node.left, result)
    result.push(node.value)
    this._inOrder(node.right, result)
  }

  _findMin(node) {
    if (node === null) {
      return null
    }

    if (node.left === null) {
      return node
    }

    return this._findMin(node.left)
  }

  _findMax(node) {
    if (node === null) {
      return null
    }

    if (node.right === null) {
      return node
    }

    return this._findMax(node.right)
  }

  _delete(node, value) {
    if (node === null) return null

    if (node.value < value) {
      node.right = this._delete(node.right, value)
    } else if (node.value > value) {
      node.left = this._delete(node.left, value)
    } else {
      if (node.left === null && node.right === null) {
        return null
      } else if (node.left === null) {
        return node.right
      } else if (node.right === null) {
        return node.left
      } else {
        const successor = this._findMin(node.right)

        node.value = successor.value
        node.right = this._delete(node.right, successor.value)
      }
    }

    return node
  }

  _isValid(node, min = -Infinity, max = Infinity) {
    if (node === null) return true

    if (node.value >= max || node.value < min) {
      return false
    }

    return (
      this._isValid(node.left, min, node.value) &&
      this._isValid(node.right, node.value, max)
    )
  }

  insert(value) {
    this.root = this._insert(this.root, value)
  }

  search(value) {
    return this._search(this.root, value)
  }

  delete(value) {
    this.root = this._delete(this.root, value)
  }

  min() {
    return this._findMin(this.root)?.value
  }

  max() {
    return this._findMax(this.root)?.value
  }

  inOrder() {
    const result = []

    this._inOrder(this.root, result)

    return result
  }

  isValidBST() {
    return this._isValid(this.root)
  }
}

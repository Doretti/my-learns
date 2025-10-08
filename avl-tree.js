export class AVLTree {
  constructor() {
    this.root = null
  }

  _getHeight(node) {
    if (node === null) return -1
    return node.height
  }

  _updateHeight(node) {
    if (node === null) return
    const leftHeight = this._getHeight(node.left)
    const rightHeight = this._getHeight(node.right)

    node.height = Math.max(leftHeight, rightHeight) + 1
  }

  _getBalance(node) {
    if (node === null) return 0

    const leftHeight = this._getHeight(node.left)
    const rightHeight = this._getHeight(node.right)

    return leftHeight - rightHeight
  }

  _rotateRight(y) {
    let x = y.left
    let yLeftChild = x.right

    x.right = y
    y.left = yLeftChild

    this._updateHeight(y)
    this._updateHeight(x)

    return x
  }

  _rotateLeft(x) {
    let y = x.right
    let xRightChild = y.left

    y.left = x
    x.right = xRightChild

    this._updateHeight(x)
    this._updateHeight(y)

    return y
  }

  _insert(node, value) {
    if (node === null) return new AVLNode(value)

    if (value < node.value) {
      node.left = this._insert(node.left, value)
    }
    if (value > node.value) {
      node.right = this._insert(node.right, value)
    } else {
      return node
    }

    this._updateHeight(node)

    let balance = this._getBalance(node)

    const LL = balance > 1 && value < node.left.value
    const RR = balance < -1 && value > node.right.value
    const LR = balance > 1 && value > node.left.value
    const RL = balance < -1 && value < node.right.value

    if (LL) {
      return this._rotateRight(node)
    } else if (RR) {
      return this._rotateLeft(node)
    } else if (LR) {
      node.left = this._rotateLeft(node.left)
      return this._rotateRight(node)
    } else if (RL) {
      node.right = this._rotateRight(node.right)
      return this._rotateLeft(node)
    }

    return node
  }

  _inOrder(node, result) {
    if (node === null) return
    this._inOrder(node.left, result)
    result.push(node.value)
    this._inOrder(node.right, result)
  }

  inOrder() {
    const result = []
    this._inOrder(this.root, result)
    return result
  }

  insert(value) {
    this.root = this._insert(this.root, value)
  }
}

class AVLNode {
  constructor(value, left = null, right = null) {
    this.value = value
    this.height = 0
    this.right = right
    this.left = left
  }
}

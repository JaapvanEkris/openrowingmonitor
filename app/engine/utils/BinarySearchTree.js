class BinarySearchTreeNode {
  constructor(key, value = key, parent = null) {
    this.key = key;
    this.value = value;
    this.parent = parent;
    this.left = null;
    this.right = null;
  }

  get isLeaf() {
    return this.left === null && this.right === null;
  }

  get hasChildren() {
    return !this.isLeaf;
  }
}

class BinarySearchTree {
  constructor(key, value = key) {
    this.root = new BinarySearchTreeNode(key, value);
  }

  *inOrderTraversal(node = this.root) {
    if (node.left) yield* this.inOrderTraversal(node.left);
    yield node;
    if (node.right) yield* this.inOrderTraversal(node.right);
  }

  *postOrderTraversal(node = this.root) {
    if (node.left) yield* this.postOrderTraversal(node.left);
    if (node.right) yield* this.postOrderTraversal(node.right);
    yield node;
  }

  *preOrderTraversal(node = this.root) {
    yield node;
    if (node.left) yield* this.preOrderTraversal(node.left);
    if (node.right) yield* this.preOrderTraversal(node.right);
  }

  insert(key, value = key) {
    let node = this.root;
    while (true) {
      if (node.key === key) return false;
      if (node.key > key) {
        if (node.left !== null) node = node.left;
        else {
          node.left = new BinarySearchTreeNode(key, value, node);
          return true;
        }
      } else if (node.key < key) {
        if (node.right !== null) node = node.right;
        else {
          node.right = new BinarySearchTreeNode(key, value, node);
          return true;
        }
      }
    }
  }

  has(key) {
    for (let node of this.postOrderTraversal()) {
      if (node.key === key) return true;
    }
    return false;
  }

  find(key) {
    for (let node of this.postOrderTraversal()) {
      if (node.key === key) return node;
    }
    return undefined;
  }

  remove(key) {
    const node = this.find(key);
    if (!node) return false;
    const isRoot = node.parent === null;
    const isLeftChild = !isRoot ? node.parent.left === node : false;
    const hasBothChildren = node.left !== null && node.right !== null;

    if (node.isLeaf) {
      if (!isRoot) {
        if (isLeftChild) node.parent.left = null;
        else node.parent.right = null;
      } else {
        this.root = null;
      }
      return true;
    } else if (!hasBothChildren) {
      const child = node.left !== null ? node.left : node.right;
      if (!isRoot) {
        if (isLeftChild) node.parent.left = child;
        else node.parent.right = child;
      } else {
        this.root = child;
      }
      child.parent = node.parent;
      return true;
    } else {
      const rightmostLeft = [...this.inOrderTraversal(node.left)].slice(-1)[0];
      rightmostLeft.parent = node.parent;
      if (!isRoot) {
        if (isLeftChild) node.parent.left = rightmostLeft;
        else node.parent.right = rightmostLeft;
      } else {
        this.root = rightmostLeft;
      }
      rightmostLeft.right = node.right;
      node.right.parent = rightmostLeft;
      return true;
    }
  }
}

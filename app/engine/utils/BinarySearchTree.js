// Javascript function to search a given key in a given BST

class Node {
  constructor(key) {
    this.key = key;
    this.left = null;
    this.right = null;
  }
}

// A utility function to insert
// a new node with given key in BST
function insert(node, key) {
  // If the tree is empty, return a new node
  if (node === null) {
	  return new Node(key);
  }

  // Otherwise, recur down the tree
  if (key < node.key) {
	  node.left = insert(node.left, key);
  } else if (key > node.key) {
	  node.right = insert(node.right, key);
  }

  // Return the (unchanged) node pointer
  return node;
  }

  // Utility function to search a key in a BST
  function search(root, key) {
  // Base Cases: root is null or key is present at root
  if (root === null || root.key === key) {
	  return root;
  }

  // Key is greater than root's key
  if (root.key < key) {
	  return search(root.right, key);
  }

  // Key is smaller than root's key
  return search(root.left, key);
  }

// Driver Code
let root = null;
root = insert(root, 50);
insert(root, 30);
insert(root, 20);
insert(root, 40);
insert(root, 70);
insert(root, 60);
insert(root, 80);

// Key to be found
  let key = 6;

// Searching in a BST
if (search(root, key) === null) {
  console.log(key + " not found");
} else {
  console.log(key + " found");
}

key = 60;

// Searching in a BST
if (search(root, key) === null) {
  console.log(key + " not found");
} else {
  console.log(key + " found");
}

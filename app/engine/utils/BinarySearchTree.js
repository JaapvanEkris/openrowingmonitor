class Node {
    constructor(value){
        this.value = value
        this.left = null
        this.right = null
    
    }

}
class BinarySearchTree {

    constructor(){
      this.root = null
    }
 
  find(value){
      if(!this.root) return false
      
      let current = this.root
      let found = false
      while(current && !found){
        if(value < current.value){
          current = current.left
        } else if(value > current.value){
          current = current.right
        } else {
          found = current
        } 
      }
        if(!found) return undefined;
        return found 
    remove(value){
        this.root = this.removeNode(this.root, value)
    }
    // a recursive function to insert a new value in binary search tree
    
    removeNode(current, value) {
        // base case, if the tree is empty 
       if(current === null) return current
        // when value is the same as current's value, this is the node to be deleted
        if (value === current.value) {
            // for case 1 and 2, node without child or with one child
            if (current.left === null && current.right === null){
                    return null
                }else if(current.left === null){
                    return current.right 
                }else if(current.right === null){
                    return current.left
                }else{
                    /// node with two children, get the inorder successor, 
                    //smallest in the right subtree
                    let tempNode = this.kthSmallestNode(current.right)
                        current.value = tempNode.value
                    /// delete the inorder successor       
                        current.right = this.removeNode(current.right, tempNode.value)
                    return current
            }
        // recur down the tree
        }else if(value < current.value) {
            current.left = this.removeNode(current.left, value)
            return current
        }else{
            current.right = this.removeNode(current.right, value)
            return current
        }
    }
    
     /// helper function to find the smallest node
    kthSmallestNode(node) {
        while(!node.left === null)
            node = node.left
        return node
  }
}

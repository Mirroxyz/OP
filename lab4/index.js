class Node {
  constructor(item, priority, order) {
    this.item = item;
    this.priority = priority;
    this.order = order;
  }
}

class BiDirectionalPriorityQueue {
  constructor() {
    this.maxHeap = [];
    this.nodeToMaxIndex = new Map();
    this.operationCounter = 0;
  }

  enqueue(item, priority) {
    const node = new Node(item, priority, this.operationCounter++);
    
    // Add to max-heap (for 'highest')
    const maxIndex = this.maxHeap.length;
    this.maxHeap.push(node);
    this.nodeToMaxIndex.set(node, maxIndex);
    this._bubbleUpMax(maxIndex);
  }

  peek(mode = 'highest') {
    if (this.maxHeap.length === 0) return undefined;
    
    if (mode === 'highest') {
      return this.maxHeap[0].item;
    }
    
    // For other modes, use linear search
    return this._find(mode).item;
  }

  dequeue(mode = 'highest') {
    if (this.maxHeap.length === 0) return undefined;

    let nodeToRemove;
    
    if (mode === 'highest') {
      nodeToRemove = this.maxHeap[0];
    } else {
      // For other modes, use linear search
      const index = this._findIndex(mode);
      nodeToRemove = this.maxHeap[index];
    }

    const item = nodeToRemove.item;
    
    // Remove from max-heap
    const maxIndex = this.nodeToMaxIndex.get(nodeToRemove);
    if (maxIndex !== undefined) {
      this._removeFromHeap(maxIndex);
    }
    
    this.nodeToMaxIndex.delete(nodeToRemove);

    return item;
  }

  size() {
    return this.maxHeap.length;
  }

  isEmpty() {
    return this.maxHeap.length === 0;
  }

  _findIndex(mode) {
    let index = 0;
    for (let i = 1; i < this.maxHeap.length; i++) {
      const compare = mode === 'lowest' ? this.maxHeap[i].priority < this.maxHeap[index].priority :
                      mode === 'oldest' ? this.maxHeap[i].order < this.maxHeap[index].order :
                      mode === 'newest' ? this.maxHeap[i].order > this.maxHeap[index].order : false;
      if (compare) index = i;
    }
    return index;
  }

  _find(mode) {
    return this.maxHeap[this._findIndex(mode)];
  }

  _removeFromHeap(index) {
    const lastNode = this.maxHeap.pop();
    if (index < this.maxHeap.length) {
      this.maxHeap[index] = lastNode;
      this.nodeToMaxIndex.set(lastNode, index);
      
      // Check if we need to bubble up or down
      const parentIndex = Math.floor((index - 1) / 2);
      if (parentIndex >= 0 && index > 0 && this.maxHeap[index].priority > this.maxHeap[parentIndex].priority) {
        this._bubbleUpMax(index);
      } else {
        this._bubbleDownMax(index);
      }
    }
  }

  _bubbleUpMax(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.maxHeap[index].priority > this.maxHeap[parentIndex].priority) {
        this._swapInHeap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  _bubbleDownMax(index) {
    while (true) {
      let largest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.maxHeap.length &&
        this.maxHeap[leftChild].priority > this.maxHeap[largest].priority
      ) {
        largest = leftChild;
      }

      if (
        rightChild < this.maxHeap.length &&
        this.maxHeap[rightChild].priority > this.maxHeap[largest].priority
      ) {
        largest = rightChild;
      }

      if (largest !== index) {
        this._swapInHeap(index, largest);
        index = largest;
      } else {
        break;
      }
    }
  }

  _swapInHeap(i, j) {
    [this.maxHeap[i], this.maxHeap[j]] = [this.maxHeap[j], this.maxHeap[i]];
    this.nodeToMaxIndex.set(this.maxHeap[i], i);
    this.nodeToMaxIndex.set(this.maxHeap[j], j);
  }
}

export default BiDirectionalPriorityQueue;

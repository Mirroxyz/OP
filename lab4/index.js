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
    this.minHeap = [];
    this.nodeToMaxIndex = new Map();
    this.nodeToMinIndex = new Map();
    this.operationCounter = 0;
    this.oldestNode = null;
  }

  enqueue(item, priority) {
    const node = new Node(item, priority, this.operationCounter++);
    
    // Track oldest node (first added)
    if (this.oldestNode === null) {
      this.oldestNode = node;
    }
    
    // Add to max-heap (for 'highest')
    const maxIndex = this.maxHeap.length;
    this.maxHeap.push(node);
    this.nodeToMaxIndex.set(node, maxIndex);
    this._bubbleUpMax(maxIndex);
    
    // Add to min-heap (for 'lowest')
    const minIndex = this.minHeap.length;
    this.minHeap.push(node);
    this.nodeToMinIndex.set(node, minIndex);
    this._bubbleUpMin(minIndex);
  }

  peek(mode = 'highest') {
    if (this.maxHeap.length === 0) return undefined;
    
    if (mode === 'highest') {
      return this.maxHeap[0].item;
    }
    
    if (mode === 'lowest') {
      return this.minHeap[0].item;
    }
    
    if (mode === 'oldest') {
      return this.oldestNode.item;
    }
    
    if (mode === 'newest') {
      // Newest is the most recently added, which has max order
      let newest = this.maxHeap[0];
      for (let i = 1; i < this.maxHeap.length; i++) {
        if (this.maxHeap[i].order > newest.order) {
          newest = this.maxHeap[i];
        }
      }
      return newest.item;
    }
  }

  dequeue(mode = 'highest') {
    if (this.maxHeap.length === 0) return undefined;

    let nodeToRemove;
    
    if (mode === 'highest') {
      nodeToRemove = this.maxHeap[0];
    } else if (mode === 'lowest') {
      nodeToRemove = this.minHeap[0];
    } else if (mode === 'oldest') {
      nodeToRemove = this.oldestNode;
    } else if (mode === 'newest') {
      // Find newest (max order) in max-heap
      let newest = this.maxHeap[0];
      for (let i = 1; i < this.maxHeap.length; i++) {
        if (this.maxHeap[i].order > newest.order) {
          newest = this.maxHeap[i];
        }
      }
      nodeToRemove = newest;
    }

    const item = nodeToRemove.item;
    
    // Remove from max-heap
    const maxIndex = this.nodeToMaxIndex.get(nodeToRemove);
    if (maxIndex !== undefined) {
      this._removeFromMaxHeap(maxIndex);
    }
    
    // Remove from min-heap
    const minIndex = this.nodeToMinIndex.get(nodeToRemove);
    if (minIndex !== undefined) {
      this._removeFromMinHeap(minIndex);
    }
    
    this.nodeToMaxIndex.delete(nodeToRemove);
    this.nodeToMinIndex.delete(nodeToRemove);
    
    // Update oldest node if it was removed
    if (this.oldestNode === nodeToRemove) {
      this.oldestNode = this.maxHeap.length > 0 
        ? this.maxHeap.reduce((min, node) => node.order < min.order ? node : min)
        : null;
    }

    return item;
  }

  size() {
    return this.maxHeap.length;
  }

  isEmpty() {
    return this.maxHeap.length === 0;
  }

  _removeFromMaxHeap(index) {
    const lastNode = this.maxHeap.pop();
    if (index < this.maxHeap.length) {
      this.maxHeap[index] = lastNode;
      this.nodeToMaxIndex.set(lastNode, index);
      
      const parentIndex = Math.floor((index - 1) / 2);
      if (parentIndex >= 0 && index > 0 && this.maxHeap[index].priority > this.maxHeap[parentIndex].priority) {
        this._bubbleUpMax(index);
      } else {
        this._bubbleDownMax(index);
      }
    }
  }

  _removeFromMinHeap(index) {
    const lastNode = this.minHeap.pop();
    if (index < this.minHeap.length) {
      this.minHeap[index] = lastNode;
      this.nodeToMinIndex.set(lastNode, index);
      
      const parentIndex = Math.floor((index - 1) / 2);
      if (parentIndex >= 0 && index > 0 && this.minHeap[index].priority < this.minHeap[parentIndex].priority) {
        this._bubbleUpMin(index);
      } else {
        this._bubbleDownMin(index);
      }
    }
  }

  _bubbleUpMax(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.maxHeap[index].priority > this.maxHeap[parentIndex].priority) {
        this._swapInMaxHeap(index, parentIndex);
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
        this._swapInMaxHeap(index, largest);
        index = largest;
      } else {
        break;
      }
    }
  }

  _bubbleUpMin(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.minHeap[index].priority < this.minHeap[parentIndex].priority) {
        this._swapInMinHeap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  _bubbleDownMin(index) {
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.minHeap.length &&
        this.minHeap[leftChild].priority < this.minHeap[smallest].priority
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < this.minHeap.length &&
        this.minHeap[rightChild].priority < this.minHeap[smallest].priority
      ) {
        smallest = rightChild;
      }

      if (smallest !== index) {
        this._swapInMinHeap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  _swapInMaxHeap(i, j) {
    [this.maxHeap[i], this.maxHeap[j]] = [this.maxHeap[j], this.maxHeap[i]];
    this.nodeToMaxIndex.set(this.maxHeap[i], i);
    this.nodeToMaxIndex.set(this.maxHeap[j], j);
  }

  _swapInMinHeap(i, j) {
    [this.minHeap[i], this.minHeap[j]] = [this.minHeap[j], this.minHeap[i]];
    this.nodeToMinIndex.set(this.minHeap[i], i);
    this.nodeToMinIndex.set(this.minHeap[j], j);
  }
}

export default BiDirectionalPriorityQueue;

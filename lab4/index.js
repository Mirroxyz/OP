class Node {
  constructor(item, priority, order) {
    this.item = item;
    this.priority = priority;
    this.order = order;
  }
}

class BiDirectionalPriorityQueue {
  constructor() {
    this.items = [];
    this.operationCounter = 0;
  }

  enqueue(item, priority) {
    const node = new Node(item, priority, this.operationCounter++);
    this.items.push(node);
    this._bubbleUp(this.items.length - 1);
  }

  peek(mode = 'highest') {
    if (this.items.length === 0) return undefined;
    return this._find(mode).item;
  }

  dequeue(mode = 'highest') {
    if (this.items.length === 0) return undefined;

    const index = this._findIndex(mode);
    const item = this.items[index].item;

    const lastNode = this.items.pop();
    if (index < this.items.length) {
      this.items[index] = lastNode;
      this._bubbleDown(index);
    }

    return item;
  }

  size() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  _findIndex(mode) {
    let index = 0;
    for (let i = 1; i < this.items.length; i++) {
      const compare = mode === 'highest' ? this.items[i].priority > this.items[index].priority :
                      mode === 'lowest' ? this.items[i].priority < this.items[index].priority :
                      mode === 'oldest' ? this.items[i].order < this.items[index].order :
                      mode === 'newest' ? this.items[i].order > this.items[index].order : false;
      if (compare) index = i;
    }
    return index;
  }

  _find(mode) {
    return this.items[this._findIndex(mode)];
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.items[index].priority > this.items[parentIndex].priority) {
        [this.items[index], this.items[parentIndex]] = [
          this.items[parentIndex],
          this.items[index],
        ];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  _bubbleDown(index) {
    while (true) {
      let largest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.items.length &&
        this.items[leftChild].priority > this.items[largest].priority
      ) {
        largest = leftChild;
      }

      if (
        rightChild < this.items.length &&
        this.items[rightChild].priority > this.items[largest].priority
      ) {
        largest = rightChild;
      }

      if (largest !== index) {
        [this.items[index], this.items[largest]] = [
          this.items[largest],
          this.items[index],
        ];
        index = largest;
      } else {
        break;
      }
    }
  }
}

export default BiDirectionalPriorityQueue;

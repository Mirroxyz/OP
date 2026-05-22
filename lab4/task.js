class BiDirectionalPriorityQueue {
  constructor() {
    this.queue = []; 
    this.idCounter = 0;
  }

  enqueue(item, priority) {
    this.queue.push({ id: this.idCounter++, item, priority });
  }

  peek(mode) {
    if (this.queue.length === 0) return undefined;

    if (mode === 'oldest') return this.queue[0].item;
    if (mode === 'newest') return this.queue[this.queue.length - 1].item;

    let targetItem = this.queue[0];
    
    for (let i = 1; i < this.queue.length; i++) {
      if (mode === 'highest' && this.queue[i].priority > targetItem.priority) {
        targetItem = this.queue[i];
      } else if (mode === 'lowest' && this.queue[i].priority < targetItem.priority) {
        targetItem = this.queue[i];
      }
    }

    return targetItem.item;
  }

  dequeue(mode) {
    if (this.queue.length === 0) return undefined;

    if (mode === 'oldest') {
      return this.queue.shift().item;
    }
    
    if (mode === 'newest') {
      return this.queue.pop().item;
    }

    let targetIndex = 0;
    
    for (let i = 1; i < this.queue.length; i++) {
      if (mode === 'highest' && this.queue[i].priority > this.queue[targetIndex].priority) {
        targetIndex = i;
      } else if (mode === 'lowest' && this.queue[i].priority < this.queue[targetIndex].priority) {
        targetIndex = i;
      }
    }

    return this.queue.splice(targetIndex, 1)[0].item;
  }
}

const q = new BiDirectionalPriorityQueue();

q.enqueue('Написати розрахункову', 8);
q.enqueue('Здати лабораторні', 10);
q.enqueue('Погуляти з друзями', 1);
q.enqueue('Зїздити додому', 5);

console.log("Найвищий пріоритет:", q.peek('highest'));
console.log("Найнижчий пріоритет:", q.peek('lowest'));
console.log("Найстаріший:", q.peek('oldest'));
console.log("Найновіший:", q.peek('newest'));

console.log("-----------------------------------------");

console.log("Видаляємо найнижчий:", q.dequeue('lowest'));
console.log("Видаляємо найстаріший:", q.dequeue('oldest'));

console.log("Залишилось в черзі:", q.queue.length);
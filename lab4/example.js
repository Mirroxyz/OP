import BiDirectionalPriorityQueue from './index.js';

console.log('Bi-Directional Priority Queue Examples\n');

const queue = new BiDirectionalPriorityQueue();

console.log('--- Adding tasks with priorities ---');
queue.enqueue('Database Backup', 9);
queue.enqueue('Bug Fix', 8);
queue.enqueue('Email Report', 3);
queue.enqueue('Code Review', 7);
queue.enqueue('Meeting Notes', 2);

console.log(`Queue size: ${queue.size()}\n`);

console.log('--- Peeking from different ends ---');
console.log(`Highest priority: ${queue.peek('highest')}`);
console.log(`Lowest priority: ${queue.peek('lowest')}`);
console.log(`Oldest (first added): ${queue.peek('oldest')}`);
console.log(`Newest (last added): ${queue.peek('newest')}\n`);

console.log('--- Dequeuing by priority (highest first) ---');
console.log(`Dequeued: ${queue.dequeue('highest')}`);
console.log(`Dequeued: ${queue.dequeue('highest')}`);
console.log(`Queue size now: ${queue.size()}\n`);

console.log('--- Dequeuing by insertion order ---');
queue.enqueue('New Task', 5);
console.log(`Dequeued (oldest): ${queue.dequeue('oldest')}`);
console.log(`Dequeued (newest): ${queue.dequeue('newest')}`);
console.log(`Queue size now: ${queue.size()}\n`);

console.log('--- Processing remaining items by lowest priority ---');
while (!queue.isEmpty()) {
  console.log(`Processing: ${queue.dequeue('lowest')}`);
}

console.log(`\nFinal queue size: ${queue.size()}`);
console.log('All tasks completed!');

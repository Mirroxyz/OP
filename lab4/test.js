import BiDirectionalPriorityQueue from './index.js';

function runTests() {
  console.log('Running BiDirectional Priority Queue Tests...\n');

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✓ ${testName}`);
      testsPassed++;
    } else {
      console.log(`✗ ${testName}`);
      testsFailed++;
    }
  }

  const queue = new BiDirectionalPriorityQueue();

  assert(queue.isEmpty() === true, 'Initial queue is empty');
  assert(queue.size() === 0, 'Initial queue size is 0');

  queue.enqueue('task1', 5);
  queue.enqueue('task2', 10);
  queue.enqueue('task3', 3);
  queue.enqueue('task4', 8);
  queue.enqueue('task5', 1);

  assert(queue.size() === 5, 'Queue size is 5');
  assert(queue.peek('highest') === 'task2', 'peek highest is task2 (priority 10)');
  assert(queue.peek('lowest') === 'task5', 'peek lowest is task5 (priority 1)');
  assert(queue.peek('oldest') === 'task1', 'peek oldest is task1');
  assert(queue.peek('newest') === 'task5', 'peek newest is task5');

  queue.dequeue('highest');
  assert(queue.size() === 4, 'Queue size after dequeue is 4');
  assert(queue.peek('highest') === 'task4', 'peek highest is now task4 (priority 8)');

  queue.dequeue('lowest');
  assert(queue.peek('lowest') === 'task3', 'peek lowest is now task3 (priority 3)');

  queue.dequeue('oldest');
  queue.dequeue('newest');
  assert(queue.size() === 1, 'Queue size after 4 dequeues is 1');
  assert(queue.isEmpty() === false, 'Queue is not empty');

  queue.dequeue('highest');
  assert(queue.isEmpty() === true, 'Queue is empty after final dequeue');

  const emptyQueue = new BiDirectionalPriorityQueue();
  assert(emptyQueue.peek() === undefined, 'peek on empty queue returns undefined');
  assert(emptyQueue.dequeue() === undefined, 'dequeue on empty queue returns undefined');

  console.log(`\n✓ Tests passed: ${testsPassed}`);
  console.log(`✗ Tests failed: ${testsFailed}\n`);
}

runTests();

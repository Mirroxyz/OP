# Bi-Directional Priority Queue

A priority queue implementation that supports retrieving elements based on both priority and insertion order from either end.

## Features

- **Priority-based operations**: Retrieve highest or lowest priority elements
- **Order-based operations**: Retrieve oldest (FIFO) or newest (LIFO) elements
- **Flexible dequeuing**: Choose retrieval strategy dynamically

## API

### Constructor

```javascript
const queue = new BiDirectionalPriorityQueue();
```

### Methods

- `enqueue(item, priority)` - Insert an item with associated priority
- `peek(mode)` - View next item without removal
  - `'highest'` - Highest priority item
  - `'lowest'` - Lowest priority item
  - `'oldest'` - First added item
  - `'newest'` - Last added item
- `dequeue(mode)` - Remove and return next item using same modes as peek
- `size()` - Get number of items in queue
- `isEmpty()` - Check if queue is empty

## Implementation Details

The implementation uses:
- A priority queue structure maintained with heap operations for efficient priority-based access
- Insertion order tracking with an operation counter for FIFO/LIFO access
- O(n) lookup for non-priority operations with O(log n) insertion time

## Usage

```javascript
import BiDirectionalPriorityQueue from './index.js';

const queue = new BiDirectionalPriorityQueue();
queue.enqueue('task1', 5);
queue.enqueue('task2', 10);
queue.enqueue('task3', 3);

console.log(queue.peek('highest')); // 'task2'
console.log(queue.peek('lowest'));  // 'task3'
console.log(queue.peek('oldest'));  // 'task1'
console.log(queue.peek('newest'));  // 'task3'

console.log(queue.dequeue('highest')); // 'task2'
```

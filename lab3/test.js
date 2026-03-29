import { memoize, LRUCache } from './index.js';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    testsFailed++;
  }
}

console.log('=== Running Tests ===\n');

let callCount = 0;
function add(a, b) {
  callCount++;
  return a + b;
}

console.log('Test 1: Basic memoization');
callCount = 0;
const memoizedAdd = memoize(add);
memoizedAdd(2, 3);
memoizedAdd(2, 3);
assert(callCount === 1, 'Function called once for same arguments');

console.log('\nTest 2: LRU cache eviction');
const lruCache = new LRUCache(2);
lruCache.set('a', 1);
lruCache.set('b', 2);
lruCache.get('a');
lruCache.set('c', 3);
assert(!lruCache.has('b'), 'LRU evicted least recently used');
assert(lruCache.has('a'), 'Recently accessed kept in cache');

console.log('\nTest 3: Memoization with maxSize');
callCount = 0;
const memoizedLimited = memoize(add, { maxSize: 2 });
memoizedLimited(1, 2);
memoizedLimited(3, 4);
memoizedLimited(5, 6);
memoizedLimited(1, 2);
assert(callCount === 4, 'Cache evicts when full');

console.log('\nTest 4: Cache utilities');
const memoized = memoize(add);
memoized(1, 1);
memoized(2, 2);
assert(memoized.size() === 2, 'Size() works');
memoized.clear();
assert(memoized.size() === 0, 'Clear() works');

console.log('\n=== Test Summary ===');
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All tests passed!');
} else {
  console.log('\n✗ Some tests failed!');
  process.exit(1);
}

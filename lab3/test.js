import { memoize, memoizeAdvanced, LRUCache, LFUCache, TTLCache, CustomCache } from './index.js';

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

console.log('\nTest 4: LFU cache eviction');
const lfuCache = new LFUCache(2);
lfuCache.set('a', 1);
lfuCache.set('b', 2);
lfuCache.get('a');
lfuCache.get('a');
lfuCache.set('c', 3);
assert(!lfuCache.has('b'), 'LFU evicted least frequently used');
assert(lfuCache.has('a'), 'Frequently accessed kept');

console.log('\nTest 5: LFU memoization');
callCount = 0;
const memoizedLFU = memoizeAdvanced(add, { strategy: 'lfu', maxSize: 2 });
memoizedLFU(1, 2);
memoizedLFU(3, 4);
memoizedLFU(1, 2);
memoizedLFU(5, 6);
assert(callCount === 3, 'LFU strategy works correctly');

console.log('\nTest 6: TTL cache expiration');
const ttlCache = new TTLCache(5, 50);
ttlCache.set('temp', 'value');
setTimeout(() => {
  assert(ttlCache.get('temp') === undefined, 'Entry expired after TTL');

  console.log('\nTest 7: TTL memoization');
  callCount = 0;
  const memoizedTTL = memoizeAdvanced(add, { strategy: 'ttl', ttl: 50 });
  memoizedTTL(7, 8);
  setTimeout(() => {
    memoizedTTL(7, 8);
    assert(callCount === 2, 'TTL recomputes after expiry');

    console.log('\nTest 8: Custom eviction');
    const evictOldest = (entries) => {
      let oldest = entries[0];
      for (const entry of entries) {
        if (entry.createdAt < oldest.createdAt) oldest = entry;
      }
      return oldest.key;
    };
    const customCache = new CustomCache(2, evictOldest);
    customCache.set('first', 1);
    customCache.set('second', 2);
    customCache.set('third', 3);
    assert(!customCache.has('first'), 'Custom eviction works');

    console.log('\nTest 9: Invalid strategy error');
    try {
      memoizeAdvanced(add, { strategy: 'invalid' });
      assert(false, 'Should throw for invalid strategy');
    } catch (e) {
      assert(true, 'Throws error for invalid strategy');
    }

    console.log('\nTest 10: Cache utilities');
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
  }, 100);
}, 100);

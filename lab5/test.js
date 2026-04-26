import { asyncMapCallback, asyncMapPromise } from './index.js';

console.log('Running Async Map Tests...\n');
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

console.log('--- Callback Tests ---');
asyncMapCallback(
  [1, 2, 3],
  (item, index, array, cb) => {
    setTimeout(() => cb(null, item * 2), 10);
  },
  (err, results) => {
    assert(err === null && results.length === 3, 'Callback: Basic test');
    testError();
  }
);

function testError() {
  asyncMapCallback(
    [1, 2, 3],
    (item, index, array, cb) => {
      if (item === 2) cb(new Error('Test error'), null);
      else cb(null, item * 2);
    },
    (err) => {
      assert(err?.message === 'Test error', 'Callback: Error handling');
      testPromise();
    }
  );
}

function testPromise() {
  console.log('--- Promise Tests ---');
  asyncMapPromise([1, 2, 3], async (item) => {
    return item * 2;
  }).then((results) => {
    assert(results.length === 3, 'Promise: Basic test');
    testPromiseError();
  });
}

function testPromiseError() {
  asyncMapPromise([1, 2, 3], async (item) => {
    if (item === 2) throw new Error('Test error');
    return item * 2;
  }).catch((err) => {
    assert(err.message === 'Test error', 'Promise: Error handling');
    testAbort();
  });
}

function testAbort() {
  console.log('--- Abort Tests ---');
  const controller = new AbortController();
  let callCount = 0;

  asyncMapCallback(
    [1, 2, 3, 4, 5],
    (item, i, arr, cb) => {
      callCount++;
      setTimeout(() => cb(null, item * 2), 50);
    },
    (err) => {
      assert(err?.name === 'AbortError', 'Callback: Abort');
      testPromiseAbort();
    },
    { signal: controller.signal }
  );
  setTimeout(() => controller.abort(), 75);
}

function testPromiseAbort() {
  const controller = new AbortController();
  asyncMapPromise([1, 2, 3, 4, 5], async (item) => {
    await new Promise((r) => setTimeout(r, 50));
    return item * 2;
  }, { signal: controller.signal }).catch((err) => {
    assert(err?.name === 'AbortError', 'Promise: Abort');
    console.log(`\n✓ Tests passed: ${testsPassed}`);
    console.log(`✗ Tests failed: ${testsFailed}\n`);
  });
  setTimeout(() => controller.abort(), 75);
}


import { asyncMapCallback, asyncMapPromise } from './index.js';

function runTests() {
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

  function testAsyncMapCallback() {
    return new Promise((resolve) => {
      console.log('--- Callback-based Tests ---');

      asyncMapCallback(
        [1, 2, 3],
        (item, index, array, cb) => {
          setTimeout(() => cb(null, item * 2), 10);
        },
        (err, results) => {
          assert(err === null, 'Callback: No error');
          assert(
            results.length === 3 &&
            results[0] === 2 &&
            results[1] === 4 &&
            results[2] === 6,
            'Callback: Results are [2, 4, 6]'
          );

          asyncMapCallback(
            [1, 2, 3],
            (item, index, array, cb) => {
              if (item === 2) {
                cb(new Error('Test error'), null);
              } else {
                cb(null, item * 2);
              }
            },
            (err, results) => {
              assert(err !== null && err.message === 'Test error', 'Callback: Error handling works');

              resolve();
            }
          );
        }
      );
    });
  }

  async function testAsyncMapPromise() {
    console.log('--- Promise-based Tests ---');

    const results = await asyncMapPromise([1, 2, 3], async (item) => {
      await new Promise((r) => setTimeout(r, 10));
      return item * 2;
    });

    assert(
      results.length === 3 && results[0] === 2 && results[1] === 4 && results[2] === 6,
      'Promise: Results are [2, 4, 6]'
    );

    try {
      await asyncMapPromise([1, 2, 3], async (item) => {
        if (item === 2) throw new Error('Test error');
        return item * 2;
      });
      assert(false, 'Promise: Error handling should reject');
    } catch (err) {
      assert(err.message === 'Test error', 'Promise: Error handling works');
    }
  }

  function testAbortSignal() {
    return new Promise((resolve) => {
      console.log('--- Abort Signal Tests ---');

      const controller = new AbortController();
      let callbackCount = 0;

      asyncMapCallback(
        [1, 2, 3, 4, 5],
        (item, index, array, cb) => {
          callbackCount++;
          setTimeout(() => cb(null, item * 2), 50);
        },
        (err, results) => {
          assert(err?.name === 'AbortError', 'Callback: Abort error caught');
          assert(callbackCount < 5, 'Callback: Not all items processed after abort');

          testPromiseAbort();
        },
        { signal: controller.signal }
      );

      setTimeout(() => controller.abort(), 75);
    });

    async function testPromiseAbort() {
      const controller = new AbortController();

      try {
        const promise = asyncMapPromise([1, 2, 3, 4, 5], async (item) => {
          await new Promise((r) => setTimeout(r, 50));
          return item * 2;
        }, { signal: controller.signal });

        setTimeout(() => controller.abort(), 75);
        await promise;
        assert(false, 'Promise: Abort should reject');
      } catch (err) {
        assert(err?.name === 'AbortError', 'Promise: Abort error caught');
      }
    }
  }

  async function runAllTests() {
    await testAsyncMapCallback();
    await testAsyncMapPromise();
    await testAbortSignal();

    console.log(`\n✓ Tests passed: ${testsPassed}`);
    console.log(`✗ Tests failed: ${testsFailed}\n`);
  }

  runAllTests();
}

runTests();

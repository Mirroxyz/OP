import { asyncMapCallback, asyncMapPromise } from './index.js';

console.log('Async Map Examples\n');

console.log('--- Callback-based ---');
asyncMapCallback(
  [1, 2, 3],
  (item, index, array, cb) => {
    setTimeout(() => cb(null, item * 10), 50);
  },
  (err, results) => {
    if (err) {
      console.error('Error:', err.message);
    } else {
      console.log('Results:', results);
    }
    demoPromise();
  }
);

async function demoPromise() {
  console.log('\n--- Promise with async/await ---');
  try {
    const results = await asyncMapPromise([1, 2, 3, 4], async (num) => {
      await new Promise((r) => setTimeout(r, 50));
      return num * num;
    });
    console.log('Results:', results);
  } catch (err) {
    console.error('Error:', err.message);
  }
  demoCancellation();
}

async function demoCancellation() {
  console.log('\n--- Cancellation with AbortController ---');
  const controller = new AbortController();

  try {
    const promise = asyncMapPromise([1, 2, 3, 4, 5], async (num) => {
      await new Promise((r) => setTimeout(r, 100));
      return num * 2;
    }, { signal: controller.signal });
    setTimeout(() => controller.abort(), 150);
    await promise;
  } catch (err) {
    console.log(`Aborted: ${err.name}`);
  }

  demoError();
}

function demoError() {
  console.log('\n--- Error Handling ---');
  asyncMapCallback(
    [1, 2, 3],
    (item, index, array, cb) => {
      if (item === 2) {
        cb(new Error('Failed at item 2'), null);
      } else {
        cb(null, item * 5);
      }
    },
    (err, results) => {
      if (err) {
        console.log(`Error: ${err.message}`);
      } else {
        console.log('Results:', results);
      }
    }
  );
}


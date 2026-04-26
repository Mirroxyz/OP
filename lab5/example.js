import { asyncMapCallback, asyncMapPromise } from './index.js';

console.log('Async Map Examples\n');

console.log('--- Callback-based Example ---');
asyncMapCallback(
  ['apple', 'banana', 'cherry'],
  (item, index, array, callback) => {
    setTimeout(() => {
      callback(null, `${item} (${index + 1})`);
    }, 100);
  },
  (err, results) => {
    if (err) {
      console.error('Error:', err.message);
    } else {
      console.log('Results:', results);
    }
    demoPromiseVersion();
  }
);

async function demoPromiseVersion() {
  console.log('\n--- Promise-based Example (async/await) ---');
  try {
    const results = await asyncMapPromise([1, 2, 3, 4, 5], async (num, index) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return num * num;
    });
    console.log('Squared numbers:', results);
  } catch (err) {
    console.error('Error:', err.message);
  }

  demoCancellation();
}

async function demoCancellation() {
  console.log('\n--- Cancellation Example ---');
  const controller = new AbortController();

  const promise = asyncMapPromise([1, 2, 3, 4, 5], async (num) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return num * 10;
  }, { signal: controller.signal });

  setTimeout(() => {
    console.log('Aborting after 300ms...');
    controller.abort();
  }, 300);

  try {
    await promise;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Operation was cancelled');
    } else {
      console.error('Error:', err.message);
    }
  }

  demoCallbackError();
}

function demoCallbackError() {
  console.log('\n--- Error Handling (Callback) ---');
  asyncMapCallback(
    [1, 2, 3],
    (item, index, array, callback) => {
      if (item === 2) {
        callback(new Error('Processing failed for item 2'), null);
      } else {
        callback(null, item * 100);
      }
    },
    (err, results) => {
      if (err) {
        console.log('Error caught:', err.message);
      } else {
        console.log('Results:', results);
      }

      demoPromiseError();
    }
  );
}

async function demoPromiseError() {
  console.log('\n--- Error Handling (Promise) ---');
  try {
    const results = await asyncMapPromise(['a', 'b', 'c'], async (item) => {
      if (item === 'b') {
        throw new Error('Cannot process b');
      }
      return item.toUpperCase();
    });
    console.log('Results:', results);
  } catch (err) {
    console.log('Error caught:', err.message);
  }

  demoAdvanced();
}

async function demoAdvanced() {
  console.log('\n--- Advanced: API calls simulation ---');
  const userIds = [1, 2, 3];

  try {
    const users = await asyncMapPromise(userIds, async (id, index) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return {
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
      };
    });

    console.log('Fetched users:');
    users.forEach((user) => {
      console.log(`  ${user.name} (${user.email})`);
    });
  } catch (err) {
    console.error('Failed to fetch users:', err.message);
  }
}

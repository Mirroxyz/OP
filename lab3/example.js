import { memoize, memoizeAdvanced } from './index.js';

console.log('=== Memoization Examples ===\n');

console.log('Example 1: Fibonacci with LRU');
let fibCalls = 0;
function fibonacci(n) {
  fibCalls++;
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoizedFib = memoize(fibonacci);
console.time('First call');
console.log('Result:', memoizedFib(35));
console.timeEnd('First call');
console.log('Function calls:', fibCalls);

fibCalls = 0;
console.time('Second call');
console.log('Result:', memoizedFib(35));
console.timeEnd('Second call');
console.log('Function calls:', fibCalls);

console.log('\n\nExample 2: LFU strategy');
let apiCalls = 0;
function apiCall(endpoint) {
  apiCalls++;
  console.log(`  API call to ${endpoint}`);
  return `Data from ${endpoint}`;
}

const memoizedAPI = memoizeAdvanced(apiCall, { strategy: 'lfu', maxSize: 3 });
console.log(memoizedAPI('/users'));
console.log(memoizedAPI('/posts'));
console.log(memoizedAPI('/users'));
console.log(memoizedAPI('/users'));
console.log(memoizedAPI('/comments'));
console.log(memoizedAPI('/tags'));
console.log('Total API calls:', apiCalls);

console.log('\n\nExample 3: TTL strategy');
let weatherCalls = 0;
function getWeather(city) {
  weatherCalls++;
  console.log(`  Fetching weather for ${city}`);
  return `${Math.floor(Math.random() * 30)}°C`;
}

const memoizedWeather = memoizeAdvanced(getWeather, {
  strategy: 'ttl',
  ttl: 1000,
});

console.log('Kyiv:', memoizedWeather('Kyiv'));
console.log('Kyiv (cached):', memoizedWeather('Kyiv'));

setTimeout(() => {
  console.log('Kyiv (after expiry):', memoizedWeather('Kyiv'));
  console.log('Total weather calls:', weatherCalls);

  console.log('\n\nExample 4: Custom eviction');
  let dbCalls = 0;
  function queryDB(query) {
    dbCalls++;
    console.log(`  Executing: ${query}`);
    return `Result for ${query}`;
  }

  const evictLeastAccessed = (entries) => {
    let min = entries[0];
    for (const e of entries) {
      if (e.accessCount < min.accessCount) min = e;
    }
    return min.key;
  };

  const memoizedQuery = memoizeAdvanced(queryDB, {
    strategy: 'custom',
    maxSize: 3,
    evictionFn: evictLeastAccessed,
  });

  console.log(memoizedQuery('SELECT * FROM users'));
  console.log(memoizedQuery('SELECT * FROM posts'));
  console.log(memoizedQuery('SELECT * FROM users'));
  console.log(memoizedQuery('SELECT * FROM users'));
  console.log(memoizedQuery('SELECT * FROM comments'));
  console.log(memoizedQuery('SELECT * FROM tags'));
  console.log('Total DB calls:', dbCalls);

  console.log('\n=== Examples Complete ===');
}, 1200);

import { memoize } from './index.js';

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

console.log('\n\nExample 2: LRU with size limit');
let computeCalls = 0;
function compute(x, y) {
  computeCalls++;
  console.log(`  Computing ${x} + ${y}`);
  return x + y;
}

const memoizedCompute = memoize(compute, { maxSize: 3 });
console.log('Result:', memoizedCompute(1, 2));
console.log('Result:', memoizedCompute(3, 4));
console.log('Result:', memoizedCompute(5, 6));
console.log('Result:', memoizedCompute(1, 2));
console.log('Result:', memoizedCompute(7, 8));
console.log('Total calls:', computeCalls);

console.log('\n=== Examples Complete ===');

/**
 * Lab 9: Logging Decorator Examples
 */

import { 
  Logger, 
  LogLevel, 
  LogDecorator, 
  ConditionalLogger,
  PerformanceLogger,
  PerformanceDecorator
} from './index.js';

console.log('📝 Logging Decorator Examples\n');
console.log('═'.repeat(50));

// Example 1: Basic Logger
console.log('\n=== Example 1: Basic Logger ===\n');
(() => {
  const logger = new Logger(LogLevel.INFO);
  
  logger.log(LogLevel.DEBUG, 'This is debug - will not show');
  logger.log(LogLevel.INFO, 'This is info', { user: 'Alice', action: 'login' });
  logger.log(LogLevel.ERROR, 'This is error', { code: 500 });
})();

// Example 2: LogDecorator with Sync Function
console.log('\n=== Example 2: LogDecorator (Sync) ===\n');
(async () => {
  const logger = new Logger(LogLevel.INFO);
  const decorator = new LogDecorator(logger);

  function add(a, b) {
    return a + b;
  }

  const decoratedAdd = decorator.decorate(add, {
    level: LogLevel.INFO,
    name: 'add'
  });

  console.log('Result:', decoratedAdd(3, 5));
})();

// Example 3: LogDecorator with Async Function
console.log('\n=== Example 3: LogDecorator (Async) ===\n');
(async () => {
  const logger = new Logger(LogLevel.INFO);
  const decorator = new LogDecorator(logger);

  async function fetchData(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { id, data: 'Sample data' };
  }

  const decoratedFetch = decorator.decorate(fetchData, {
    level: LogLevel.INFO,
    name: 'fetchData'
  });

  const result = await decoratedFetch(123);
  console.log('Result:', result);
})();

// Example 4: ConditionalLogger
console.log('\n=== Example 4: ConditionalLogger ===\n');
(() => {
  const logger = new ConditionalLogger(LogLevel.INFO);
  
  // Only log errors
  logger.addCondition((level, msg, data) => level >= LogLevel.ERROR);
  
  logger.log(LogLevel.INFO, 'This won\'t be logged');
  logger.log(LogLevel.ERROR, 'This error will be logged', { code: 'ERR_001' });
})();

// Example 5: Custom Formatter
console.log('\n=== Example 5: Custom Formatter ===\n');
(() => {
  const logger = new Logger(LogLevel.INFO);
  
  logger.registerFormatter('minimal', (entry) => {
    return `[${entry.level}] ${entry.message}`;
  });

  logger.log(LogLevel.INFO, 'Simple message', { detail: 'value' }, 'minimal');
  logger.log(LogLevel.INFO, 'JSON message', { detail: 'value' }, 'json');
})();

// Example 6: PerformanceLogger
console.log('\n=== Example 6: PerformanceLogger ===\n');
(async () => {
  const logger = new PerformanceLogger(LogLevel.INFO);
  const decorator = new LogDecorator(logger);

  function slowFunction(n) {
    let sum = 0;
    for (let i = 0; i < n * 1000000; i++) {
      sum += i;
    }
    return sum;
  }

  const decorator2 = new PerformanceDecorator(logger);
  const decoratedSlow = decorator2.decorate(slowFunction, {
    name: 'slowFunction',
    logThreshold: 0
  });

  console.log('Calling slowFunction(2)...');
  decoratedSlow(2);
  
  const summary = logger.getPerformanceSummary();
  console.log('Performance Summary:', summary);
})();

// Example 7: Multiple Logging Levels
console.log('\n=== Example 7: Multiple Log Levels ===\n');
(() => {
  const logger = new Logger(LogLevel.DEBUG);
  
  logger.log(LogLevel.DEBUG, 'Debug message - detailed info');
  logger.log(LogLevel.INFO, 'Info message - general info');
  logger.log(LogLevel.ERROR, 'Error message - something went wrong');
})();

// Example 8: Function Error Logging
console.log('\n=== Example 8: Error Handling ===\n');
(async () => {
  const logger = new Logger(LogLevel.INFO);
  const decorator = new LogDecorator(logger);

  function divideByZero(a, b) {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }

  const decoratedDivide = decorator.decorate(divideByZero, {
    name: 'divideByZero',
    logErrors: true
  });

  try {
    decoratedDivide(10, 0);
  } catch (error) {
    console.log('Error caught:', error.message);
  }
})();

console.log('\n' + '═'.repeat(50));
console.log('\n✅ All examples completed!\n');

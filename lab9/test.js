/**
 * Lab 9: Logging Decorator Tests
 */

import {
  Logger,
  LogLevel,
  LogDecorator,
  ConditionalLogger,
  FileLogger,
  PerformanceLogger,
  PerformanceDecorator
} from './index.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

console.log('🧪 Lab 9: Logging Decorator Tests\n');
console.log('═'.repeat(50));

// Test 1: LogLevel enum
test('LogLevel enum has correct values', () => {
  assert(LogLevel.DEBUG === 0, 'DEBUG should be 0');
  assert(LogLevel.INFO === 1, 'INFO should be 1');
  assert(LogLevel.ERROR === 2, 'ERROR should be 2');
  assert(LogLevel.NONE === 3, 'NONE should be 3');
});

// Test 2: Logger basic functionality
test('Logger creates instance with correct level', () => {
  const logger = new Logger(LogLevel.INFO);
  assert(logger.level === LogLevel.INFO, 'Level should be set');
  assert(Array.isArray(logger.outputs), 'Outputs should be array');
});

// Test 3: Logger filters by level
test('Logger filters messages by level', () => {
  const logs = [];
  const logger = new Logger(LogLevel.INFO);
  logger.addOutput((level, msg) => logs.push({ level, msg }));
  
  logger.log(LogLevel.DEBUG, 'debug message');
  logger.log(LogLevel.INFO, 'info message');
  logger.log(LogLevel.ERROR, 'error message');
  
  assert(logs.length === 2, 'Should only log INFO and ERROR');
  assert(logs[0].msg === 'info message', 'First should be INFO');
  assert(logs[1].msg === 'error message', 'Second should be ERROR');
});

// Test 4: Logger formatters
test('Logger supports multiple formatters', () => {
  const logger = new Logger(LogLevel.INFO);
  assert(typeof logger.registerFormatter === 'function', 'Should have registerFormatter');
  
  let formatted = '';
  logger.addOutput((level, msg, data, result) => {
    formatted = result;
  });
  
  logger.log(LogLevel.INFO, 'test', { key: 'value' }, 'text');
  assert(formatted.includes('test'), 'Should format message');
});

// Test 5: LogDecorator on sync function
test('LogDecorator decorates sync functions', () => {
  const logs = [];
  const logger = new Logger(LogLevel.INFO);
  logger.addOutput((level, msg) => logs.push(msg));
  
  const decorator = new LogDecorator(logger);
  
  function add(a, b) {
    return a + b;
  }
  
  const decorated = decorator.decorate(add);
  const result = decorated(2, 3);
  
  assert(result === 5, 'Function should return correct result');
  assert(logs.length > 0, 'Should log function call');
});

// Test 6: LogDecorator with errors
test('LogDecorator logs errors', () => {
  const logs = [];
  const logger = new Logger(LogLevel.ERROR);
  logger.addOutput((level, msg) => {
    if (level === LogLevel.ERROR) logs.push(msg);
  });
  
  const decorator = new LogDecorator(logger);
  
  function throwError() {
    throw new Error('Test error');
  }
  
  const decorated = decorator.decorate(throwError);
  
  try {
    decorated();
  } catch (error) {
    // Expected
  }
  
  assert(logs.length > 0, 'Should log error');
});

// Test 7: LogDecorator on async function
test('LogDecorator decorates async functions', async () => {
  const logs = [];
  const logger = new Logger(LogLevel.INFO);
  logger.addOutput((level, msg) => logs.push(msg));
  
  const decorator = new LogDecorator(logger);
  
  async function asyncAdd(a, b) {
    await new Promise(r => setTimeout(r, 10));
    return a + b;
  }
  
  const decorated = decorator.decorate(asyncAdd);
  const result = await decorated(2, 3);
  
  assert(result === 5, 'Async function should return correct result');
  assert(logs.length > 0, 'Should log async call');
});

// Test 8: ConditionalLogger with predicates
test('ConditionalLogger filters with predicates', () => {
  const logs = [];
  const logger = new ConditionalLogger(LogLevel.DEBUG);
  logger.addOutput((level, msg) => logs.push(msg));
  
  // Only log errors
  logger.addCondition((level) => level >= LogLevel.ERROR);
  
  logger.log(LogLevel.INFO, 'info');
  logger.log(LogLevel.ERROR, 'error');
  
  assert(logs.length === 1, 'Should only log ERROR');
  assert(logs[0] === 'error', 'Should log error message');
});

// Test 9: ConditionalLogger multiple predicates
test('ConditionalLogger applies all predicates', () => {
  const logs = [];
  const logger = new ConditionalLogger(LogLevel.DEBUG);
  logger.addOutput((level, msg) => logs.push(msg));
  
  logger.addCondition((level) => level >= LogLevel.INFO);
  logger.addCondition((level, msg) => msg.includes('important'));
  
  logger.log(LogLevel.INFO, 'important message');
  logger.log(LogLevel.INFO, 'regular message');
  
  assert(logs.length === 1, 'Should only log important messages');
});

// Test 10: FileLogger creates log files
test('FileLogger creates log files', () => {
  const logDir = path.join(__dirname, 'test-logs');
  const logFile = path.join(logDir, 'test.log');
  
  const logger = new FileLogger(LogLevel.INFO, logFile);
  logger.log(LogLevel.INFO, 'test message', { key: 'value' });
  
  assert(fs.existsSync(logFile), 'Log file should be created');
  
  const content = fs.readFileSync(logFile, 'utf-8');
  assert(content.includes('test message'), 'Log file should contain message');
  
  // Cleanup
  fs.unlinkSync(logFile);
  if (fs.existsSync(logDir)) fs.rmdirSync(logDir);
});

// Test 11: FileLogger appends to existing files
test('FileLogger appends to existing log files', () => {
  const logDir = path.join(__dirname, 'test-logs-append');
  const logFile = path.join(logDir, 'append.log');
  
  const logger = new FileLogger(LogLevel.INFO, logFile);
  logger.log(LogLevel.INFO, 'first message');
  logger.log(LogLevel.INFO, 'second message');
  
  const content = fs.readFileSync(logFile, 'utf-8');
  assert(content.includes('first message'), 'Should have first message');
  assert(content.includes('second message'), 'Should have second message');
  
  // Cleanup
  fs.unlinkSync(logFile);
  if (fs.existsSync(logDir)) fs.rmdirSync(logDir);
});

// Test 12: PerformanceLogger tracks metrics
test('PerformanceLogger tracks execution metrics', () => {
  const logger = new PerformanceLogger(LogLevel.INFO);
  
  logger.logWithTime(LogLevel.INFO, 'function: testFunc', 15.5);
  logger.logWithTime(LogLevel.INFO, 'function: testFunc', 20.3);
  
  const summary = logger.getPerformanceSummary('testFunc');
  assert(summary.calls === 2, 'Should track calls');
  assert(parseFloat(summary.totalTime) > 30, 'Should track total time');
});

// Test 13: PerformanceLogger min/max times
test('PerformanceLogger tracks min and max times', () => {
  const logger = new PerformanceLogger(LogLevel.INFO);
  
  logger.logWithTime(LogLevel.INFO, 'function: perfFunc', 5.0);
  logger.logWithTime(LogLevel.INFO, 'function: perfFunc', 10.0);
  logger.logWithTime(LogLevel.INFO, 'function: perfFunc', 8.0);
  
  const summary = logger.getPerformanceSummary('perfFunc');
  assert(parseFloat(summary.minTime) === 5.0, 'Should track min time');
  assert(parseFloat(summary.maxTime) === 10.0, 'Should track max time');
});

// Test 14: PerformanceLogger records errors
test('PerformanceLogger records errors', () => {
  const logger = new PerformanceLogger(LogLevel.INFO);
  
  logger.recordError('errorFunc');
  logger.recordError('errorFunc');
  
  const summary = logger.getPerformanceSummary('errorFunc');
  assert(summary.errors === 2, 'Should track errors');
});

// Test 15: PerformanceDecorator sync function
test('PerformanceDecorator profiles sync functions', () => {
  const logger = new PerformanceLogger(LogLevel.INFO);
  const decorator = new PerformanceDecorator(logger);
  
  function slowAdd(a, b) {
    let sum = a + b;
    for (let i = 0; i < 1000000; i++) sum += 0;
    return sum;
  }
  
  const decorated = decorator.decorate(slowAdd, { name: 'slowAdd' });
  const result = decorated(2, 3);
  
  assert(result === 5, 'Should return correct result');
  const summary = logger.getPerformanceSummary('slowAdd');
  assert(summary.calls === 1, 'Should track call');
});

// Test 16: PerformanceDecorator async function
test('PerformanceDecorator profiles async functions', async () => {
  const logger = new PerformanceLogger(LogLevel.INFO);
  const decorator = new PerformanceDecorator(logger);
  
  async function slowAsync(n) {
    await new Promise(r => setTimeout(r, 20));
    return n * 2;
  }
  
  const decorated = decorator.decorate(slowAsync, { name: 'slowAsync' });
  const result = await decorated(5);
  
  assert(result === 10, 'Should return correct result');
  const summary = logger.getPerformanceSummary('slowAsync');
  assert(summary.calls === 1, 'Should track call');
});

// Test 17: PerformanceDecorator error handling
test('PerformanceDecorator tracks errors in decorated functions', async () => {
  const logger = new PerformanceLogger(LogLevel.INFO);
  const decorator = new PerformanceDecorator(logger);
  
  function throwFunc() {
    throw new Error('Test error');
  }
  
  const decorated = decorator.decorate(throwFunc, { name: 'throwFunc' });
  
  try {
    decorated();
  } catch (error) {
    // Expected
  }
  
  const summary = logger.getPerformanceSummary('throwFunc');
  assert(summary.errors === 1, 'Should track error');
});

// Test 18: Multiple outputs
test('Logger supports multiple output destinations', () => {
  const logger = new Logger(LogLevel.INFO);
  
  const output1 = [];
  const output2 = [];
  
  logger.addOutput((level, msg) => output1.push(msg));
  logger.addOutput((level, msg) => output2.push(msg));
  
  logger.log(LogLevel.INFO, 'message');
  
  assert(output1.length === 1, 'First output should receive message');
  assert(output2.length === 1, 'Second output should receive message');
});

// Test 19: JSON formatter
test('Logger provides JSON formatter', () => {
  const logger = new Logger(LogLevel.INFO);
  let result = '';
  
  logger.addOutput((level, msg, data, formatted) => {
    result = formatted;
  });
  
  logger.log(LogLevel.INFO, 'test', { key: 'value' }, 'json');
  
  try {
    JSON.parse(result);
    assert(true, 'Should produce valid JSON');
  } catch {
    assert(false, 'Should produce valid JSON');
  }
});

// Test 20: Clear performance metrics
test('PerformanceLogger can clear metrics', () => {
  const logger = new PerformanceLogger(LogLevel.INFO);
  
  logger.logWithTime(LogLevel.INFO, 'function: func', 10.0);
  
  let summary = logger.getPerformanceSummary('func');
  assert(summary !== null, 'Should have metrics');
  
  logger.clearMetrics();
  summary = logger.getPerformanceSummary('func');
  assert(summary === null, 'Metrics should be cleared');
});

console.log('\n' + '═'.repeat(50));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('✅ All tests passed!\n');
} else {
  console.log(`❌ ${failed} test(s) failed\n`);
  process.exit(1);
}

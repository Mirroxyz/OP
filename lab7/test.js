import { Observable, EventEmitter, Subject, BehaviorSubject } from './index.js';

async function runTests() {
  console.log('Running Reactive Communication Tests...\n');

  let testsPassed = 0;
  let testsFailed = 0;

  async function assert(condition, testName) {
    if (condition) {
      console.log(`✓ ${testName}`);
      testsPassed++;
    } else {
      console.log(`✗ ${testName}`);
      testsFailed++;
    }
  }

  // Test 1: EventEmitter basic emit
  const emitter1 = new EventEmitter();
  let called = false;
  emitter1.on('test', () => { called = true; });
  emitter1.emit('test');
  await assert(called === true, 'EventEmitter emit triggers handler');

  // Test 2: EventEmitter multiple listeners
  const emitter2 = new EventEmitter();
  let count = 0;
  emitter2.on('event', () => { count++; });
  emitter2.on('event', () => { count++; });
  emitter2.on('event', () => { count++; });
  emitter2.emit('event');
  await assert(count === 3, 'EventEmitter multiple listeners all called');

  // Test 3: EventEmitter unsubscribe
  const emitter3 = new EventEmitter();
  let callCount = 0;
  const unsub = emitter3.on('event', () => { callCount++; });
  emitter3.emit('event');
  unsub();
  emitter3.emit('event');
  await assert(callCount === 1, 'EventEmitter unsubscribe prevents future calls');

  // Test 4: Observable with next/complete
  const observable1 = new Observable((observer) => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
  });

  let receivedValues = [];
  let completed = false;
  observable1.subscribe({
    next: (v) => { receivedValues.push(v); },
    complete: () => { completed = true; },
  });
  await assert(
    receivedValues.length === 3 && completed === true,
    'Observable delivers values and completes'
  );

  // Test 5: Observable map transformation
  const observable2 = new Observable((observer) => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
  });

  let mappedValues = [];
  observable2
    .map((x) => x * 2)
    .subscribe((v) => { mappedValues.push(v); });
  await assert(
    mappedValues[0] === 2 && mappedValues[1] === 4 && mappedValues[2] === 6,
    'Observable map transforms values correctly'
  );

  // Test 6: Observable filter
  const observable3 = new Observable((observer) => {
    [1, 2, 3, 4, 5].forEach((n) => observer.next(n));
  });

  let filtered = [];
  observable3
    .filter((x) => x > 2)
    .subscribe((v) => { filtered.push(v); });
  await assert(
    filtered.length === 3 && filtered[0] === 3,
    'Observable filter works correctly'
  );

  // Test 7: Subject basic messaging
  const subject1 = new Subject();
  let subjectReceived = [];
  subject1.subscribe((v) => { subjectReceived.push(v); });
  subject1.next('message1');
  subject1.next('message2');
  await assert(
    subjectReceived.length === 2 && subjectReceived[0] === 'message1',
    'Subject broadcasts to subscribers'
  );

  // Test 8: Subject multiple observers
  const subject2 = new Subject();
  let observer1Count = 0;
  let observer2Count = 0;
  subject2.subscribe(() => { observer1Count++; });
  subject2.subscribe(() => { observer2Count++; });
  subject2.next('data1');
  subject2.next('data2');
  await assert(
    observer1Count === 2 && observer2Count === 2,
    'Subject delivers to multiple observers independently'
  );

  // Test 9: BehaviorSubject initial value
  const behaviorSubject1 = new BehaviorSubject('initial');
  let behValues = [];
  behValues.push('observer_created');
  behaviorSubject1.subscribe((v) => { behValues.push(v); });
  await assert(
    behValues[1] === 'initial',
    'BehaviorSubject emits initial value to new subscriber'
  );

  // Test 10: BehaviorSubject current value
  const behaviorSubject2 = new BehaviorSubject(10);
  behaviorSubject2.next(20);
  behaviorSubject2.next(30);
  let lastValue = null;
  behaviorSubject2.subscribe((v) => { lastValue = v; });
  await assert(
    lastValue === 30,
    'BehaviorSubject gives latest value to new subscriber'
  );

  // Test 11: Subject unsubscribe
  const subject3 = new Subject();
  let sub1Count = 0;
  let sub2Count = 0;
  const sub1 = subject3.subscribe(() => { sub1Count++; });
  const sub2 = subject3.subscribe(() => { sub2Count++; });
  subject3.next('1');
  sub1.unsubscribe();
  subject3.next('2');
  await assert(
    sub1Count === 1 && sub2Count === 2,
    'Subject unsubscribe removes specific observer'
  );

  // Test 12: Observable with error
  const observable4 = new Observable((observer) => {
    observer.next(1);
    observer.error(new Error('Test error'));
  });

  let errorCaught = false;
  observable4.subscribe({
    next: () => {},
    error: () => { errorCaught = true; },
  });
  await assert(errorCaught === true, 'Observable error handler is called');

  // Test 13: Chain operations
  const observable5 = new Observable((observer) => {
    [1, 2, 3, 4, 5].forEach((n) => observer.next(n));
  });

  let chained = [];
  observable5
    .filter((x) => x % 2 === 0)
    .map((x) => x * 3)
    .subscribe((v) => { chained.push(v); });
  await assert(
    chained.length === 2 && chained[0] === 6 && chained[1] === 12,
    'Chaining filter and map works correctly'
  );

  // Test 14: EventEmitter once
  const emitter4 = new EventEmitter();
  let onceCount = 0;
  emitter4.once('event', () => { onceCount++; });
  emitter4.emit('event');
  emitter4.emit('event');
  emitter4.emit('event');
  await assert(onceCount === 1, 'EventEmitter once fires exactly once');

  // Test 15: Observable tap side effect
  const observable6 = new Observable((observer) => {
    observer.next(5);
  });

  let tapSideEffect = false;
  let tapResult = null;
  observable6
    .tap(() => { tapSideEffect = true; })
    .subscribe((v) => { tapResult = v; });
  await assert(
    tapSideEffect === true && tapResult === 5,
    'Observable tap executes side effect without changing value'
  );

  // Test 16: Subject error handling
  const subject4 = new Subject();
  let errorMessage = null;
  subject4.subscribe({
    next: () => {},
    error: (err) => { errorMessage = err.message; },
  });
  subject4.error(new Error('Test error'));
  await assert(
    errorMessage === 'Test error',
    'Subject error handler receives error'
  );

  // Test 17: EventEmitter listenerCount
  const emitter5 = new EventEmitter();
  emitter5.on('event', () => {});
  emitter5.on('event', () => {});
  const count17 = emitter5.listenerCount('event');
  await assert(count17 === 2, 'EventEmitter listenerCount returns correct value');

  // Test 18: Observable with promise
  const observable7 = new Observable((observer) => {
    observer.next(42);
    observer.complete();
  });

  const promiseResult = await observable7.toPromise();
  await assert(promiseResult === 42, 'Observable toPromise resolves with last value');

  // Test 19: BehaviorSubject error propagation
  const behaviorSubject3 = new BehaviorSubject(1);
  let behError = null;
  behaviorSubject3.subscribe({
    next: () => {},
    error: (err) => { behError = err.message; },
  });
  behaviorSubject3.error(new Error('BehaviorSubject error'));
  await assert(
    behError === 'BehaviorSubject error',
    'BehaviorSubject propagates errors'
  );

  // Test 20: Performance - many observers
  const subject5 = new Subject();
  let totalCalls = 0;
  for (let i = 0; i < 100; i++) {
    subject5.subscribe(() => { totalCalls++; });
  }
  subject5.next('message');
  await assert(totalCalls === 100, 'Subject handles 100 concurrent observers');

  console.log(`\n✓ Tests passed: ${testsPassed}`);
  console.log(`✗ Tests failed: ${testsFailed}\n`);
}

runTests().catch(console.error);

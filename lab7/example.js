import { Observable, EventEmitter, Subject, BehaviorSubject } from './index.js';

/**
 * Приклад 1: Базовий EventEmitter
 */
function example1_EventEmitter() {
  console.log('=== Example 1: Basic EventEmitter ===\n');

  const emitter = new EventEmitter();

  // Кілька слухачів на одну подію
  emitter.on('message', (msg) => {
    console.log(`Listener 1 received: ${msg}`);
  });

  emitter.on('message', (msg) => {
    console.log(`Listener 2 received: ${msg}`);
  });

  emitter.on('message', (msg) => {
    console.log(`Listener 3 received: ${msg}`);
  });

  console.log('Emitting "Hello World"...');
  emitter.emit('message', 'Hello World');

  console.log(`\nTotal listeners: ${emitter.listenerCount('message')}\n`);
}

/**
 * Приклад 2: Subject для реактивної комунікації
 */
function example2_Subject() {
  console.log('=== Example 2: Subject - Reactive Communication ===\n');

  const messageSubject = new Subject();

  // Перший спостерігач
  const subscription1 = messageSubject.subscribe({
    next: (msg) => console.log(`Observer 1: ${msg}`),
    error: (err) => console.error('Observer 1 Error:', err),
    complete: () => console.log('Observer 1 completed'),
  });

  // Другий спостерігач
  const subscription2 = messageSubject.subscribe({
    next: (msg) => console.log(`Observer 2: ${msg}`),
    error: (err) => console.error('Observer 2 Error:', err),
    complete: () => console.log('Observer 2 completed'),
  });

  console.log('Sending messages...\n');
  messageSubject.next('First message');
  messageSubject.next('Second message');
  messageSubject.next('Third message');

  console.log('\nUnsubscribing Observer 1...\n');
  subscription1.unsubscribe();

  console.log('Sending another message...\n');
  messageSubject.next('Fourth message (only Observer 2)');

  console.log();
}

/**
 * Приклад 3: BehaviorSubject з початковим значенням
 */
function example3_BehaviorSubject() {
  console.log('=== Example 3: BehaviorSubject with Initial Value ===\n');

  const countSubject = new BehaviorSubject(0);

  console.log('Creating first observer...');
  const sub1 = countSubject.subscribe((count) => {
    console.log(`Observer 1: Count = ${count}`);
  });

  console.log('\nSending new values...');
  countSubject.next(1);
  countSubject.next(2);

  console.log('\nCreating second observer (gets last value)...');
  const sub2 = countSubject.subscribe((count) => {
    console.log(`Observer 2: Count = ${count}`);
  });

  console.log('\nSending more values...');
  countSubject.next(3);
  countSubject.next(4);

  console.log();
}

/**
 * Приклад 4: Observable з map, filter, tap
 */
function example4_Observable() {
  console.log('=== Example 4: Observable with Transformations ===\n');

  const numbers = new Observable((observer) => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.next(4);
    observer.next(5);
    observer.complete();
  });

  console.log('Filtering (> 2), mapping (*10), tapping...\n');

  numbers
    .filter((n) => n > 2)
    .tap((n) => console.log(`  Tap: Processing ${n}`))
    .map((n) => n * 10)
    .subscribe({
      next: (result) => console.log(`  Result: ${result}`),
      complete: () => console.log('\nCompleted'),
    });

  console.log();
}

/**
 * Приклад 5: Entity Communication з Subject'ами
 */
function example5_EntityCommunication() {
  console.log('=== Example 5: Entity Communication System ===\n');

  // Глобальні каналі комунікації
  const eventBus = new Subject();
  const userUpdateBus = new BehaviorSubject({ id: 0, name: 'Guest' });

  // Сутність 1: User Service
  class UserService {
    constructor() {
      this.currentUser = null;
      userUpdateBus.subscribe((user) => {
        this.currentUser = user;
      });
    }

    getUser() {
      return this.currentUser;
    }
  }

  // Сутність 2: Notification Service
  class NotificationService {
    constructor() {
      eventBus.subscribe((event) => {
        if (event.type === 'user_update') {
          console.log(`  📢 Notification: User updated to ${event.data.name}`);
        }
      });
    }
  }

  // Сутність 3: Logger Service
  class LoggerService {
    constructor() {
      eventBus.subscribe((event) => {
        console.log(`  📝 Log: Event ${event.type} occurred`);
      });
    }
  }

  // Ініціалізуємо сервіси
  const userService = new UserService();
  const notificationService = new NotificationService();
  const loggerService = new LoggerService();

  console.log('Updating user...\n');
  const newUser = { id: 1, name: 'Alice' };
  userUpdateBus.next(newUser);
  eventBus.next({ type: 'user_update', data: newUser });

  console.log('\nUpdating user again...\n');
  const anotherUser = { id: 2, name: 'Bob' };
  userUpdateBus.next(anotherUser);
  eventBus.next({ type: 'user_update', data: anotherUser });

  console.log();
}

/**
 * Запуск всіх прикладів
 */
function runAllExamples() {
  console.log('\n🔄 Reactive Communication with Observables & EventEmitters\n');
  console.log('═'.repeat(60));

  example1_EventEmitter();
  example2_Subject();
  example3_BehaviorSubject();
  example4_Observable();
  example5_EntityCommunication();

  console.log('═'.repeat(60));
  console.log('\n✅ All examples completed!\n');
}

runAllExamples();

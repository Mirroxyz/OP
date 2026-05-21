# Lab 7: Reactive Communication with Observables & EventEmitters

## Overview

This project implements a reactive communication system using Observables and EventEmitters for message-based interaction between entities. It demonstrates reactive programming patterns, event-driven architecture, and asynchronous data flow.

## Features

### Core Components

1. **Observable** - Reactive sequence with lazy evaluation
   - Implements reactive streams with `next`, `error`, `complete`
   - Chainable operators: `map()`, `filter()`, `tap()`
   - Subscribe/Unsubscribe pattern
   - Promise integration via `toPromise()`

2. **EventEmitter** - Synchronous event system
   - Classic pub/sub for events
   - Multiple listeners per event
   - `on()`, `once()`, `off()` methods
   - Listener management

3. **Subject** - Observable that is also an Observer
   - Act as both sender and receiver
   - Can call `next()`, `error()`, `complete()`
   - Broadcast to multiple subscribers
   - Independent observer reactions

4. **BehaviorSubject** - Subject with state
   - Stores and replays the last value
   - New subscribers get immediate value
   - Useful for state management

## Usage Examples

### EventEmitter - Multiple Independent Listeners
```javascript
const emitter = new EventEmitter();

emitter.on('message', (msg) => console.log(`Listener 1: ${msg}`));
emitter.on('message', (msg) => console.log(`Listener 2: ${msg}`));

emitter.emit('message', 'Hello');
// Output:
// Listener 1: Hello
// Listener 2: Hello
```

### Subject - Reactive Broadcasting
```javascript
const subject = new Subject();

subject.subscribe(msg => console.log(`Observer 1: ${msg}`));
subject.subscribe(msg => console.log(`Observer 2: ${msg}`));

subject.next('Data 1');
subject.next('Data 2');
// All observers receive messages independently
```

### Observable with Transformations
```javascript
const data = new Observable((observer) => {
  [1, 2, 3, 4, 5].forEach(n => observer.next(n));
});

data
  .filter(x => x > 2)
  .map(x => x * 10)
  .subscribe(result => console.log(result));
// Output: 30, 40, 50
```

### BehaviorSubject - Immediate Value
```javascript
const user = new BehaviorSubject({ id: 1, name: 'Alice' });

// New subscriber gets current value immediately
user.subscribe(u => console.log(`User: ${u.name}`));
// Output: User: Alice

user.next({ id: 2, name: 'Bob' });
// All subscribers notified
```

### Error Handling
```javascript
const observable = new Observable((observer) => {
  observer.next(1);
  observer.error(new Error('Something failed'));
});

observable.subscribe({
  next: (val) => console.log(val),
  error: (err) => console.log(`Error: ${err.message}`),
  complete: () => console.log('Done'),
});
```

## Key Concepts

### Reactive Programming
- **Lazy Evaluation** - Observables don't execute until subscribed
- **Push vs Pull** - Observables push data to subscribers
- **Composability** - Chain operations for complex data flows

### Observer Pattern
- **Observable** - Data source that can be observed
- **Observer** - Object with `next()`, `error()`, `complete()` methods
- **Subscription** - Connection between observable and observer

### Event-Driven
- **EventEmitter** - Immediate, synchronous event handling
- **Subject** - Hybrid: observable + emitter
- **Multiple Listeners** - Independent reactions to same event

### Subscribe/Unsubscribe
- **Subscription** object returned from `subscribe()`
- **Unsubscribe function** to stop receiving events
- **Cleanup** - Prevent memory leaks

## Architecture Patterns

### Entity Communication
Entities communicate through shared subjects/emitters:
```
Entity1 ──→ [Subject/EventEmitter] ←─ Entity2
Entity3 ──→ [Subject/EventEmitter] ←─ Entity4
```

### Pipeline Processing
Chain operations for data transformation:
```
Input → filter → map → tap → filter → subscribe
```

### State Management
BehaviorSubject maintains state and notifies subscribers:
```
State ──→ [BehaviorSubject] ──→ Multiple Views
```

## Running Tests

```bash
npm test
# or
node test.js
```

**Test Coverage:**
- EventEmitter: emit, unsubscribe, once, listenerCount
- Observable: next, complete, error, map, filter, tap
- Subject: broadcasting, unsubscribe, error handling
- BehaviorSubject: initial value, state management
- Chains: complex pipelines with multiple operators
- Performance: 100 concurrent observers

## Running Examples

```bash
npm run example
# or
node example.js
```

**Examples Include:**
1. Basic EventEmitter with multiple listeners
2. Subject for reactive communication
3. BehaviorSubject with initial state
4. Observable with transformations
5. Entity communication system
6. Multi-stage processing pipeline
7. Error handling and completion
8. Combined EventEmitter & Subject approach

## Performance Characteristics

- **Memory**: O(n) where n = number of observers
- **Time**: O(n) to notify all observers
- **Subscribe**: O(1) operation
- **Unsubscribe**: O(n) worst case (linear search)
- **Emit/Next**: O(n) proportional to listener count

## Comparison: Observable vs EventEmitter

| Feature | Observable | EventEmitter |
|---------|-----------|--------------|
| Lazy | Yes | No |
| Chainable Operators | Yes | No |
| Error Handling | Built-in | Manual |
| State | No | No (unless BehaviorSubject) |
| Synchronous | Configurable | Yes |
| Use Case | Data streams | Events |

## Best Practices

1. **Always Unsubscribe** - Prevent memory leaks
2. **Use tap() for Side Effects** - Don't use map for logging
3. **Error Handling** - Provide error handler in subscribe
4. **Complete Streams** - Signal completion when done
5. **BehaviorSubject for State** - Use for UI state management
6. **Pipeline Operations** - Chain instead of nesting

## Advanced Features

### Combining Multiple Sources
```javascript
// Merge multiple subjects
const subject1 = new Subject();
const subject2 = new Subject();

subject1.subscribe(val => console.log(`S1: ${val}`));
subject2.subscribe(val => console.log(`S1+S2: ${val}`));
```

### Request/Response Pattern
```javascript
const requests = new Subject();
const responses = new Subject();

requests.subscribe(req => {
  // Process and respond
  responses.next(process(req));
});
```

### Reactive Forms
```javascript
const formData = new BehaviorSubject({});

formData.subscribe(data => {
  // Update UI based on form state
});
```

## Limitations

- No built-in retry logic
- No backpressure handling
- Performance degrades with many operators
- Memory overhead for large observer lists

## Future Enhancements

- Retry and error recovery
- Backpressure and flow control
- Combine, merge, concat operators
- Debounce, throttle, timeout
- Resource cleanup operators
- Hot vs Cold observable distinction

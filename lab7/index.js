/**
 * Observable - базовий reactive primitive для реактивного програмування
 * Дозволяє підписуватися на послідовність значень, помилок та завершення
 */
class Observable {
  constructor(subscribe) {
    this._subscribe = subscribe;
  }

  /**
   * Підписує спостерігача на потік даних
   */
  subscribe(observerOrNext, onError, onComplete) {
    // Нормалізуємо аргументи - можуть бути функція або об'єкт
    const observer = typeof observerOrNext === 'function'
      ? { next: observerOrNext, error: onError, complete: onComplete }
      : observerOrNext;

    // Призначаємо дефолтні обробники
    const safeObserver = {
      next: observer.next ? observer.next.bind(observer) : () => {},
      error: observer.error ? observer.error.bind(observer) : (err) => { throw err; },
      complete: observer.complete ? observer.complete.bind(observer) : () => {},
    };

    // Виконуємо функцію підписки
    const subscription = this._subscribe(safeObserver);

    // Повертаємо об'єкт для відписки
    return subscription || { unsubscribe: () => {} };
  }

  /**
   * Трансформує кожне значення в потоці
   */
  map(transformer) {
    return new Observable((observer) => {
      return this.subscribe({
        next: (value) => {
          try {
            observer.next(transformer(value));
          } catch (err) {
            observer.error(err);
          }
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });
    });
  }

  /**
   * Фільтрує значення на основі предиката
   */
  filter(predicate) {
    return new Observable((observer) => {
      return this.subscribe({
        next: (value) => {
          try {
            if (predicate(value)) {
              observer.next(value);
            }
          } catch (err) {
            observer.error(err);
          }
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });
    });
  }

  /**
   * Виконує побічний ефект для кожного значення без зміни потоку
   */
  tap(callback) {
    return new Observable((observer) => {
      return this.subscribe({
        next: (value) => {
          try {
            callback(value);
            observer.next(value);
          } catch (err) {
            observer.error(err);
          }
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });
    });
  }

  /**
   * Розпочинає обробку потоку
   */
  toPromise() {
    return new Promise((resolve, reject) => {
      let lastValue;
      this.subscribe({
        next: (value) => { lastValue = value; },
        error: reject,
        complete: () => { resolve(lastValue); },
      });
    });
  }
}

/**
 * EventEmitter - система подій для комунікації між сутностями
 * Дозволяє видавати, слухати та відписуватися від подій
 */
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  /**
   * Підписується на подію
   */
  on(eventName, handler) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(handler);

    // Повертаємо функцію для відписки
    return () => this.off(eventName, handler);
  }

  /**
   * Підписується на подію один раз
   */
  once(eventName, handler) {
    const wrappedHandler = (...args) => {
      handler(...args);
      this.off(eventName, wrappedHandler);
    };
    return this.on(eventName, wrappedHandler);
  }

  /**
   * Видаляє слухача з події
   */
  off(eventName, handler) {
    if (!this.events.has(eventName)) {
      return;
    }
    const handlers = this.events.get(eventName);
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Видає подію усім слухачам
   */
  emit(eventName, ...args) {
    if (!this.events.has(eventName)) {
      return false;
    }
    const handlers = this.events.get(eventName);
    for (const handler of handlers) {
      try {
        handler(...args);
      } catch (err) {
        console.error(`Error in event handler for ${eventName}:`, err);
      }
    }
    return true;
  }

  /**
   * Отримує кількість слухачів для події
   */
  listenerCount(eventName) {
    return this.events.has(eventName) ? this.events.get(eventName).length : 0;
  }

  /**
   * Отримує всіх слухачів для події
   */
  listeners(eventName) {
    return this.events.has(eventName) ? [...this.events.get(eventName)] : [];
  }

  /**
   * Видаляє всіх слухачів для події або всіх подій
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }
}

export { Observable, EventEmitter };

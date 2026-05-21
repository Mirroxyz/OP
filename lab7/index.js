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

export { Observable };

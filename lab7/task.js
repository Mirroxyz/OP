class EventEmitter {
  constructor() {
    this.events = {};
  }

  subscribe(eventName, listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);

    return () => this.unsubscribe(eventName, listener);
  }

  unsubscribe(eventName, listener) {
    if (!this.events[eventName]) return;
    
    this.events[eventName] = this.events[eventName].filter(cb => cb !== listener);
  }

  emit(eventName, data) {
    const listeners = this.events[eventName];

    if (!listeners || listeners.length === 0) {
      if (eventName === 'error') {
        console.error("[UNHANDLED ERROR EVENT]:", data);
      }
      return;
    }

    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (err) {
        console.error(`[EventEmitter] Помилка всередині слухача події '${eventName}':`, err.message);
      }
    });
  }
}

class Sensor {
  constructor(id, bus) {
    this.id = id;
    this.bus = bus;
  }

  detectMovement() {
    console.log(`\n[Сенсор ${this.id}] Виявлено рух!`);
    this.bus.emit('movement', { sensorId: this.id, time: new Date().toLocaleTimeString() });
  }
}

class AlarmSystem {
  constructor(bus) {
    bus.subscribe('movement', (data) => {
      console.log(`[Сигналізація] Рух на сенсорі ${data.sensorId}`);
    });
  }
}

class Logger {
  constructor(bus) {
    this.cancelSubscription = bus.subscribe('movement', (data) => {
      console.log(`[Логер] Запиc: рух зафіксовано о ${data.time}`);
    });
  }

  stopLogging() {
    this.cancelSubscription();
    console.log(`[Логер] Запис зупинено. Відписано від подій.`);
  }
}

const eventBus = new EventEmitter();

const sensor1 = new Sensor(24, eventBus);
const alarm = new AlarmSystem(eventBus);
const logger = new Logger(eventBus);

eventBus.subscribe('movement', () => {
  throw new Error("Камера спостереження зависла");
});

console.log("Ситуація 1 - звичайний рух:");
sensor1.detectMovement(); 

setTimeout(() => {
  console.log("\nСитуація 2 - відключений логер:");
  logger.stopLogging();
  sensor1.detectMovement(); 

  console.log("\nСитуація 3 - неперехоплена помилка:");
  eventBus.emit('error', "Втрачено зв'язок з головним сервером");
}, 1000);
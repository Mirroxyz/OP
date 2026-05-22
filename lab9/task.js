import fs from 'fs';

const LEVELS = { DEBUG: 0, INFO: 1, ERROR: 2 };
const GLOBAL_LEVEL = LEVELS.INFO;

function log(options = {}) {
    const targetLevel = options.level || 'INFO';
    const format = options.format || 'text';
    const logFile = options.logFile || null;

    return function (fn) {
        return function (...args) {
            const startTime = Date.now();

            const writeLog = (msgLevel, msg, data = null, err = null) => {
                if (LEVELS[msgLevel] < GLOBAL_LEVEL) return;

                const time = new Date().toISOString();
                const execTime = Date.now() - startTime;

                let logString = '';
                if (format === 'json') {
                    logString = JSON.stringify({ time, level: msgLevel, msg, data, error: err ? err.message : null, execTimeMs: execTime });
                } else {
                    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
                    const errStr = err ? ` | Обвал: ${err.message}` : '';
                    logString = `[${time}] [${msgLevel}] ${msg} (${execTime}ms)${dataStr}${errStr}`;
                }

                if (logFile) {
                    fs.appendFileSync(logFile, logString + '\n');
                } else {
                    console.log(logString);
                }
            };

            try {
                const result = fn.apply(this, args);

                if (result instanceof Promise) {
                    return result
                        .then(res => {
                            if (targetLevel !== 'ERROR') writeLog('INFO', `Async функція ${fn.name} виконана успішно`, { args, result: res });
                            return res;
                        })
                        .catch(err => {
                            writeLog('ERROR', `Async функція ${fn.name} впала`, { args }, err);
                            throw err;
                        });
                }

                if (targetLevel !== 'ERROR') { 
                    writeLog('INFO', `Sync функція ${fn.name} виконана успішно`, { args, result });
                }
                return result;

            } catch (err) {
                writeLog('ERROR', `Sync функція ${fn.name} впала`, { args }, err);
                throw err;
            }
        };
    };
}

const add = log({ level: 'INFO' })(function add(a, b) {
    return a + b;
});

const unstableOperation = log({ level: 'ERROR' })(function unstableOperation(shouldCrash) {
    if (shouldCrash) throw new Error("Мережа відсутня");
    return "Секретні дані";
});

const fetchData = log({ level: 'INFO', format: 'json', logFile: 'app.log' })(async function fetchData(id) {
    await new Promise(res => setTimeout(res, 150));
    return { id, status: 'success' };
});

console.log("Тест 1 - звичайний виклик:");
add(5, 10);

console.log("\nТест 2 - виклик з рівнем ERROR:");
unstableOperation(false);

try {
    unstableOperation(true);
} catch (e) {
    console.log("-> Скрипт перехопив помилку і продовжив роботу.");
}

console.log("\nТест 3 - асинхронний виклик:");
fetchData(42).then(() => {
    console.log("-> Запит виконано, перевірте файл app.log");
});
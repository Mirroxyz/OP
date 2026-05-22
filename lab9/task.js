import fs from 'fs';

const LEVELS = { DEBUG: 0, INFO: 1, ERROR: 2 };
const GLOBAL_LEVEL = LEVELS.INFO;

function log(options = {}) {
    const level = options.level || 'INFO';
    const format = options.format || 'text';
    const logFile = options.logFile || null;

    return function (fn) {
        return function (...args) {
            const startTime = Date.now();

            const writeLog = (msgLevel, msg, data = null) => {
                if (LEVELS[msgLevel] < GLOBAL_LEVEL) return;

                const time = new Date().toISOString();
                const execTime = Date.now() - startTime;

                let logString = '';
                if (format === 'json') {
                    logString = JSON.stringify({ time, level: msgLevel, msg, data, execTimeMs: execTime });
                } else {
                    logString = `[${time}] [${msgLevel}] ${msg} (${execTime}ms) ${data ? JSON.stringify(data) : ''}`;
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
                            if (level !== 'ERROR') writeLog(level, `Виклик ${fn.name}`, { args, result: res });
                            return res;
                        })
                        .catch(err => {
                            writeLog('ERROR', `Помилка в ${fn.name}: ${err.message}`);
                            throw err;
                        });
                }

                if (level !== 'ERROR') { 
                    writeLog(level, `Виклик ${fn.name}`, { args, result });
                }
                return result;

            } catch (err) {
                writeLog('ERROR', `Помилка в ${fn.name}: ${err.message}`);
                throw err;
            }
        };
    };
}

const add = log({ level: 'INFO' })(function add(a, b) {
    return a + b;
});

const divide = log({ level: 'ERROR' })(function divide(a, b) {
    if (b === 0) throw new Error("Ділення на нуль заборонено");
    return a / b;
});

const fetchData = log({ level: 'INFO', format: 'json', logFile: 'app.log' })(async function fetchData(id) {
    await new Promise(res => setTimeout(res, 150));
    return { id, status: 'success' };
});

console.log("Тест 1 - звичайний виклик:");
add(5, 10);

console.log("\nТест 2 - виклик з помилкою:");
try {
    divide(10, 0);
} catch (e) {
    console.log("-> Скрипт продовжив роботу після помилки.");
}

console.log("\nТест 3 - асинхронний виклик:");
fetchData(42).then(() => {
    console.log("-> Запит виконано, перевірте файл app.log");
});
/**
 * Lab 9: Logging Decorator with Configurable Log Levels
 * 
 * A decorator-based logging system that wraps functions
 * to log inputs, outputs, and performance metrics
 */

/**
 * Log Level Enumeration
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  ERROR: 2,
  NONE: 3
};

/**
 * Base Logger Class
 * Handles log output and formatting
 */
class Logger {
  constructor(level = LogLevel.INFO) {
    this.level = level;
    this.formatters = new Map();
    this.outputs = ['console'];
    
    // Register default formatters
    this.registerFormatter('default', this._defaultFormatter.bind(this));
    this.registerFormatter('json', this._jsonFormatter.bind(this));
  }

  /**
   * Set log level
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Register custom formatter
   */
  registerFormatter(name, formatter) {
    this.formatters.set(name, formatter);
  }

  /**
   * Get formatter by name
   */
  getFormatter(name = 'default') {
    return this.formatters.get(name) || this.formatters.get('default');
  }

  /**
   * Add output destination
   */
  addOutput(output) {
    if (!this.outputs.includes(output)) {
      this.outputs.push(output);
    }
  }

  /**
   * Remove output destination
   */
  removeOutput(output) {
    const index = this.outputs.indexOf(output);
    if (index > -1) {
      this.outputs.splice(index, 1);
    }
  }

  /**
   * Log message
   */
  log(level, message, data = {}, formatter = 'default') {
    if (level < this.level) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: this._levelToString(level),
      message,
      data
    };

    const format = this.getFormatter(formatter);
    const formatted = format(logEntry);

    // Output to destinations
    this.outputs.forEach(output => {
      if (output === 'console') {
        console.log(formatted);
      }
    });
  }

  /**
   * Default formatter
   */
  _defaultFormatter(entry) {
    return `[${entry.timestamp}] [${entry.level}] ${entry.message} ${
      Object.keys(entry.data).length > 0 
        ? JSON.stringify(entry.data) 
        : ''
    }`.trim();
  }

  /**
   * JSON formatter
   */
  _jsonFormatter(entry) {
    return JSON.stringify(entry);
  }

  /**
   * Convert level to string
   */
  _levelToString(level) {
    for (const [key, value] of Object.entries(LogLevel)) {
      if (value === level) return key;
    }
    return 'UNKNOWN';
  }
}

/**
 * Log Decorator
 * Wraps functions to log their inputs and outputs
 */
class LogDecorator {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Decorate function with logging
   */
  decorate(fn, options = {}) {
    const {
      level = LogLevel.INFO,
      name = fn.name || 'anonymous',
      logArgs = true,
      logReturn = true,
      logErrors = true,
      formatter = 'default'
    } = options;

    // Check if async function
    if (fn.constructor.name === 'AsyncFunction') {
      return this._decorateAsync(fn, {
        level,
        name,
        logArgs,
        logReturn,
        logErrors,
        formatter
      });
    } else {
      return this._decorateSync(fn, {
        level,
        name,
        logArgs,
        logReturn,
        logErrors,
        formatter
      });
    }
  }

  /**
   * Decorate synchronous function
   */
  _decorateSync(fn, options) {
    const { level, name, logArgs, logReturn, logErrors, formatter } = options;
    const logger = this.logger;

    return function(...args) {
      if (logArgs) {
        logger.log(level, `Calling function: ${name}`, {
          args: args.length <= 3 ? args : `[${args.length} arguments]`
        }, formatter);
      }

      try {
        const result = fn.apply(this, args);

        if (logReturn) {
          logger.log(level, `Function ${name} completed`, {
            returnValue: typeof result === 'object' ? JSON.stringify(result) : result
          }, formatter);
        }

        return result;
      } catch (error) {
        if (logErrors) {
          logger.log(LogLevel.ERROR, `Function ${name} threw error: ${error.message}`, {
            error: error.message,
            stack: error.stack
          }, formatter);
        }
        throw error;
      }
    };
  }

  /**
   * Decorate asynchronous function
   */
  _decorateAsync(fn, options) {
    const { level, name, logArgs, logReturn, logErrors, formatter } = options;
    const logger = this.logger;

    return async function(...args) {
      if (logArgs) {
        logger.log(level, `Calling async function: ${name}`, {
          args: args.length <= 3 ? args : `[${args.length} arguments]`
        }, formatter);
      }

      try {
        const result = await fn.apply(this, args);

        if (logReturn) {
          logger.log(level, `Async function ${name} completed`, {
            returnValue: typeof result === 'object' ? JSON.stringify(result) : result
          }, formatter);
        }

        return result;
      } catch (error) {
        if (logErrors) {
          logger.log(LogLevel.ERROR, `Async function ${name} threw error: ${error.message}`, {
            error: error.message,
            stack: error.stack
          }, formatter);
        }
        throw error;
      }
    };
  }
}

/**
 * Conditional Logger
 * Only logs based on specified conditions
 */
class ConditionalLogger extends Logger {
  constructor(level = LogLevel.INFO) {
    super(level);
    this.conditions = [];
  }

  /**
   * Add logging condition
   */
  addCondition(predicate) {
    this.conditions.push(predicate);
  }

  /**
   * Clear all conditions
   */
  clearConditions() {
    this.conditions = [];
  }

  /**
   * Check if should log based on conditions
   */
  shouldLog(level, message, data) {
    if (this.conditions.length === 0) {
      return level >= this.level;
    }

    return this.conditions.every(predicate => 
      predicate(level, message, data)
    );
  }

  /**
   * Override log to check conditions
   */
  log(level, message, data = {}, formatter = 'default') {
    if (!this.shouldLog(level, message, data)) {
      return;
    }

    super.log(level, message, data, formatter);
  }
}

export { Logger, LogLevel, LogDecorator, ConditionalLogger };

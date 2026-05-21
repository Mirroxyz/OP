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

export { Logger, LogLevel };

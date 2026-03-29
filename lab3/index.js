class LRUCache {
  constructor(maxSize = Infinity) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

class LFUCache {
  constructor(maxSize = Infinity) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.frequencies = new Map();
    this.minFrequency = 0;
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const item = this.cache.get(key);
    this._incrementFrequency(key, item.frequency);
    return item.value;
  }

  set(key, value) {
    if (this.maxSize === 0) return;

    if (this.cache.has(key)) {
      const item = this.cache.get(key);
      item.value = value;
      this._incrementFrequency(key, item.frequency);
      return;
    }

    if (this.cache.size >= this.maxSize) {
      this._evictLFU();
    }

    this.cache.set(key, { value, frequency: 1 });
    if (!this.frequencies.has(1)) {
      this.frequencies.set(1, new Set());
    }
    this.frequencies.get(1).add(key);
    this.minFrequency = 1;
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
    this.frequencies.clear();
    this.minFrequency = 0;
  }

  get size() {
    return this.cache.size;
  }

  _incrementFrequency(key, oldFreq) {
    const item = this.cache.get(key);
    item.frequency = oldFreq + 1;

    this.frequencies.get(oldFreq).delete(key);
    if (this.frequencies.get(oldFreq).size === 0) {
      this.frequencies.delete(oldFreq);
      if (this.minFrequency === oldFreq) {
        this.minFrequency = oldFreq + 1;
      }
    }

    const newFreq = oldFreq + 1;
    if (!this.frequencies.has(newFreq)) {
      this.frequencies.set(newFreq, new Set());
    }
    this.frequencies.get(newFreq).add(key);
  }

  _evictLFU() {
    const keysWithMinFreq = this.frequencies.get(this.minFrequency);
    const keyToEvict = keysWithMinFreq.values().next().value;
    keysWithMinFreq.delete(keyToEvict);
    if (keysWithMinFreq.size === 0) {
      this.frequencies.delete(this.minFrequency);
    }
    this.cache.delete(keyToEvict);
  }
}

class TTLCache {
  constructor(maxSize = Infinity, ttl = 60000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const item = this.cache.get(key);
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    return item.value;
  }

  set(key, value) {
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

class CustomCache {
  constructor(maxSize = Infinity, evictionFn) {
    this.maxSize = maxSize;
    this.evictionFn = evictionFn;
    this.cache = new Map();
    this.metadata = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const meta = this.metadata.get(key);
    meta.accessCount = (meta.accessCount || 0) + 1;
    meta.lastAccess = Date.now();
    return this.cache.get(key);
  }

  set(key, value) {
    const isNew = !this.cache.has(key);
    if (isNew && this.cache.size >= this.maxSize) {
      this._evictCustom();
    }
    this.cache.set(key, value);
    if (!this.metadata.has(key)) {
      this.metadata.set(key, {
        key,
        createdAt: Date.now(),
        lastAccess: Date.now(),
        accessCount: 0,
      });
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
    this.metadata.clear();
  }

  get size() {
    return this.cache.size;
  }

  _evictCustom() {
    if (!this.evictionFn || typeof this.evictionFn !== 'function') {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.metadata.delete(firstKey);
      return;
    }
    const entries = Array.from(this.metadata.values());
    const keyToEvict = this.evictionFn(entries);
    if (keyToEvict !== undefined) {
      this.cache.delete(keyToEvict);
      this.metadata.delete(keyToEvict);
    }
  }
}

function createCacheKey(args) {
  return JSON.stringify(args);
}

export function memoize(fn, options = {}) {
  if (typeof fn !== 'function') {
    throw new TypeError('First argument must be a function');
  }

  const { maxSize = Infinity } = options;
  const cache = new LRUCache(maxSize);

  const memoized = function (...args) {
    const key = createCacheKey(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };

  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  memoized.size = () => cache.size;

  return memoized;
}

export function memoizeAdvanced(fn, options = {}) {
  if (typeof fn !== 'function') {
    throw new TypeError('First argument must be a function');
  }

  const { strategy = 'lru', maxSize = Infinity, ttl = 60000, evictionFn } = options;

  let cache;
  switch (strategy) {
    case 'lru':
      cache = new LRUCache(maxSize);
      break;
    case 'lfu':
      cache = new LFUCache(maxSize);
      break;
    case 'ttl':
      cache = new TTLCache(maxSize, ttl);
      break;
    case 'custom':
      cache = new CustomCache(maxSize, evictionFn);
      break;
    default:
      throw new Error(`Unknown eviction strategy: ${strategy}`);
  }

  const memoized = function (...args) {
    const key = createCacheKey(args);
    if (cache.has(key)) {
      const value = cache.get(key);
      if (value !== undefined) {
        return value;
      }
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };

  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  memoized.size = () => cache.size;

  return memoized;
}

export { LRUCache, LFUCache, TTLCache, CustomCache };

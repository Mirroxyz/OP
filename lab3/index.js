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

export { LRUCache };

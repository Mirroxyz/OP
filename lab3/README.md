# Memoization Library

Advanced memoization with configurable cache eviction strategies.

## Features

- **LRU (Least Recently Used)** - Evicts oldest accessed entries
- **LFU (Least Frequently Used)** - Evicts least accessed entries
- **TTL (Time-Based Expiry)** - Auto-expires after timeout
- **Custom** - User-defined eviction logic

## Usage

### Basic (LRU)

```javascript
import { memoize } from './index.js';

const memoized = memoize(expensiveFunction, { maxSize: 100 });
```

### LFU Strategy

```javascript
import { memoizeAdvanced } from './index.js';

const memoized = memoizeAdvanced(fn, {
  strategy: 'lfu',
  maxSize: 50
});
```

### TTL Strategy

```javascript
const memoized = memoizeAdvanced(fn, {
  strategy: 'ttl',
  maxSize: 100,
  ttl: 60000
});
```

### Custom Strategy

```javascript
const evictFn = (entries) => {
  return entries[0].key;
};

const memoized = memoizeAdvanced(fn, {
  strategy: 'custom',
  maxSize: 50,
  evictionFn: evictFn
});
```

## API

### memoize(fn, options)

- `fn` - Function to memoize
- `options.maxSize` - Cache size limit (default: Infinity)

### memoizeAdvanced(fn, options)

- `fn` - Function to memoize
- `options.strategy` - 'lru' | 'lfu' | 'ttl' | 'custom'
- `options.maxSize` - Cache size limit
- `options.ttl` - Time to live (ms) for TTL strategy
- `options.evictionFn` - Custom eviction function

## Testing

```bash
npm test
```

## License

MIT

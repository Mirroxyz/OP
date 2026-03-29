# Memoization Library

Memoization library with LRU cache eviction strategy.

## Features

- Basic memoization for pure functions
- LRU (Least Recently Used) cache
- Configurable cache size

## Usage

```javascript
import { memoize } from './index.js';

const memoized = memoize(expensiveFunction, { maxSize: 100 });
```

## Testing

```bash
npm test
```

## License

MIT

# Lab 6: Large Data Processing with Async Iterators

## Overview

This project implements a memory-efficient system for processing large datasets that don't fit in memory. It uses async iterators to incrementally load and process data without loading everything at once.

## Features

### Core Components

1. **AsyncDataIterator** - Base class for streaming large datasets
   - Implements `Symbol.asyncIterator` for async for-await loops
   - Configurable chunk size for memory control
   - Lazy loading - only fetches data when needed

2. **FileDataSource** - Simulated large data source
   - Mimics reading from files or databases
   - Supports offset-based fetching
   - Artificial delay to simulate I/O

3. **DataProcessor** - Filtering and transformation pipeline
   - Chain multiple filters and transformations
   - `filter()` - apply predicates
   - `transform()` - apply mappers
   - `reduce()` - aggregate with accumulator
   - `forEach()` - process each item
   - `collect()` - gather results (use carefully!)

4. **DataAggregator** - Statistical computation
   - `sum()` - compute totals
   - `average()` - calculate mean
   - `max()` - find maximum value
   - `min()` - find minimum value
   - `count()` - count items
   - `groupBy()` - group by key function

## Usage Examples

### Basic Stream Processing
```javascript
const dataSource = new FileDataSource(1000000);
const iterator = new AsyncDataIterator(dataSource, 1000);
const processor = new DataProcessor(iterator);

let count = 0;
await processor
  .filter(item => item.value > 50)
  .forEach(item => {
    count++;
    console.log(item);
  });
```

### Data Transformation
```javascript
await processor
  .filter(item => item.value > 30)
  .transform(item => ({
    ...item,
    category: item.value > 50 ? 'HIGH' : 'LOW'
  }))
  .forEach(item => console.log(item));
```

### Statistics and Aggregation
```javascript
const aggregator = new DataAggregator(processor);
const avg = await aggregator.average('value');
const max = await aggregator.max('value');
const grouped = await aggregator.groupBy(item => 
  item.value > 75 ? 'HIGH' : 'LOW'
);
```

## Performance Characteristics

- **Memory**: O(chunkSize) - only keeps one chunk in memory
- **Time**: O(n) - processes each item once
- **Throughput**: ~10,000 items/second (simulated I/O)

## How It Works

1. **Async Iterator Protocol** - Uses JavaScript's async iteration
   - `for await...of` loops through data
   - `next()` automatically called for chunks
   - Generator yields one item at a time

2. **Lazy Evaluation** - Data loaded on demand
   - Only fetches chunks when needed
   - Reduces memory footprint
   - Allows processing unlimited data

3. **Pipeline Architecture** - Filters and transforms chainable
   - Each stage processes one item
   - No intermediate arrays stored
   - Composable operations

## Running Tests

```bash
npm test
# or
node test.js
```

## Running Examples

```bash
npm run example
# or
node example.js
```

## Testing Coverage

- AsyncDataIterator with various dataset sizes
- Filter and transform operations
- Reduce operations with accumulators
- Memory-efficient processing of 50k items
- DataAggregator statistics computation
- Grouping and categorization
- Performance timing on 10k items

## Key Concepts

### Memory Efficiency
- Large datasets processed without loading into memory
- Fixed memory usage regardless of dataset size
- Streaming pattern allows real-time processing

### Composability
- Filter, transform, and aggregate operations chain
- Each operation is independent
- Easily add new processing stages

### Async/Await
- Modern async iteration syntax
- Non-blocking I/O operations
- Works with async callbacks and promises

## Limitations and Considerations

- `collect()` method should be used cautiously - it loads all data into memory
- Performance depends on I/O latency (simulated in FileDataSource)
- Current implementation doesn't support error recovery or backpressure
- Grouping operations may require significant memory for large groups

## Future Enhancements

- Error handling and recovery
- Backpressure management
- Batch processing operations
- Stream pausing/resuming
- File-based I/O implementation
- Network stream support

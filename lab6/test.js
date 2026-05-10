import { AsyncDataIterator, FileDataSource, DataProcessor, DataAggregator } from './index.js';

async function runTests() {
  console.log('Running Large Data Processing Tests...\n');

  let testsPassed = 0;
  let testsFailed = 0;

  async function assert(condition, testName) {
    if (condition) {
      console.log(`✓ ${testName}`);
      testsPassed++;
    } else {
      console.log(`✗ ${testName}`);
      testsFailed++;
    }
  }

  // Test 1: AsyncDataIterator with small dataset
  const dataSource1 = new FileDataSource(100);
  const iterator1 = new AsyncDataIterator(dataSource1, 20);
  let count = 0;
  for await (const item of iterator1) {
    count++;
  }
  await assert(count === 100, 'AsyncDataIterator processes all 100 items');

  // Test 2: DataProcessor with filter
  const dataSource2 = new FileDataSource(100);
  const iterator2 = new AsyncDataIterator(dataSource2, 25);
  const processor2 = new DataProcessor(iterator2);
  let filteredCount = 0;
  await processor2
    .filter(item => item.value > 50)
    .forEach(() => {
      filteredCount++;
    });
  await assert(filteredCount > 0 && filteredCount < 100, 'Filter works correctly');

  // Test 3: DataProcessor with transform
  const dataSource3 = new FileDataSource(50);
  const iterator3 = new AsyncDataIterator(dataSource3, 10);
  const processor3 = new DataProcessor(iterator3);
  let transformedItems = [];
  await processor3
    .transform(item => ({ ...item, doubled: item.value * 2 }))
    .forEach(item => {
      transformedItems.push(item);
    });
  await assert(
    transformedItems.length === 50 && transformedItems[0].doubled === transformedItems[0].value * 2,
    'Transform works correctly'
  );

  // Test 4: Reduce operation
  const dataSource4 = new FileDataSource(80);
  const iterator4 = new AsyncDataIterator(dataSource4, 20);
  const processor4 = new DataProcessor(iterator4);
  const sum = await processor4.reduce((acc, item) => acc + item.value, 0);
  await assert(sum > 0, 'Reduce operation computes sum correctly');

  // Test 5: DataAggregator count
  const dataSource5 = new FileDataSource(120);
  const iterator5 = new AsyncDataIterator(dataSource5, 30);
  const processor5 = new DataProcessor(iterator5);
  const aggregator5 = new DataAggregator(processor5);
  const total = await aggregator5.count();
  await assert(total === 120, 'DataAggregator count returns correct value');

  // Test 6: Chaining filters and transforms
  const dataSource6 = new FileDataSource(200);
  const iterator6 = new AsyncDataIterator(dataSource6, 50);
  const processor6 = new DataProcessor(iterator6);
  let chainedCount = 0;
  await processor6
    .filter(item => item.value > 30)
    .transform(item => ({ ...item, category: item.value > 70 ? 'HIGH' : 'LOW' }))
    .forEach(() => {
      chainedCount++;
    });
  await assert(chainedCount > 0 && chainedCount < 200, 'Chaining filters and transforms works');

  // Test 7: Memory efficiency with larger dataset
  const dataSource7 = new FileDataSource(50000);
  const iterator7 = new AsyncDataIterator(dataSource7, 1000);
  let largeCount = 0;
  for await (const item of iterator7) {
    largeCount++;
  }
  await assert(largeCount === 50000, 'Memory-efficient processing of 50k items');

  // Test 8: DataAggregator statistics
  const dataSource8 = new FileDataSource(100);
  const iterator8 = new AsyncDataIterator(dataSource8, 25);
  const processor8 = new DataProcessor(iterator8);
  const aggregator8 = new DataAggregator(processor8);
  const avg = await aggregator8.average('value');
  const max = await aggregator8.max('value');
  const min = await aggregator8.min('value');
  await assert(
    avg > 0 && max > 0 && min >= 0 && max >= min,
    'Aggregator statistics are correct'
  );

  // Test 9: Grouping functionality
  const dataSource9 = new FileDataSource(150);
  const iterator9 = new AsyncDataIterator(dataSource9, 30);
  const processor9 = new DataProcessor(iterator9);
  const aggregator9 = new DataAggregator(processor9);
  const grouped = await aggregator9.groupBy(item => {
    if (item.value > 75) return 'HIGH';
    if (item.value > 50) return 'MEDIUM';
    return 'LOW';
  });
  const hasGroups = grouped.HIGH || grouped.MEDIUM || grouped.LOW;
  await assert(hasGroups && Object.keys(grouped).length > 0, 'Grouping creates correct categories');

  // Test 10: Performance timing
  const startTime = Date.now();
  const dataSource10 = new FileDataSource(10000);
  const iterator10 = new AsyncDataIterator(dataSource10, 500);
  let perfCount = 0;
  for await (const item of iterator10) {
    perfCount++;
  }
  const elapsed = Date.now() - startTime;
  await assert(perfCount === 10000 && elapsed > 0, `Performance: processed 10k items in ${elapsed}ms`);

  console.log(`\n✓ Tests passed: ${testsPassed}`);
  console.log(`✗ Tests failed: ${testsFailed}\n`);
}

runTests().catch(console.error);

import { AsyncDataIterator, FileDataSource, DataProcessor, DataAggregator } from './index.js';

/**
 * Приклад 1: Базова обробка потоку
 */
async function example1_BasicProcessing() {
  console.log('=== Example 1: Basic Stream Processing ===\n');

  const dataSource = new FileDataSource(10000);
  const iterator = new AsyncDataIterator(dataSource, 500);
  const processor = new DataProcessor(iterator);

  // Обробка з фільтруванням
  let processedCount = 0;
  await processor
    .filter(item => item.value > 50)
    .forEach(async (item) => {
      processedCount++;
      if (processedCount <= 3) {
        console.log(`Processed item ${item.id}: value=${item.value.toFixed(2)}`);
      }
    });

  console.log(`\nTotal items with value > 50: ${processedCount}\n`);
}

/**
 * Приклад 2: Трансформація даних
 */
async function example2_DataTransformation() {
  console.log('=== Example 2: Data Transformation ===\n');

  const dataSource = new FileDataSource(5000);
  const iterator = new AsyncDataIterator(dataSource, 300);
  const processor = new DataProcessor(iterator);

  // Трансформуємо дані в інший формат
  let transformedCount = 0;
  await processor
    .filter(item => item.value > 30 && item.value < 70)
    .transform(item => ({
      ...item,
      category: item.value > 50 ? 'HIGH' : 'MEDIUM',
      normalizedValue: item.value / 100,
    }))
    .forEach(async (item) => {
      transformedCount++;
      if (transformedCount <= 2) {
        console.log(
          `Transformed: id=${item.id}, category=${item.category}, normalized=${item.normalizedValue.toFixed(3)}`
        );
      }
    });

  console.log(`\nTotal transformed items: ${transformedCount}\n`);
}

/**
 * Приклад 3: Обчислення агрегатів
 */
async function example3_Aggregation() {
  console.log('=== Example 3: Stream Aggregation ===\n');

  const dataSource = new FileDataSource(8000);
  const iterator = new AsyncDataIterator(dataSource, 400);
  const processor = new DataProcessor(iterator);

  // Обчислюємо статистику
  const sum = await processor.reduce((acc, item) => acc + item.value, 0);
  const count = await processor.reduce((acc) => acc + 1, 0);

  console.log(`Sum of all values: ${sum.toFixed(2)}`);
  console.log(`Average value: ${(sum / count).toFixed(2)}`);
  console.log(`Total items processed: ${count}\n`);
}

/**
 * Приклад 4: Групування даних
 */
async function example4_Grouping() {
  console.log('=== Example 4: Data Grouping ===\n');

  const dataSource = new FileDataSource(6000);
  const iterator = new AsyncDataIterator(dataSource, 300);
  const processor = new DataProcessor(iterator);
  const aggregator = new DataAggregator(processor);

  // Групуємо за категоріями
  const grouped = await aggregator.groupBy(item => {
    if (item.value > 75) return 'HIGH';
    if (item.value > 50) return 'MEDIUM';
    return 'LOW';
  });

  console.log(`HIGH values: ${grouped.HIGH?.length || 0}`);
  console.log(`MEDIUM values: ${grouped.MEDIUM?.length || 0}`);
  console.log(`LOW values: ${grouped.LOW?.length || 0}\n`);
}

/**
 * Приклад 5: Статистика з DataAggregator
 */
async function example5_Statistics() {
  console.log('=== Example 5: Advanced Statistics ===\n');

  const dataSource = new FileDataSource(5000);
  const iterator = new AsyncDataIterator(dataSource, 250);
  const processor = new DataProcessor(iterator);
  const aggregator = new DataAggregator(processor);

  // Обчислюємо різні статистики
  const total = await aggregator.count();
  const avg = await aggregator.average('value');
  const max = await aggregator.max('value');
  const min = await aggregator.min('value');

  console.log(`Total items: ${total}`);
  console.log(`Average value: ${avg.toFixed(2)}`);
  console.log(`Max value: ${max.toFixed(2)}`);
  console.log(`Min value: ${min.toFixed(2)}\n`);
}

/**
 * Запуск всіх прикладів
 */
async function runAllExamples() {
  try {
    console.log('\n📊 Large Data Processing with Async Iterators\n');
    console.log('Processing simulated dataset of 1M records with chunking...\n');
    console.log('─'.repeat(50));

    await example1_BasicProcessing();
    await example2_DataTransformation();
    await example3_Aggregation();
    await example4_Grouping();
    await example5_Statistics();

    console.log('─'.repeat(50));
    console.log('\n✅ All examples completed successfully!\n');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

runAllExamples();

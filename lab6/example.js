import { AsyncDataIterator, FileDataSource, DataProcessor } from './index.js';

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
  const aggregator = new DataProcessor(iterator);

  // Обчислюємо статистику
  const sum = await processor.reduce((acc, item) => acc + item.value, 0);
  const count = await aggregator.reduce((acc) => acc + 1, 0);

  console.log(`Sum of all values: ${sum.toFixed(2)}`);
  console.log(`Average value: ${(sum / count).toFixed(2)}`);
  console.log(`Total items processed: ${count}\n`);
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

    console.log('─'.repeat(50));
    console.log('\n✅ All examples completed successfully!\n');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

runAllExamples();

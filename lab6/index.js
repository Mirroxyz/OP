/**
 * AsyncDataIterator - базовий клас для потокової обробки великих наборів даних
 * Використовує async iterators для memory-efficient обробки
 */
class AsyncDataIterator {
  constructor(dataSource, chunkSize = 1000) {
    this.dataSource = dataSource;
    this.chunkSize = chunkSize;
  }

  /**
   * Основний метод для async iteration
   * Повертає async iterator, який поступово завантажує дані
   */
  async *[Symbol.asyncIterator]() {
    let offset = 0;

    while (true) {
      // Завантажуємо порцію даних
      const chunk = await this.dataSource.fetch(offset, this.chunkSize);

      if (chunk.length === 0) {
        break;
      }

      // Розділяємо chunk на окремі елементи
      for (const item of chunk) {
        yield item;
      }

      offset += chunk.length;

      // Якщо отримали менше, ніж запросили - це останній chunk
      if (chunk.length < this.chunkSize) {
        break;
      }
    }
  }
}

/**
 * FileDataSource - источник даних з імітацією великого файлу
 */
class FileDataSource {
  constructor(totalRecords = 1000000) {
    this.totalRecords = totalRecords;
  }

  async fetch(offset, limit) {
    // Імітація затримки читання з диску
    await new Promise(resolve => setTimeout(resolve, 10));

    const records = [];
    const end = Math.min(offset + limit, this.totalRecords);

    for (let i = offset; i < end; i++) {
      records.push({
        id: i,
        value: Math.random() * 100,
        timestamp: Date.now() - Math.random() * 1000000,
      });
    }

    return records;
  }
}

export { AsyncDataIterator, FileDataSource };

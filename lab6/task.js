async function* getLargeDataInChunks() {
    const totalRecords = 100000;
    const chunkSize = 5000;
    const fakeDelay = 50;
    const fakeErrorAt = 25000;
    let currentId = 0;

    while (currentId < totalRecords) {
        await new Promise(resolve => setTimeout(resolve, fakeDelay));

        if (fakeErrorAt >= currentId && fakeErrorAt < currentId + chunkSize) {
            throw new Error(`Збій на ID ${fakeErrorAt}`);
        }

        const chunk = [];
        for (let i = 0; i < chunkSize; i++) {
            chunk.push({
                id: currentId++,
                value: Math.floor(Math.random() * 100)
            });
        }
        
        yield chunk;
    }
}

async function processData() {
    console.log("Починаємо обробку...\n");
    
    let totalItems = 0;
    let sum = 0;
    let valuesOver80 = 0;

    const startTime = Date.now();

    try {
        for await (const chunk of getLargeDataInChunks()) {
            for (const item of chunk) {
                sum += item.value;
            
                if (item.value > 80) {
                    valuesOver80++;
                }
            }
            totalItems += chunk.length;
            console.log(`Оброблено ${totalItems} записів...`);
        }
    } catch (error) {
        console.error(`\n[КРИТИЧНО] Зупинка потоку. Причина: ${error.message}`);
    } finally {
        const avg = totalItems > 0 ? (sum / totalItems).toFixed(2) : 0;
        const timeTaken = Date.now() - startTime;

        console.log('\nРезультати:');
        console.log(`Всього оброблено: ${totalItems}`);
        console.log(`Середнє значення: ${(sum / totalItems).toFixed(2)}`);
        console.log(`Записів зі значенням > 80: ${valuesOver80}`);
        console.log(`Час виконання: ${timeTaken} мс`);
    }
}

processData();
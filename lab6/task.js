async function* getLargeDataInChunks() {
    const totalRecords = 100000;
    const chunkSize = 5000;
    const fakeDelay = 50;
    let currentId = 0;

    while (currentId < totalRecords) {
        await new Promise(resolve => setTimeout(resolve, fakeDelay));

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

    for await (const chunk of getLargeDataInChunks()) {
        
        for (const item of chunk) {
            totalItems++;
            sum += item.value;
            
            if (item.value > 80) {
                valuesOver80++;
            }
        }
        
        console.log(`Оброблено ${totalItems} записів...`);
    }

    const timeTaken = Date.now() - startTime;

    console.log('\nРезультати:');
    console.log(`Всього оброблено: ${totalItems}`);
    console.log(`Середнє значення: ${(sum / totalItems).toFixed(2)}`);
    console.log(`Записів зі значенням > 80: ${valuesOver80}`);
    console.log(`Час виконання: ${timeTaken} мс`);
}

processData();
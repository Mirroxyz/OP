function* roundRobinGenerator(items) {
	if (!Array.isArray(items) || items.length === 0) {
		throw new Error("items must be a non-empty array");
	}

	let index = 0;
	while (true) {
		yield items[index];
		index = (index + 1) % items.length;
	}
}

function consumeWithTimeout(iterator, timeoutSeconds, processValue) {
	if (!iterator || typeof iterator.next !== "function") {
		throw new Error("iterator must implement next()");
	}
	if (typeof timeoutSeconds !== "number" || timeoutSeconds <= 0) {
		throw new Error("timeoutSeconds must be a positive number");
	}
	if (typeof processValue !== "function") {
		throw new Error("processValue must be a function");
	}

	const timeoutMs = timeoutSeconds * 1000;
	const start = Date.now();

	while (Date.now() - start < timeoutMs) {
		const { value, done } = iterator.next();
		if (done) {
			break;
		}
		processValue(value);
	}
}

const iterator = roundRobinGenerator(["A", "B", "C", "нщкуіваіаіаіаіа"]);
let count = 0;
consumeWithTimeout(iterator, 1, (value) => {
	count += 1;
	console.log(`#${count}:`, value);
});
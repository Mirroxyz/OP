/**
 * Consumes an iterator for a limited time, calling a callback on each value.
 *
 * @param {Iterator} iterator      - Any object implementing `.next()`.
 * @param {number}   timeoutSeconds - How long to run (must be > 0).
 * @param {Function} processValue  - Called with each yielded value.
 */
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

module.exports = { consumeWithTimeout };

/**
 * Infinite round-robin generator.
 * Cycles through the provided array indefinitely.
 *
 * @param {Array} items - Non-empty array of values to cycle through.
 * @yields {*} The next value in the cycle.
 */
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

module.exports = { roundRobinGenerator };

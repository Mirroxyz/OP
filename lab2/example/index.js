"use strict";

const { roundRobinGenerator, consumeWithTimeout } = require("generator-lib");

// ─────────────────────────────────────────────
// ANSI color codes for colored terminal output
// ─────────────────────────────────────────────
const ANSI = {
	red:    "\x1b[31m",
	green:  "\x1b[32m",
	yellow: "\x1b[33m",
	blue:   "\x1b[34m",
	magenta:"\x1b[35m",
	cyan:   "\x1b[36m",
	reset:  "\x1b[0m",
};

function colored(color, text) {
	return `${ANSI[color] ?? ""}${text}${ANSI.reset}`;
}

function separator(title) {
	console.log(`\n${"─".repeat(50)}`);
	console.log(colored("cyan", ` ${title}`));
	console.log("─".repeat(50));
}

// ─────────────────────────────────────────────
// Example 1: Basic letter cycling for 0.5 s
// ─────────────────────────────────────────────
separator("Example 1 — cycle through letters (0.5 s)");
{
	const gen = roundRobinGenerator(["A", "B", "C"]);
	let i = 0;
	consumeWithTimeout(gen, 0.5, (value) => {
		i++;
		console.log(`  #${i}: ${value}`);
	});
	console.log(colored("green", `  Total iterations: ${i}`));
}

// ─────────────────────────────────────────────
// Example 2: Numbers — running total & average
// ─────────────────────────────────────────────
separator("Example 2 — numbers with running total & avg (0.5 s)");
{
	const gen = roundRobinGenerator([10, 20, 30, 40]);
	let count = 0;
	let total = 0;
	consumeWithTimeout(gen, 0.5, (value) => {
		count++;
		total += value;
		const avg = (total / count).toFixed(2);
		console.log(`  #${count}: value=${value}  total=${total}  avg=${avg}`);
	});
}

// ─────────────────────────────────────────────
// Example 3: Color cycle — print date + index
//            each value is printed in that color
// ─────────────────────────────────────────────
separator("Example 3 — color cycle (0.5 s)");
{
	const colors = ["red", "green", "yellow", "blue", "magenta"];
	const gen = roundRobinGenerator(colors);
	let i = 0;
	const date = new Date().toLocaleDateString("uk-UA");
	consumeWithTimeout(gen, 0.5, (color) => {
		i++;
		console.log(colored(color, `  [${date}] #${i}: ${color}`));
	});
}

// ─────────────────────────────────────────────
// Example 4: Error handling — invalid arguments
// ─────────────────────────────────────────────
separator("Example 4 — error handling");
{
	// Empty array — error is thrown lazily on first .next() call
	try {
		roundRobinGenerator([]).next();
	} catch (e) {
		console.log(colored("red", `  roundRobinGenerator([])       → ${e.message}`));
	}

	// Bad timeout
	try {
		const gen = roundRobinGenerator(["x"]);
		consumeWithTimeout(gen, -1, () => {});
	} catch (e) {
		console.log(colored("red", `  consumeWithTimeout timeout=-1  → ${e.message}`));
	}

	// Missing callback
	try {
		const gen = roundRobinGenerator(["x"]);
		consumeWithTimeout(gen, 1, null);
	} catch (e) {
		console.log(colored("red", `  consumeWithTimeout cb=null     → ${e.message}`));
	}
}

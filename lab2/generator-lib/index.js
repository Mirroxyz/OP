"use strict";

const { roundRobinGenerator } = require("./src/generators");
const { consumeWithTimeout } = require("./src/iterator");

module.exports = { roundRobinGenerator, consumeWithTimeout };

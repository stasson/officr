console.time('commons')
const commons = require('./packages/commons')
console.timeEnd('commons')

console.time('logger')
const logger = require('./packages/logger')
console.timeEnd('logger')

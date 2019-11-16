console.time('commons')
const commons = require('./packages/commons/lib')
console.timeEnd('commons')

console.time('logger')
const logger = require('./packages/logger/lib').default
console.timeEnd('logger')

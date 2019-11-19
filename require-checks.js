console.time('commons')
const { _ } = require('./packages/commons')
console.timeEnd('commons')

console.time('logger')
const logger = require('./packages/logger')
console.timeEnd('logger')

console.time('test1')
logger.info(_.toLower('Toto'))
console.timeEnd('test1')
console.time('test2')
logger.info(_.toLower('Toto'))
console.timeEnd('test2')

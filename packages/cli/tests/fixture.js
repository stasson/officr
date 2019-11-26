const pkg = require('../package.json')
const cli = require('../lib')(pkg)

cli
  .command('fixture')
  .option('--foo')
  .option('--bar')
  .action(fixture)
cli
  .command('error')
  .option('--foo')
  .option('--bar')
  .action(error)
cli
  .command('throw')
  .option('--foo')
  .option('--bar')
  .action(exception)

async function fixture(file, args, options) {
  cli.log('fixture')
}

async function error(file, args, options) {
  cli.error('failed')
}

async function exception(file, args, options) {
  throw 'error'
}

cli.run()

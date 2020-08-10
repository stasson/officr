const pkg = require('../package.json')
const { info } = require('console')
const cli = require('../lib')(pkg)

cli.command('fixture').option('--foo').option('--bar').action(fixture)
cli.command('error').option('--foo').option('--bar').action(error)
cli.command('throw').option('--foo').option('--bar').action(exception)

async function fixture() {
  cli.success()
}

async function error() {
  cli.error('failed')
}

async function exception() {
  throw 'error'
}

cli.run()

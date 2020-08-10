import cac, { CAC } from 'cac'
import logger from '@officr/logger'
import prompt from '@officr/prompt'
import loudRejection from 'loud-rejection'

loudRejection((log) => {
  logger.error(log ? log.split('\n')[0] : 'unexpected error')
  logger.debug(log)
  process.exitCode = -1
})

async function run(cli: CAC, argv?: any[]) {
  try {
    const { args } = cli.parse(argv || process.argv, { run: false })
    if (cli.matchedCommandName) {
      const { log, debug, warn, error, success } = logger.label(
        cli.matchedCommandName
      )
      Object.assign(cli, { log, debug, warn, error, success })
    }
    await cli.runMatchedCommand()
  } catch (err) {
    logger.error(err.message || err)
    logger.debug(err)
    process.exitCode = -1
  }
}

export = (options?: { name?: string; version?: string }) => {
  const { name, version } = options || {}

  // configure logger
  logger.config({
    console: true,
    exitCode: true,
  })
  const { log, debug, warn, error, success } = logger

  const cli = cac(name)
  if (version) {
    cli.version(version)
  }
  cli.help()

  return Object.assign(
    cli,
    { prompt, logger },
    { run: (argv?: any[]) => run(cli, argv) },
    { log, debug, warn, error, success }
  )
}

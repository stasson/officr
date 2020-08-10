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
      Object.assign(cli, logger.label(cli.matchedCommandName))
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

  const cli = cac(name)
  if (version) {
    cli.version(version)
  }
  cli.help()

  return Object.assign(
    cli,
    { prompt },
    { run: (argv?: any[]) => run(cli, argv) },
    logger
  )
}

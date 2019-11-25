import cac from 'cac'
import logger from '@officr/logger'
import prompt from '@officr/prompt'
import loudRejection from 'loud-rejection'
import CAC from 'cac/types/CAC'

loudRejection(log => {
  logger.error(log ? log.split('\n')[0] : 'unexpected error')
  logger.debug(log)
})

async function run(cli: CAC, argv?: any[]) {
  try {
    logger.configure({ stats: true, exitCode: true })

    const { args } = cli.parse(argv, { run: false })
    if (cli.matchedCommand) {
      await Promise.resolve(cli.runMatchedCommand())
    } else {
      if (args.length) {
        logger.error(`unknown command ${args[0]}`)
      }
      cli.outputHelp()
    }
  } catch (err) {
    logger.error(err.message || err)
    logger.debug(err)
    process.exitCode = -1
  }
}

export default function(info?: { name?: string; version?: string }) {
  const { name, version } = info || {}

  const cli = cac(name)
  if (version) {
    cli.version(version)
  }
  cli.help()

  return Object.assign(cli, {
    logger,
    prompt,
    run: (argv?: any[]) => run(cli, argv)
  })
}

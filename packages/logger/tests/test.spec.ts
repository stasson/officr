import logger from '../src'
import { remove, pathExists, readFile } from 'fs-extra'

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function stdoutSpy(): () => string {
  const stdout = jest.spyOn(global.process.stdout, 'write').mock
  const stderr = jest.spyOn(global.process.stderr, 'write').mock

  return () =>
    '\n' +
    stdout.calls
      .concat(stderr.calls)
      .map((args) => args.map((it) => `${it}`).join(''))
      .join('')
}

describe('logger', () => {
  let stdout: () => string

  beforeEach(() => {
    jest.spyOn(global.Date, 'now').mockReturnValue(0)
    stdout = stdoutSpy()
    // reset config
    logger.config()
    // clear stats
    logger.stats()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('has a default config', () => {
    expect(logger.config()).toMatchInlineSnapshot(`
      Object {
        "computeExitCode": false,
        "console": true,
        "timestamp": false,
      }
    `)
  })

  it('config flag can be set', () => {
    expect(logger.config({ logStatsOnExit: true })).toMatchInlineSnapshot(`
      Object {
        "computeExitCode": false,
        "console": true,
        "logStatsOnExit": true,
        "timestamp": false,
      }
    `)
  })

  it('can log', () => {
    logger.config({ logStatsOnExit: true })
    logger.debug('debug')
    logger.log('log')
    logger.label('label').log('log')
    logger.info('info')
    logger.warn('warning')
    logger.error('error')
    logger.success('success')

    expect(`${stdout()}`).toMatchInlineSnapshot(`
      "
      [0m›          [0m log 
      [0m› label    [0m log 
      [34mℹ info     [39m info 
      [33m⚠ warning  [39m warning 
      [31m✖ error    [39m error 
      [32m✔ success  [39m success 
      [2m❯ DEBUG    [22m debug 
      "
    `)
  })

  it('can log with timestamps', () => {
    logger.config({ timestamp: true })
    logger.debug('debug')
    logger.log('log')
    logger.label('label').log('log')
    logger.info('info')
    logger.warn('warning')
    logger.error('error')
    logger.success('success')

    expect(`${stdout()}`).toMatchInlineSnapshot(`
      "
      [2m[70-1-1 1:0:0.0][22m [0m›          [0m log 
      [2m[70-1-1 1:0:0.0][22m [0m› label    [0m log 
      [2m[70-1-1 1:0:0.0][22m [34mℹ info     [39m info 
      [2m[70-1-1 1:0:0.0][22m [33m⚠ warning  [39m warning 
      [2m[70-1-1 1:0:0.0][22m [31m✖ error    [39m error 
      [2m[70-1-1 1:0:0.0][22m [32m✔ success  [39m success 
      [2m[70-1-1 1:0:0.0][22m [2m❯ DEBUG    [22m debug 
      "
    `)
  })

  it('can collect stats', () => {
    logger.config({ logStatsOnExit: true })
    logger.debug('debug')
    logger.log('log')
    logger.label('label').log('log')
    logger.info('info')
    logger.warn('warning')
    logger.error('error')
    logger.success('success')

    expect(logger.stats()).toMatchInlineSnapshot(`
      Object {
        "errors": 1,
        "success": 1,
        "total": 3,
        "warnings": 1,
      }
    `)
  })

  it('can log with labels', () => {
    logger.label('label').debug('log')
    logger.label('label').debug('debug')
    logger.label('label').log('log')
    logger.label('label').info('info')
    logger.label('label').warn('warning')
    logger.label('label').error('error')
    logger.label('label').success('success')

    expect(`${stdout()}`).toMatchInlineSnapshot(`
      "
      [0m› label    [0m log 
      [34mℹ label    [39m info 
      [33m⚠ label    [39m warning 
      [31m✖ label    [39m error 
      [32m✔ label    [39m success 
      [2m❯ label    [22m log 
      [2m❯ label    [22m debug 
      "
    `)
  })

  it('can log variadic arguments', () => {
    logger.debug('debug', 'data')
    logger.log('log', 'data')
    logger.label('label').log('log', 'data')
    logger.info('info', 'data')
    logger.warn('warning', 'data')
    logger.error('error', 'data')
    logger.success('success', 'data')

    expect(`${stdout()}`).toMatchInlineSnapshot(`
      "
      [0m›          [0m log data 
      [0m› label    [0m log data 
      [34mℹ info     [39m info data 
      [33m⚠ warning  [39m warning data 
      [31m✖ error    [39m error data 
      [32m✔ success  [39m success data 
      [2m❯ DEBUG    [22m debug data 
      "
    `)
  })

  it('set exit code to 0 when no error', () => {
    const restoreCode = process.exitCode
    expect(process.exitCode).toMatchInlineSnapshot(`undefined`)
    logger.config({ computeExitCode: true })
    logger.error('error')
    logger.end()
    expect(process.exitCode).toMatchInlineSnapshot(`-1`)
    process.exitCode = restoreCode
  })

  it('can dump results', () => {
    logger.config({ console: false, logStatsOnExit: true })
    logger.error('error')
    logger.end()
    expect(`${stdout()}`).toMatchInlineSnapshot(`
      "
      [31m✖ error    [39m errors: 1, warnings: 0 
      "
    `)
  })

  it('can record', async () => {
    const fname = 'log-test.log'
    if (await pathExists(fname)) await await remove(fname)
    expect(await pathExists(fname)).toBeFalsy()
    const log = logger.record(fname)
    logger.debug('debug')
    logger.log('log')
    logger.info('info')
    logger.warn('warning')
    logger.error('error')
    logger.success('success')
    log.close()
    await sleep(10)
    expect(await pathExists(fname)).toBeTruthy()
    expect(await readFile(fname, 'utf-8')).toMatchInlineSnapshot(`
      "❯ DEBUG     debug 
      ›           log 
      ℹ info      info 
      ⚠ warning   warning 
      ✖ error     error 
      ✔ success   success 
      "
    `)
    await await remove(fname)
  })

  it('can record in JSON', async () => {
    const fname = 'log-test.json'
    if (await pathExists(fname)) await remove(fname)
    expect(await pathExists(fname)).toBeFalsy()
    const log = logger.record(fname, true)
    logger.debug('debug')
    logger.log('log')
    logger.label('label').log('log')
    logger.info('info')
    logger.warn('warning')
    logger.error('error')
    logger.success('success')
    log.close()
    await sleep(10)
    expect(await pathExists(fname)).toBeTruthy()
    const result = await readFile(fname, 'utf-8')
    expect(result).toMatchInlineSnapshot(`
      "[\\"[70-1-1 1:0:0.0]\\",\\"debug\\",\\"debug\\"],
      [\\"[70-1-1 1:0:0.0]\\",\\"log\\",\\"log\\"],
      [\\"[70-1-1 1:0:0.0]\\",\\"log\\",\\"log\\"],
      [\\"[70-1-1 1:0:0.0]\\",\\"info\\",\\"info\\"],
      [\\"[70-1-1 1:0:0.0]\\",\\"warning\\",\\"warning\\"],
      [\\"[70-1-1 1:0:0.0]\\",\\"error\\",\\"error\\"],
      [\\"[70-1-1 1:0:0.0]\\",\\"success\\",\\"success\\"],
      "
    `)
    await remove(fname)
  })

  it('timestamp', async () => {
    expect(logger.timestamp(0)).toMatchInlineSnapshot(`"[70-1-1 1:0:0.0]"`)
  })
})

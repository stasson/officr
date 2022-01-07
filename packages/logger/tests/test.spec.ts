import logger from '../src'
import { remove, pathExists, readFile } from 'fs-extra'

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

describe('logger', () => {
  beforeEach(() => {
    // reset config
    logger.config()
    // clear stats
    logger.stats()
  })

  it('has a default config', () => {
    expect(logger.config()).toMatchInlineSnapshot(`
      Object {
        "console": true,
        "exitCode": false,
        "stats": false,
        "timestamp": false,
      }
    `)
  })

  it('config flag can be set config', () => {
    expect(logger.config({ stats: true })).toMatchInlineSnapshot(`
      Object {
        "console": true,
        "exitCode": false,
        "stats": true,
        "timestamp": false,
      }
    `)
  })

  it('can log', () => {
    logger.config({ stats: true })
    logger.debug('log')
    logger.label('label').log('log')
    logger.info('info')
    logger.warn('warning')
    logger.error('error')
    logger.success('success')
    logger.end()

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
    logger.label('label').log('log')
    logger.label('label').info('info')
    logger.label('label').warn('warning')
    logger.label('label').error('error')
    logger.label('label').success('success')

    expect(logger.stats()).toMatchInlineSnapshot(`
      Object {
        "errors": 1,
        "success": 1,
        "total": 3,
        "warnings": 1,
      }
    `)
  })

  it('can log with timestamps', () => {
    logger.config({ timestamp: true })
    logger.debug('log')
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

  it('can log variadic arguments', () => {
    logger.debug('debug', 'data')
    logger.label('label').log('log', 'data')
    logger.info('info', 'data')
    logger.warn('warning', 'data')
    logger.error('error', 'data')
    logger.success('success', 'data')

    expect(logger.stats()).toMatchInlineSnapshot(`
      Object {
        "errors": 1,
        "success": 1,
        "total": 3,
        "warnings": 1,
      }
    `)
  })

  it('set exit code to 0 when no error', () => {
    const restoreCode = process.exitCode
    expect(process.exitCode).toMatchInlineSnapshot(`undefined`)
    logger.config({ exitCode: true })
    logger.error('error')
    logger.end()
    expect(process.exitCode).toMatchInlineSnapshot(`-1`)
    process.exitCode = restoreCode
  })

  it('can record', async () => {
    const fname = 'log-test.log'
    if (await pathExists(fname)) await await remove(fname)
    expect(await pathExists(fname)).toBeFalsy()
    const log = logger.record(fname)
    logger.debug('log')
    logger.label('label').log('log')
    logger.info('info')
    logger.warn('warning')
    logger.error('error')
    logger.success('success')
    log.close()
    await sleep(10)
    expect(await pathExists(fname)).toBeTruthy()
    expect(await readFile(fname, 'utf-8')).toMatchInlineSnapshot(`
      "❯ DEBUG     log 
      › label     log 
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
    if (await pathExists(fname)) await await remove(fname)
    expect(await pathExists(fname)).toBeFalsy()
    const log = logger.record(fname, true)
    logger.debug('log')
    logger.label('label').log('log')
    logger.info('info')
    logger.warn('warning')
    logger.error('error')
    logger.success('success')
    log.close()
    await sleep(10)
    expect(await pathExists(fname)).toBeTruthy()
    expect((await readFile(fname, 'utf-8')).length).toMatchInlineSnapshot(`402`)
    await remove(fname)
  })

  it('timestamp', async () => {
    expect(logger.timestamp(0)).toMatchInlineSnapshot(`"[70-1-1 1:0:0.0]"`)
  })
})

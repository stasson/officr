import logger from '../src'

describe('logger', () => {
  it('can log', () => {
    const restoreCode = process.exitCode
    logger.config({ stats: true, exitCode: true, timestamp: true })
    logger.record('log-spec.log')
    logger.debug('log')
    logger.label('label').log('log')
    logger.info('info')
    logger.warn('warning')
    logger.error('error')
    logger.success('success')

    expect(logger.stats).toMatchInlineSnapshot(`
      Object {
        "errors": 1,
        "success": 1,
        "total": 3,
        "warnings": 1,
      }
    `)
    logger.end()
    expect(process.exitCode).toMatchInlineSnapshot(`1`)
    process.exitCode = restoreCode
  })
})

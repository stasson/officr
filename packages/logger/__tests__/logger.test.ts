import logger from '../src'

describe('logger', () => {
  it('can log', () => {
    logger.log('log')
    logger.info('info')
    logger.warn('warning')
    logger.error('error')
    logger.success('success')
  })
})

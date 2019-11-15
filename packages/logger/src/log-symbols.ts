import colors from './log-colors'

const logSymbols =
  process.platform !== 'win32' ||
  process.env.CI ||
  process.env.TERM === 'xterm-256color'
    ? {
        error: colors.error('✖'),
        info: colors.info('ℹ'),
        success: colors.success('✔'),
        warning: colors.warning('⚠')
      }
    : {
        error: colors.error('×'),
        info: colors.info('i'),
        success: colors.success('√'),
        warning: colors.warning('‼')
      }

export default logSymbols

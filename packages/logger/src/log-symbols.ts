import { symbols } from 'ansi-colors'
import logColors from './log-colors'

const logSymbols = {
  colored: {
    debug: logColors.debug('D'),
    error: logColors.error(symbols.cross),
    info: logColors.info(symbols.info),
    log: logColors.log(symbols.pointerSmall),
    success: logColors.success(symbols.check),
    warning: logColors.warning(symbols.warning)
  },
  debug: 'D',
  error: symbols.cross,
  info: symbols.info,
  log: symbols.pointerSmall,
  success: symbols.check,
  warning: symbols.warning
}

export default logSymbols

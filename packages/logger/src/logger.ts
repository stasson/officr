import { format } from 'util'
import EventEmitter from 'events'
import logColors from './log-colors'
import logSymbols from './log-symbols'

type LogType = 'debug' | 'log' | 'info' | 'warning' | 'error' | 'success'
type LogMethod = 'debug' | 'log' | 'info' | 'warn' | 'error' | 'success'
type LogFunction = { (...args: any): void }

const isDebug = !!process.env.DEBUG

export class Logger extends EventEmitter
  implements Record<LogMethod, LogFunction> {
  constructor() {
    super()

    /* tslint:disable:no-console */
    if (isDebug) {
      this.on('debug', (...args) => {
        const message = format('DEBUG:\n', ...args)
        console.debug(logColors.debug(message))
      })
    }

    this.on('log', (...args) => {
      console.log(...args)
    })

    const lbInfo = logColors.info('info:'.padEnd(8))
    this.on('info', (...args) => {
      console.info(logSymbols.info, lbInfo, ...args)
    })

    const lbWarn = logColors.warning('warning:'.padEnd(8))
    this.on('warning', (...args) => {
      console.warn(logSymbols.warning, lbWarn, ...args)
    })

    const lbError = logColors.error('error:'.padEnd(8))
    this.on('error', (...args) => {
      console.error(logSymbols.error, lbError, ...args)
    })

    const lbSuccess = logColors.success('success:'.padEnd(8))
    this.on('success', (...args) => {
      console.info(logSymbols.success, lbSuccess, ...args)
    })
    /* tslint:enable:no-console */
  }


  emit(level: LogType, ...args: any[]) {
    return super.emit(level, ...args)
  }

  debug(...args: any) {
    this.emit('debug', ...args)
  }

  log(...args: any) {
    this.emit('log', ...args)
  }

  info(...args: any) {
    this.emit('info', ...args)
  }

  warn(...args: any) {
    this.emit('warning', ...args)
  }

  error(...args: any) {
    this.emit('error', ...args)
  }

  success(...args: any) {
    this.emit('success', ...args)
  }
}

export default new Logger()

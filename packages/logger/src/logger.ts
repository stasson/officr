import EventEmitter from 'events'
import util from 'util'
import logColors from './log-colors'
import logSymbols from './log-symbols'
import { Writable } from 'stream'
import { PathLike, createWriteStream } from 'fs'
import { EOL } from 'os'

type LogType = 'debug' | 'log' | 'info' | 'warning' | 'error' | 'success'
type LogMethod = 'debug' | 'log' | 'info' | 'warn' | 'error' | 'success'
type LogFunction = (...args: any[]) => void
type LogFormatFunction = (logType: LogType, ...args: any[]) => string

const isDebug = !!process.env.DEBUG

const formatDefault = (logType: LogType, ...args: any[]) => {
  return util.format(logSymbols[logType], ...args)
}

export class Logger extends EventEmitter
  implements Record<LogMethod, LogFunction> {
  private console = true
  private logStats = false
  private exitCode = false
  private ended = false
  private counters = {
    errors: 0,
    success: 0,
    warnings: 0
  }

  constructor() {
    super()

    process.on('beforeExit', () => {
      if (!this.ended) {
        super.emit('end')
      }
    })

    this.on('end', () => {
      if (this.exitCode) {
        process.exitCode = this.stats.errors
      }
      if (this.logStats) {
        const { errors, warnings } = this.counters
        const stats = `${errors} errors, ${warnings} warnings`
        if (errors) {
          this.error(logColors.error('error:'), stats)
        } else if (warnings) {
          this.warn(logColors.warning('warning:'), stats)
        } else {
          this.error(logColors.success('success:'), stats)
        }
      }
      this.ended = true
    })

    this.on('data', (logType, ...args) => {
      super.emit(logType, ...args)
    })

    if (isDebug) {
      this.on('debug', (...args) => {
        if (this.console) {
          process.stderr.write(
            logColors.debug(util.format(logSymbols.debug, ...args, EOL))
          )
        }
      })
    }

    this.on('log', (...args) => {
      if (this.console) {
        process.stdout.write(
          logColors.log(util.format(logSymbols.log, ...args, EOL))
        )
      }
    })

    this.on('info', (...args) => {
      if (this.console) {
        process.stdout.write(util.format(logSymbols.colored.info, ...args, EOL))
      }
    })

    this.on('warning', (...args) => {
      this.counters.warnings++
      if (this.console) {
        process.stdout.write(
          util.format(logSymbols.colored.warning, ...args, EOL)
        )
      }
    })

    this.on('error', (...args) => {
      this.counters.errors++
      if (this.console) {
        process.stdout.write(
          util.format(logSymbols.colored.error, ...args, EOL)
        )
      }
    })

    this.on('success', (...args) => {
      this.counters.success++
      if (this.console) {
        process.stdout.write(util.format(logSymbols.success, ...args, EOL))
      }
    })
  }

  public configure(options?: {
    console?: boolean
    logStats?: boolean
    exitCode?: boolean
  }) {
    const { console, logStats, exitCode } = options || {}
    this.console = console || true
    this.logStats = logStats || false
    this.exitCode = exitCode || false
  }

  public get stats() {
    const { counters } = this
    const total = counters.errors + counters.warnings + counters.success
    return { total, ...counters }
  }

  public end() {
    super.emit('end')
  }

  public emit(logType: LogType, ...args: any[]) {
    return !this.ended && super.emit('data', logType, ...args)
  }

  public debug(...args: any) {
    this.emit('debug', ...args)
  }

  public log(...args: any) {
    this.emit('log', ...args)
  }

  public info(...args: any) {
    this.emit('info', ...args)
  }

  public warn(...args: any) {
    this.emit('warning', ...args)
  }

  public error(...args: any) {
    this.emit('error', ...args)
  }

  public success(...args: any) {
    this.emit('success', ...args)
  }

  public pipe(writable: Writable, format: LogFormatFunction = formatDefault) {
    this.on('data', (logType: LogType, ...args: any[]) => {
      writable.write(format(logType, ...args) + EOL)
    })

    this.on('end', () => writable.end())
  }

  public save(
    path: string,
    options?:
      | string
      | {
          flags?: string
          encoding?: string
          fd?: number
          mode?: number
          autoClose?: boolean
          start?: number
          highWaterMark?: number
        },
    format?: LogFormatFunction
  ) {
    const writable = createWriteStream(path, options || undefined)
    this.pipe(writable, format)
  }
}

export default new Logger()

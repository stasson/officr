import EventEmitter from 'events'

import util from 'util'
import colors, { symbols } from 'ansi-colors'
import { Writable } from 'stream'
import { createWriteStream } from 'fs'
import { EOL } from 'os'
import { unstyle } from 'ansi-colors'
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants'

type LogType = 'debug' | 'log' | 'info' | 'warning' | 'error' | 'success'
const logTypes = ['debug', 'log', 'info', 'warning', 'error', 'success']

interface IWriteStreamOptions {
  flags?: string
  encoding?: string
  fd?: number
  mode?: number
  autoClose?: boolean
  start?: number
  highWaterMark?: number
}

interface ILogData {
  type: LogType
  label?: string
  args: any[]
  timestamp: number
}

/** Log Configuration */
interface ILogConfig {
  /** whether to log to the console or not
   * @default true
   */
  console?: boolean

  /** whether to set the exit code to the number of errors
   * @default false
   */
  exitCode?: boolean

  /** whether to log the number of errors at exit
   * @default false
   */
  stats?: boolean

  /** whether to add timestamp
   * @default false
   */
  timestamp?: boolean
}

const logConfig: ILogConfig = {
  console: true
}

function configure(options: ILogConfig = {}) {
  logConfig.console = (options && options.console) || true
  logConfig.stats = (options && options.stats) || false
  logConfig.exitCode = (options && options.exitCode) || false
  logConfig.timestamp = (options && options.timestamp) || false
  return logConfig
}

const logSymbols = {
  debug: symbols.pointer,
  error: symbols.cross,
  info: symbols.info,
  log: symbols.pointerSmall,
  success: symbols.check,
  warning: symbols.warning
}

const logColors = {
  debug: colors.dim,
  error: colors.red,
  info: colors.blue,
  log: colors.reset,
  success: colors.green,
  warning: colors.yellow
}

const logDesc = {
  debug: {
    color: logColors.debug,
    label: 'DEBUG'.padEnd(9),
    stream: process.stderr,
    symbol: logSymbols.debug
  },
  error: {
    color: logColors.error,
    label: 'error'.padEnd(9),
    stream: process.stdout,
    symbol: logSymbols.error
  },
  info: {
    color: logColors.info,
    label: 'info'.padEnd(9),
    stream: process.stdout,
    symbol: logSymbols.info
  },
  log: {
    color: logColors.log,
    label: ''.padEnd(9),
    stream: process.stdout,
    symbol: logSymbols.log
  },
  success: {
    color: logColors.success,
    label: 'success'.padEnd(9),
    stream: process.stdout,
    symbol: logSymbols.success
  },
  warning: {
    color: logColors.warning,
    label: 'warning'.padEnd(9),
    stream: process.stdout,
    symbol: logSymbols.warning
  }
}

const logState = {
  isDebug: !!process.env.DEBUG,
  isEnded: false
}

const logEvents = new EventEmitter()

function emit(data: Partial<ILogData>) {
  return (
    !logState.isEnded &&
    logEvents.emit('data', { timestamp: Date.now(), ...data })
  )
}

const logCounters = {
  errors: 0,
  success: 0,
  warnings: 0
}

/** get log stats */
function stats() {
  const { errors, warnings, success } = logCounters
  const total = errors + warnings + success
  return { total, errors, warnings, success }
}

function formattime(timestamp: number) {
  const d = new Date(timestamp)
  const Y = d.getFullYear() % 100
  const M = d.getMonth() + 1
  const D = d.getDate()
  const h = d.getHours()
  const m = d.getMinutes()
  const s = d.getSeconds().toPrecision(2)

  return `[${Y}-${M}-${D} ${h}:${m}:${s}]`
}

function formatlog(data: ILogData) {
  const { type, args, timestamp } = data
  const { symbol, label, color } = logDesc[type]

  const prefix = color(
    util.format(symbol, (data.label && data.label.padEnd(9)) || label)
  )

  if (logConfig.timestamp) {
    const date = new Date(timestamp)
    const time = logColors.debug(formattime(timestamp))
    return util.format(time, prefix, ...args, EOL)
  } else {
    return util.format(prefix, ...args, EOL)
  }
}

function consoleWrite(data: ILogData) {
  if (logConfig.console) {
    logDesc[data.type].stream.write(formatlog(data))
  }
}

function streamWrite(writable: Writable, data: ILogData) {
  writable.write(unstyle(formatlog(data)))
}

function pipe(writable: Writable, objectMode: boolean = false) {
  if (objectMode) {
    logEvents.on('data', data => writable.write(data))
  } else {
    logEvents.on('data', (data: ILogData) => {
      streamWrite(writable, data)
    })
  }

  logEvents.once('end', () => {
    if (logConfig.stats) {
      const { errors, warnings } = logCounters
      const args = [`errors: ${errors}, warnings: ${warnings}`]
      const type = errors ? 'error' : warnings ? 'warning' : 'success'
      streamWrite(writable, { args, type, timestamp: Date.now() })
    }
    writable.end()
  })
  return writable
}

function onData(data: ILogData) {
  logEvents.emit(data.type, data)
}

function onDebug(data: ILogData) {
  consoleWrite(data)
}

function onLog(data: ILogData) {
  consoleWrite(data)
}

function onInfo(data: ILogData) {
  consoleWrite(data)
}

function onWarning(data: ILogData) {
  logCounters.warnings++
  consoleWrite(data)
}
function onError(data: ILogData) {
  logCounters.errors++
  consoleWrite(data)
}
function onSuccess(data: ILogData) {
  logCounters.success++
  consoleWrite(data)
}

function onEnd() {
  if (!logState.isEnded) {
    // terminate
    logState.isEnded = true
    logEvents.emit('end')

    // set exit code
    if (logConfig.exitCode) {
      process.exitCode = logCounters.errors
    }

    // log stats
    if (logConfig.stats) {
      const { errors, warnings } = logCounters
      const args = [`errors: ${errors}, warnings: ${warnings}`]
      const type = errors ? 'error' : warnings ? 'warning' : 'success'
      consoleWrite({ type, args, timestamp: Date.now() })
    }
  }
}

function beforeExit() {
  return logEvents.emit('end')
}

// Setup
configure()
logEvents.on('data', onData)
if (logState.isDebug) {
  logEvents.on('debug', onDebug)
}
logEvents.on('log', onLog)
logEvents.on('info', onInfo)
logEvents.on('warning', onWarning)
logEvents.on('error', onError)
logEvents.on('success', onSuccess)
logEvents.once('end', onEnd)
process.once('beforeExit', beforeExit)

export default {
  /** set log config */
  configure(options?: ILogConfig) {
    return configure(options)
  },
  /** pipe logs to a writable stream */
  pipe(writable: Writable, objectMode: boolean = false) {
    return pipe(writable, objectMode)
  },
  /** record logs in a file */
  record(path: string, options?: string | IWriteStreamOptions) {
    return pipe(createWriteStream(path, options || undefined))
  },
  get stats() {
    return stats()
  },
  /** stop logging */
  end() {
    return logEvents.emit('end')
  },
  /** emit log data */
  emit(type: LogType, ...args: any[]) {
    return emit({ type, args })
  },
  /** log some debug data */
  debug(...args: any[]) {
    return emit({ type: 'debug', args })
  },
  /** log some data */
  log(...args: any[]) {
    return emit({ type: 'log', args })
  },
  /** log some information */
  info(...args: any[]) {
    return emit({ type: 'info', args })
  },
  /** log a warning */
  warn(...args: any[]) {
    return emit({ type: 'warning', args })
  },
  /** log an error */
  error(...args: any[]) {
    return emit({ type: 'error', args })
  },
  /** log a success */
  success(...args: any[]) {
    return emit({ type: 'success', args })
  },
  /** labelled logging functions */
  label: (label: string) => ({
    /** log some debug data */
    debug(...args: any[]) {
      return emit({ type: 'debug', args, label })
    },
    /** log some data */
    log(...args: any[]) {
      return emit({ type: 'log', args, label })
    },
    /** log some information */
    info(...args: any[]) {
      return emit({ type: 'info', args, label })
    },
    /** log a warning */
    warn(...args: any[]) {
      return emit({ type: 'warning', args, label })
    },
    /** log an error */
    error(...args: any[]) {
      return emit({ type: 'error', args, label })
    },
    /** log a success */
    success(...args: any[]) {
      return emit({ type: 'success', args, label })
    }
  }),
  types: logTypes,
  symbols: logSymbols,
  colors: logColors
}

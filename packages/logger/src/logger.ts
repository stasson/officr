import EventEmitter from 'events'

import util from 'util'
import colors from './log-colors'
import symbols from './log-symbols'
import { Writable } from 'stream'
import { createWriteStream } from 'fs'
import { EOL } from 'os'
import { unstyle } from 'ansi-colors'

type LogType = 'debug' | 'log' | 'info' | 'warning' | 'error' | 'success'

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

/** configure logging */
function configure(options?: ILogConfig) {
  logConfig.console = (options && options.console) || true
  logConfig.stats = (options && options.stats) || false
  logConfig.exitCode = (options && options.exitCode) || false
  logConfig.timestamp = (options && options.timestamp) || false
}

const logConfig: ILogConfig = {
  console: true,
  exitCode: false,
  stats: false,
  timestamp: false
}

const logCounters = {
  errors: 0,
  success: 0,
  warnings: 0
}

const logState = {
  isDebug: !!process.env.DEBUG,
  isEnded: false
}

const logDesc = {
  debug: {
    color: colors.debug,
    label: 'DEBUG'.padEnd(9),
    stream: process.stderr,
    symbol: symbols.debug
  },
  error: {
    color: colors.error,
    label: 'error'.padEnd(9),
    stream: process.stdout,
    symbol: symbols.error
  },
  info: {
    color: colors.info,
    label: 'info'.padEnd(9),
    stream: process.stdout,
    symbol: symbols.info
  },
  log: {
    color: colors.log,
    label: ''.padEnd(9),
    stream: process.stdout,
    symbol: symbols.log
  },
  success: {
    color: colors.success,
    label: 'success'.padEnd(9),
    stream: process.stdout,
    symbol: symbols.success
  },
  warning: {
    color: colors.warning,
    label: 'warning'.padEnd(9),
    stream: process.stdout,
    symbol: symbols.warning
  }
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

function format(data: ILogData) {
  const { type, args, timestamp } = data
  const { symbol, label, color } = logDesc[type]

  const prefix = color(
    util.format(symbol, (data.label && data.label.padEnd(9)) || label)
  )

  if (logConfig.timestamp) {
    const date = new Date(timestamp)
    const time = colors.debug(formattime(timestamp))
    return util.format(time, prefix, ...args, EOL)
  } else {
    return util.format(prefix, ...args, EOL)
  }
}

function consoleWrite(data: ILogData) {
  if (logConfig.console) {
    logDesc[data.type].stream.write(format(data))
  }
}

function streamWrite(writable: Writable, data: ILogData) {
  writable.write(unstyle(format(data)))
}

const logEvents = new EventEmitter()

function emitData(data: Partial<ILogData>) {
  return (
    !logState.isEnded &&
    logEvents.emit('data', { timestamp: Date.now(), ...data })
  )
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

/** get log stats */
function getStats() {
  const { errors, warnings, success } = logCounters
  const total = errors + warnings + success
  return { total, errors, warnings, success }
}

/** terminate the logging */
function end() {
  return logEvents.emit('end')
}

/** emit log data */
function emit(type: LogType, ...args: any[]) {
  return emitData({ type, args })
}

/** log some debug data */
function debug(...args: any[]) {
  return emitData({ type: 'debug', args })
}

/** log some data */
function log(...args: any[]) {
  return emitData({ type: 'log', args })
}

/** log some information */
function info(...args: any[]) {
  return emitData({ type: 'info', args })
}

/** log a warning */
function warn(...args: any[]) {
  return emitData({ type: 'warning', args })
}

/** log an error */
function error(...args: any[]) {
  return emitData({ type: 'error', args })
}

/** log a success */
function success(...args: any[]) {
  return emitData({ type: 'success', args })
}

/** pipe logs to a writable stream */
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
}

/** record logs in a file */
function record(path: string, options?: string | IWriteStreamOptions) {
  const writable = createWriteStream(path, options || undefined)
  pipe(writable)
}

// Setup
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
process.once('beforeExit', end)

function label(label: string) {
  return {
    debug: (...args: any[]) => emitData({ type: 'debug', args, label }),
    log: (...args: any[]) => emitData({ type: 'log', args, label }),
    info: (...args: any[]) => emitData({ type: 'info', args, label }),
    warn: (...args: any[]) => emitData({ type: 'warning', args, label }),
    error: (...args: any[]) => emitData({ type: 'error', args, label }),
    success: (...args: any[]) => emitData({ type: 'success', args, label })
  }
}

export default {
  configure,
  getStats,
  end,
  emit,
  debug,
  log,
  info,
  warn,
  error,
  success,
  pipe,
  record,
  symbols,
  colors,
  label
}

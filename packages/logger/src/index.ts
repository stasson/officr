/* eslint-disable  @typescript-eslint/no-explicit-any */

import EventEmitter from 'events'
import util from 'util'
import { Writable } from 'stream'
import { createWriteStream } from 'fs'
import { EOL } from 'os'
import colors, { symbols, unstyle } from 'ansi-colors'

const isDebug = !!process.env.DEBUG || process.env.NODE_ENV == 'test'

type LogType = 'debug' | 'log' | 'info' | 'warning' | 'error' | 'success'

const logTypes = ['debug', 'log', 'info', 'warning', 'error', 'success']

interface ILogData {
  type: LogType
  label?: string
  args: any[]
  timestamp: number
}

const logEvents = new EventEmitter()

function emit(data: Partial<ILogData>) {
  return logEvents.emit('data', { timestamp: Date.now(), ...data })
}

const logSymbols = {
  debug: symbols.pointer,
  error: symbols.cross,
  info: symbols.info,
  log: symbols.pointerSmall,
  success: symbols.check,
  warning: symbols.warning,
}

const logColors = {
  debug: colors.dim,
  error: colors.red,
  info: colors.blue,
  log: colors.reset,
  success: colors.green,
  warning: colors.yellow,
  unstyle,
}

const consoleLogDescriptor = {
  debug: {
    color: logColors.debug,
    label: 'DEBUG'.padEnd(9),
    stream: process.stderr,
    symbol: logSymbols.debug,
  },
  error: {
    color: logColors.error,
    label: 'error'.padEnd(9),
    stream: process.stdout,
    symbol: logSymbols.error,
  },
  info: {
    color: logColors.info,
    label: 'info'.padEnd(9),
    stream: process.stdout,
    symbol: logSymbols.info,
  },
  log: {
    color: logColors.log,
    label: ''.padEnd(9),
    stream: process.stdout,
    symbol: logSymbols.log,
  },
  success: {
    color: logColors.success,
    label: 'success'.padEnd(9),
    stream: process.stdout,
    symbol: logSymbols.success,
  },
  warning: {
    color: logColors.warning,
    label: 'warning'.padEnd(9),
    stream: process.stdout,
    symbol: logSymbols.warning,
  },
}

/** Log Configuration */
export interface ILogConfig {
  /** whether to log to the console or not
   * @default true
   */
  console?: boolean

  /** whether to set the exit code to the number of errors
   * @default false
   */
  computeExitCode?: boolean

  /** whether to log the number of errors at exit
   * @default false
   */
  logStatsOnExit?: boolean

  /** whether to add timestamp
   * @default false
   */
  timestamp?: boolean
}

const logConfigDefaults: ILogConfig = {
  console: true,
  computeExitCode: false,
  timestamp: false,
}

const logConfig: ILogConfig = Object.assign({}, logConfigDefaults)

function config(options: ILogConfig = logConfigDefaults) {
  return Object.assign(logConfig, options)
}

const logCounters = {
  errors: 0,
  success: 0,
  warnings: 0,
}

function stats() {
  const { errors, warnings, success } = logCounters
  const total = errors + warnings + success
  Object.assign(logCounters, {
    errors: 0,
    success: 0,
    warnings: 0,
  })
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
  const { type, args } = data
  const { symbol, label, color } = consoleLogDescriptor[type]

  const prefix = color(
    util.format(symbol, (data.label && data.label.padEnd(9)) || label)
  )

  if (logConfig.timestamp) {
    const timestamp = logColors.debug(formattime(data.timestamp))
    return util.format(timestamp, prefix, ...args, EOL)
  } else {
    return util.format(prefix, ...args, EOL)
  }
}

function consoleWrite(data: ILogData) {
  consoleLogDescriptor[data.type].stream.write(formatlog(data))
}

function streamWrite(writable: Writable, data: ILogData) {
  writable.write(unstyle(formatlog(data)))
}

function pipe(writable: Writable, objectMode = false) {
  if (objectMode) {
    logEvents.on('data', (data) => {
      if (!writable.writableEnded) {
        const { type, args } = data
        const timestamp = formattime(data.timestamp)
        const line = JSON.stringify([timestamp, type, ...args])
        writable.write(`${line},\n`)
      }
    })
  } else {
    logEvents.on('data', (data: ILogData) => {
      if (!writable.writableEnded) streamWrite(writable, data)
    })
  }

  logEvents.once('end', () => writable.end())

  return writable
}

function onData(data: ILogData) {
  if (logConfig.console) consoleWrite(data)
  switch (data.type) {
    case 'error':
      logCounters.errors++
      break
    case 'warning':
      logCounters.warnings++
      break
    case 'success':
      logCounters.success++
      break
  }
}

function onEnd() {
  // set exit code
  if (logConfig.computeExitCode) {
    process.exitCode = logCounters.errors > 0 ? -1 : 0
  }
  if (logConfig.logStatsOnExit) {
    const { errors, warnings } = logCounters
    const args = [`errors: ${errors}, warnings: ${warnings}`]
    const type = errors ? 'error' : warnings ? 'warning' : 'success'
    consoleWrite({ type, args, timestamp: Date.now() })
  }
}

logEvents.on('data', onData)
logEvents.on('end', onEnd)
process.once('beforeExit', onEnd)

export default {
  /** available log types */
  types: logTypes,
  /** log symbols */
  symbols: logSymbols,
  /** log colors */
  colors: logColors,
  /** set log config */
  config(options: ILogConfig = logConfigDefaults) {
    return config(options)
  },
  /** pipe logs to a writable stream */
  pipe(writable: Writable, objectMode = false) {
    return pipe(writable, objectMode)
  },
  /** record logs in a file */
  record(path: string, json = false) {
    const stream = createWriteStream(path, 'utf8')
    this.pipe(stream, json)
    return stream
  },
  /** dump stats and clear */
  stats() {
    return stats()
  },
  /** end logging */
  end() {
    return logEvents.emit('end')
  },
  /** return formated timestamp */
  timestamp(date = Date.now()) {
    return formattime(date)
  },
  /** log some debug data */
  debug(...args: any[]) {
    if (isDebug) return emit({ type: 'debug', args })
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
      if (isDebug) return emit({ type: 'debug', args, label })
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
    },
  }),
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
require('v8-compile-cache')
import { basename } from 'path'
import logger from '@officr/logger'

export type Context = {
  /** the task's name */
  name: string

  /** log, debug only */
  debug: { (...args: any[]): void }

  /** console log */
  log: { (...args: any[]): void }

  /** console info */
  info: { (...args: any[]): void }

  /** console info */
  warn: { (...args: any[]): void }

  /** console error */
  error: { (...args: any[]): void }

  /** console success */
  success: { (...args: any[]): void }
}

export type Task<Context> = {
  (...args: string[]): Promise<number | void> | number | void
}

/**
 * run a simple cli task
 *
 * @param task an async or sync task function
 * @param args defaults to argv
 */
export default async function run(task: Task<Context>, ...args: string[]) {
  try {
    // task's name or fallback on script filename
    const name =
      task.name || basename(process.argv[1]).split('.').slice(0, -1).join()

    // logger
    const { debug, log, info, warn, error, success } = name
      ? logger.label(name)
      : logger

    // assemble context
    const _this = {
      name,
      debug,
      log,
      info,
      warn,
      error,
      success,
    }

    // assemble args
    const _argv = args || process.argv.slice(2)

    // run task
    const result = await Promise.resolve(task.apply(_this, _argv))

    // verify result
    if (result) process.exitCode = result
  } catch (e: any) {
    logger.error(e.message || e.toString())
    // in case of crash, fail
    process.exitCode = -1
  }
}

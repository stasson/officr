import { extractArgs } from './extractArgs'
import { extractFlags } from './extractFlags'
import { help } from './help'
import { ParseSpec } from './ParseSpec'
import { version } from './version'

export default function parse(
  spec: ParseSpec,
  argv: string[] = process.argv.slice(2),
  withHelp: boolean = true
) {
  spec = Object.assign(
    {
      flags: {
        version: {
          type: 'boolean',
          alias: 'v',
          usage: 'print version',
        },
        help: {
          type: 'boolean',
          alias: 'h',
          usage: 'print this help',
        },
      },
    },
    spec
  )

  const [args, __] = extractArgs(argv)
  const [flags, _] = extractFlags(args, spec)

  if (withHelp && flags.help) {
    help(spec)
    return { _: [], __: argv }
  } else if (withHelp && flags.version) {
    version(spec)
    return { _: [], __: argv }
  }
  return Object.assign(flags, { _, __ })
}

import kebabCase from 'lodash.kebabcase'
import { stdout } from 'process'
import { ParseSpec } from './ParseSpec'

export function help(spec: ParseSpec) {
  const { name, version, description } = spec

  // HEADER
  stdout.write(`${name} v${version}\n`)

  if (spec.description) {
    stdout.write('\n')
    stdout.write(spec.description)
    stdout.write('\n')
  }

  // USAGE
  const args = spec.args
    ?.map((it) => {
      const desc = it.variadic ? `...${it.name}` : it.name
      return it.default ? `[${desc}]` : `<${desc}>`
    })
    .join(' ')

  stdout.write('\n')
  stdout.write('USAGE:\n')
  stdout.write('\n')
  stdout.write(
    `  $ ${name}${spec.flags ? ` [OPTIONS]` : ''}${args ? ` ${args}` : ''}\n`
  )

  if (spec.args) {
    const argsUsage = spec.args
      .filter((it) => it.name && it.usage)
      .map((it) => {
        return [it.name, it.usage, it.default] as [string, string, string?]
      })
      .reduce((prev: Record<string, string>, [name, usage, value]) => {
        const formated = value ? `${usage} [${value}]` : usage
        return Object.assign(prev, { [name]: formated })
      }, {})

    console.log({ argsUsage })

    if (argsUsage) {
      const argsLength = Object.keys(argsUsage)
        .map((it) => it.length)
        .reduce((prev, value, _, __) => Math.max(prev, value), 0)

      stdout.write('\n')
      stdout.write('ARGUMENTS:\n')
      stdout.write('\n')

      for (const [arg, usage] of Object.entries(argsUsage)) {
        stdout.write(`  ${arg.padEnd(argsLength)}    ${usage}\n`)
      }
    }
  }
  stdout.write('\n')

  // OPTIONS

  if (spec.flags) {
    // write option usages
    stdout.write('OPTIONS:\n')
    stdout.write('\n')

    // build options table
    const options: Record<string, string> = {}

    for (const [key, { alias, usage, default: value }] of Object.entries(
      spec.flags
    )) {
      const aliases = Array.isArray(alias) ? alias : alias ? [alias] : []
      const flags = [kebabCase(key), ...aliases]
        .sort((a, b) =>
          a.length > b.length ? 1 : a.length == b.length ? 0 : -1
        )
        .map((it) => {
          if (it.length > 1) return `--${it}`
          if (it.length == 1) return `-${it}`
        })
        .join(', ')

      options[flags] = `${usage} ${value ? `[${value}]` : ''}`
    }

    const keylength = Object.keys(options)
      .map((it) => it.length)
      .reduce((prev, value, _, __) => Math.max(prev, value), 0)

    for (const [option, usage] of Object.entries(options)) {
      stdout.write(`  ${option.padEnd(keylength)}    ${usage}\n`)
    }
    stdout.write('\n')
  }

  // EXAMPLE
  if (spec.examples) {
    stdout.write('\n')
    stdout.write('EXAMPLE:\n')
    stdout.write('\n')
    for (const sample of spec.examples) {
      stdout.write(`  ${sample}\n`)
    }
    stdout.write('\n')
  }
}

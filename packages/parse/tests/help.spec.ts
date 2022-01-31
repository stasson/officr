import { help } from '../src/help'

describe('help', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('simple help', () => {
    const stdout = jest
      .spyOn(global.process.stdout, 'write')
      .mockImplementation(() => false)

    help({
      name: 'fixture',
      version: '1.2.3',
    })

    expect(stdout.mock.calls[0][0]).toMatchInlineSnapshot(`
      "fixture v1.2.3
      "
    `)
  })

  test('help with args', () => {
    const stdout = jest
      .spyOn(global.process.stdout, 'write')
      .mockImplementation(() => false)

    help({
      name: 'fixture',
      version: '4.5.6',
      args: [
        { name: 'arg1', usage: 'output file' },
        { name: 'arg2', usage: 'input file', default: 'input.txt' },
        { name: 'args', usage: 'other inputs', variadic: true },
      ],
      flags: {
        booleanFlag1: {
          type: 'boolean',
          alias: 'b',
          usage: 'usage of flag1',
        },
        flag2: {
          type: 'parameter',
          usage: 'usage of flag2',
        },
        flag3: {
          type: 'parameter',
          default: 'default',
          usage: 'usage of flag3',
        },
      },
      examples: ['$ fixture in out'],
    })

    expect(stdout.mock.calls.map((a) => a.join('')).join(''))
      .toMatchInlineSnapshot(`
      "fixture v4.5.6

      USAGE:

        $ fixture [OPTIONS] <arg1> [arg2] <...args>

      ARGUMENTS:

        arg1    output file
        arg2    input file [input.txt]
        args    other inputs

      OPTIONS:

        -b, --boolean-flag-1    usage of flag1 
        --flag-2                usage of flag2 
        --flag-3                usage of flag3 [default]


      EXAMPLE:

        $ fixture in out

      "
    `)
  })
})

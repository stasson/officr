import parse from '../src'
import { ParseSpec } from '../src/ParseSpec'

function stdoutSpy(): () => string {
  const stdout = jest
    .spyOn(global.process.stdout, 'write')
    .mockImplementation(() => false)
  const stderr = jest
    .spyOn(global.process.stderr, 'write')
    .mockImplementation(() => false)

  return () =>
    '\n' +
    stdout.mock.calls
      .concat(stderr.mock.calls)
      .map((args) => args.map((it) => `${it}`).join(''))
      .join('')
}


describe('parse', () => {
  let stdout: () => string

  beforeEach(() => {
    stdout = stdoutSpy()
  })

  test('parse --version', () => {
    const spec: ParseSpec = {
      name: 'fixture',
      version: '1.2.3',
    }

    const parsed = parse(spec, ['--version'])

    expect(parsed).toMatchInlineSnapshot(`
      Object {
        "_": Array [],
        "__": Array [
          "--version",
        ],
      }
    `)

    expect(`${stdout()}`).toMatchInlineSnapshot(`
      "
      "
    `)
  })
})

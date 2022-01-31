import { version } from '../src/version'

describe('version', () => {
  test('version', () => {
    const stdout = jest
      .spyOn(global.process.stdout, 'write')
      .mockImplementation(() => false)

    version({
      name: 'fixture',
      version: '1.2.3',
    })

    expect(stdout.mock.calls[0][0]).toMatchInlineSnapshot(`
      "1.2.3
      "
    `)
  })
})

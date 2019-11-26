import { exec, path } from '@officr/commons'
import logger from '@officr/logger'
const fixture = path.join(__dirname, 'fixture.js')
const unstyle = logger.colors.unstyle

describe('cli', () => {
  it('help by default', async () => {
    expect.hasAssertions()
    const { exitCode, stdout } = await exec.command(`node ${fixture}`, {
      shell: true
    })
    expect(exitCode).toEqual(0)
  })
  it('command', async () => {
    expect.hasAssertions()
    const { exitCode, stdout } = await exec.command(`node ${fixture} fixture`, {
      shell: true
    })
    expect({ exitCode, stdout: unstyle(stdout) }).toMatchInlineSnapshot(`
      Object {
        "exitCode": 0,
        "stdout": "› fixture   fixture ",
      }
    `)
  })
  it('error', () => {
    try {
      exec.commandSync(`node ${fixture} error`, {
        shell: true
      })
    } catch (result) {
      const { exitCode, stdout } = result
      expect({ exitCode, stdout: unstyle(stdout) }).toMatchInlineSnapshot(`
        Object {
          "exitCode": 1,
          "stdout": "✖ error     failed ",
        }
      `)
    }
  })
  it('throw', () => {
    try {
      exec.commandSync(`node ${fixture} throw`, {
        shell: true
      })
    } catch (result) {
      const { exitCode, stdout } = result
      expect({ exitCode, stdout: unstyle(stdout) }).toMatchInlineSnapshot(`
        Object {
          "exitCode": 1,
          "stdout": "✖ error     error ",
        }
      `)
    }
  })
  it('unknown', () => {
    try {
      exec.commandSync(`node ${fixture} unknown`, {
        shell: true
      })
    } catch (result) {
      const { exitCode, stdout } = result
      expect({ exitCode, stdout: unstyle(stdout) }).toMatchInlineSnapshot(`
        Object {
          "exitCode": 1,
          "stdout": "✖ error     unknown command unknown ",
        }
      `)
    }
  })
})

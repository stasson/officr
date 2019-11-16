import { exec } from '../src'
import { command } from '../src/exec'

describe('commons', () => {
  it('needs tests', () => {
    expect(exec.command).toEqual(command)

    expect(Object.keys(exec)).toMatchInlineSnapshot(`
      Array [
        "sync",
        "command",
        "commandSync",
        "node",
      ]
    `)
  })
})

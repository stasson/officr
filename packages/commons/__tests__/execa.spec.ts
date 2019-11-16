'use strict'

import { execa } from '../src'
import { command } from '../src/execa'

describe('commons', () => {
  it('needs tests', () => {
    expect(execa.command).toEqual(command)

    expect(Object.keys(execa)).toMatchInlineSnapshot(`
      Array [
        "sync",
        "command",
        "commandSync",
        "node",
      ]
    `)
  })
})

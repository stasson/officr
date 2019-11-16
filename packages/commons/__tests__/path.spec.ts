'use strict'

import { path } from '../src'
import { join } from '../src/path'

describe('commons', () => {
  it('needs tests', () => {
    expect(path.join).toEqual(join)

    expect(Object.keys(path)).toMatchInlineSnapshot(`
      Array [
        "VERSION",
        "resolve",
        "normalize",
        "isAbsolute",
        "join",
        "relative",
        "toNamespacedPath",
        "dirname",
        "basename",
        "extname",
        "format",
        "parse",
        "sep",
        "delimiter",
        "win32",
        "posix",
        "_makeLong",
        "toUnix",
        "normalizeSafe",
        "normalizeTrim",
        "joinSafe",
        "addExt",
        "trimExt",
        "removeExt",
        "changeExt",
        "defaultExt",
      ]
    `)
  })
})

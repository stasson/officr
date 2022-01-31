import run, { Context } from '../src/'

test('cli context', async () => {
  let context = {}
  async function fixture(this: Context) {
    Object.assign(context, this)
  }

  await run(fixture)

  expect(context).toMatchInlineSnapshot(`
    Object {
      "debug": [Function],
      "error": [Function],
      "info": [Function],
      "log": [Function],
      "name": "fixture",
      "success": [Function],
      "warn": [Function],
    }
  `)
})

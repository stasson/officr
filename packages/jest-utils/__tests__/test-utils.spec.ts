import utils from '../src'
import { prompt } from 'enquirer'
import { EOL } from 'os'

describe('stdin', () => {
  it('mock stdin', async () => {
    expect.hasAssertions()
    const answer = prompt({
      type: 'input',
      message: 'question',
      name: 'answer'
    })
    utils.stdin.send('answer', EOL)

    expect(await answer).toMatchInlineSnapshot(`
      Object {
        "answer": "answer",
      }
    `)
  })
})

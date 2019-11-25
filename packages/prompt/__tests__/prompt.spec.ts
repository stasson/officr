import utils from '@officr/jest-utils'
import prompt from '../src'
import { EOL } from 'os'

describe('prompt', () => {
  it('input answer', async () => {
    expect.hasAssertions()
    const answer = prompt.input('input')
    utils.stdin.send('answer', EOL)
    expect(await answer).toEqual('answer')
  })
  it('input default', async () => {
    expect.hasAssertions()
    const answer = prompt.input('input', { initial: 'default' })
    utils.stdin.send(EOL)
    expect(await answer).toEqual('default')
  })
  it('input default true', async () => {
    expect.hasAssertions()
    const answer = prompt.confirm('input')
    utils.stdin.send(EOL)
    expect(await answer).toEqual(false)
  })
  it('confirm default', async () => {
    expect.hasAssertions()
    const answer = prompt.confirm('confirm')
    utils.stdin.send(EOL)
    expect(await answer).toEqual(false)
  })
  it('confirm default true', async () => {
    expect.hasAssertions()
    const answer = prompt.confirm('confirm', { initial: true })
    utils.stdin.send(EOL)
    expect(await answer).toEqual(true)
  })
  it('confirm default y', async () => {
    expect.hasAssertions()
    const answer = prompt.confirm('confirm')
    utils.stdin.send('y')
    expect(await answer).toEqual(true)
  })
  it('confirm default n', async () => {
    expect.hasAssertions()
    const answer = prompt.confirm('confirm')
    utils.stdin.send('N')
    expect(await answer).toEqual(false)
  })
  it('confirm default no', async () => {
    expect.hasAssertions()
    const answer = prompt.confirm('confirm')
    utils.stdin.send('NO')
    expect(await answer).toEqual(false)
  })
  it('numeral', async () => {
    expect.hasAssertions()
    const answer = prompt.numeral('number')
    utils.stdin.send('123', EOL)
    expect(await answer).toEqual(123)
  })
  it('numeral', async () => {
    expect.hasAssertions()
    const answer = prompt.numeral('number', { initial: 0 })
    utils.stdin.send(EOL)
    expect(await answer).toEqual(0)
  })
  it('autocomplete default', async () => {
    expect.hasAssertions()
    const answer = prompt.autocomplete('autocomplete', ['one', 'two', 'three'])
    utils.stdin.send(EOL)
    expect(await answer).toEqual('one')
  })
  it('autocomplete', async () => {
    expect.hasAssertions()
    const answer = prompt.autocomplete(
      'autocomplete',
      ['one', 'two', 'three'],
      { initial: 1 }
    )
    utils.stdin.send(EOL)
    expect(await answer).toEqual('two')
  })
  it('autocomplete', async () => {
    expect.hasAssertions()
    const answer = prompt.autocomplete(
      'autocomplete',
      ['one', 'two', 'three'],
      { initial: 2 }
    )
    utils.stdin.send('th', EOL)
    expect(await answer).toEqual('three')
  })
  it('suggest', async () => {
    expect.hasAssertions()
    const answer = prompt.suggest('suggest', ['one', 'two', 'three'], {
      initial: 1
    })
    utils.stdin.send(EOL)
    expect(await answer).toEqual('two')
  })
})

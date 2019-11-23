import { _, fs, path, exec, date, yaml, request } from '../lib'

describe('commons', () => {
  it('lodash', () => {
    expect(_.add(1, 1)).toEqual(2)
  })
  it('fs', () => {
    expect(fs.existsSync(__filename)).toBeTruthy()
  })
  it('path', () => {
    expect(path.join('commons', 'path')).toEqual('commons/path')
  })
  it('exec', () => {
    expect(
      exec.commandSync('echo hello commons', {
        shell: true
      }).stdout
    ).toEqual('hello commons')
  })
  it('date', () => {
    expect(date.format(new Date(2014, 1, 11), 'yyyy-MM-dd')).toEqual(
      '2014-02-11'
    )
  })
  it('yaml', () => {
    expect(yaml.load('123')).toEqual(123)
  })
})

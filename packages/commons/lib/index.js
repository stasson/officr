const importLazy = require('import-lazy')
const include = importLazy(require)

module.exports = {
  include,
  _: include('lodash'),
  fs: include('fs-extra'),
  path: include('path'),
  exec: include('execa'),
  date: include('date-fns')
}

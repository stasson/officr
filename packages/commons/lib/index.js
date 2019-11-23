const importLazy = require('import-lazy')
const include = importLazy(require)

module.exports = {
  _: include('lodash'),
  fs: include('fs-extra'),
  path: include('path'),
  exec: include('execa'),
  logger: include('logger'),
  yaml: include('js-yaml'),
  date: include('date-fns'),
  include
}

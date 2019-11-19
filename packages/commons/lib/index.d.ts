import fs from 'fs-extra'
import path from 'upath'
import exec from 'execa'
import _ from 'lodash'
import date from 'date-fns'

declare function include<T = unknown>(moduleId: string): T

export { include, _, fs, path, exec, date }

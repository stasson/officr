// Types
import _lodash from 'lodash'
import _fs from 'fs-extra'
import _path from 'upath'
import _exec from 'execa'
import _yaml from 'js-yaml'
import _date from 'date-fns'
import _request from 'got'

// Import proxy
import importLazy from 'import-lazy'
const include = importLazy(require)

// Exports
export const _ = include('lodash') as typeof _lodash
export const fs = include('fs-extra') as typeof _fs
export const path = include('upath') as typeof _path
export const exec = include('execa') as typeof _exec
export const yaml = include('js-yaml') as typeof _yaml
export const date = include('date-fns') as typeof _date
export const request = include('got') as typeof _request

import _ from 'lodash'
import fs from 'fs-extra'
import path from 'upath'
import exec from 'execa'
import request from 'got'
import date from 'date-fns'
import yaml from 'js-yaml'
import logger from 'logger'

declare function include<T = unknown>(moduleId: string): T

export { _, fs, path, exec, request, date, yaml, logger, include }

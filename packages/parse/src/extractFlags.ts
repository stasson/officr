import camelCase from 'lodash.camelcase';
import kebabCase from 'lodash.kebabcase';
import uniq from 'lodash.uniq';
import mri from 'mri';
import { ParseSpec } from './ParseSpec';

export function extractFlags(args: string[], spec: ParseSpec) {
  const options: {
    boolean: string[];
    string: string[];
    alias: Record<string, any>;
    default: Record<string, any>;
  } = {
    boolean: [],
    string: [],
    alias: {},
    default: {},
  };

  const flagSpec = Object.entries(spec.flags || {});

  for (let [key, { type, alias, default: value }] of flagSpec) {
    // set type
    if (type === 'boolean') {
      options.boolean.push(key);
    } else {
      options.string.push(key);
    }

    // set aliases
    options.alias[key] = uniq([
      kebabCase(key),
      ...(Array.isArray(alias) ? alias : [alias]),
    ]);

    // set default
    if (value)
      options.default[key] = value;
  }
  const parsed = mri(args, options);

  // normalize
  const { _ } = parsed;
  const flags: Record<string, any> = {};
  for (let [key] of flagSpec) {
    const flag = camelCase(key);
    const value = parsed[key];
    if (value)
      flags[flag] = value;
  }

  return [flags, _];
}

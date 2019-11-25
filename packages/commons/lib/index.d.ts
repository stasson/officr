/// <reference types="node" />
import _lodash from 'lodash'
import _fs from 'fs-extra'
import _path from 'upath'
import _exec from 'execa'
import _yaml from 'js-yaml'
import _date from 'date-fns'
import _request from 'got'
export declare const _: _lodash.LoDashStatic
export declare const fs: typeof _fs
export declare const path: typeof _path
export declare const exec: {
  (
    file: string,
    arguments?: readonly string[] | undefined,
    options?: _exec.Options<string> | undefined
  ): _exec.ExecaChildProcess<string>
  (
    file: string,
    arguments?: readonly string[] | undefined,
    options?: _exec.Options<null> | undefined
  ): _exec.ExecaChildProcess<Buffer>
  (
    file: string,
    options?: _exec.Options<string> | undefined
  ): _exec.ExecaChildProcess<string>
  (
    file: string,
    options?: _exec.Options<null> | undefined
  ): _exec.ExecaChildProcess<Buffer>
  sync(
    file: string,
    arguments?: readonly string[] | undefined,
    options?: _exec.SyncOptions<string> | undefined
  ): _exec.ExecaSyncReturnValue<string>
  sync(
    file: string,
    arguments?: readonly string[] | undefined,
    options?: _exec.SyncOptions<null> | undefined
  ): _exec.ExecaSyncReturnValue<Buffer>
  sync(
    file: string,
    options?: _exec.SyncOptions<string> | undefined
  ): _exec.ExecaSyncReturnValue<string>
  sync(
    file: string,
    options?: _exec.SyncOptions<null> | undefined
  ): _exec.ExecaSyncReturnValue<Buffer>
  command(
    command: string,
    options?: _exec.Options<string> | undefined
  ): _exec.ExecaChildProcess<string>
  command(
    command: string,
    options?: _exec.Options<null> | undefined
  ): _exec.ExecaChildProcess<Buffer>
  commandSync(
    command: string,
    options?: _exec.SyncOptions<string> | undefined
  ): _exec.ExecaSyncReturnValue<string>
  commandSync(
    command: string,
    options?: _exec.SyncOptions<null> | undefined
  ): _exec.ExecaSyncReturnValue<Buffer>
  node(
    scriptPath: string,
    arguments?: readonly string[] | undefined,
    options?: _exec.NodeOptions<string> | undefined
  ): _exec.ExecaChildProcess<string>
  node(
    scriptPath: string,
    arguments?: readonly string[] | undefined,
    options?: _exec.Options<null> | undefined
  ): _exec.ExecaChildProcess<Buffer>
  node(
    scriptPath: string,
    options?: _exec.Options<string> | undefined
  ): _exec.ExecaChildProcess<string>
  node(
    scriptPath: string,
    options?: _exec.Options<null> | undefined
  ): _exec.ExecaChildProcess<Buffer>
}
export declare const yaml: typeof _yaml
export declare const date: typeof _date
export declare const request: _request.GotInstance<_request.GotFn>
//# sourceMappingURL=index.d.ts.map

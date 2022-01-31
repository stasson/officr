// split extra args separated by '--'
export function extractArgs(args: string[]) {
  const extraSeparatorIndex = args.indexOf('--');
  const _ = args.slice(0, extraSeparatorIndex);
  const __ = args.slice(extraSeparatorIndex + 1);
  return [_, __];
}

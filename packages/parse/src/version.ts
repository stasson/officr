import { stdout } from 'process';


export function version(info: {
  name?: string;
  version?: string;
  description?: string;
}) {
  const { name, version } = info;
  stdout.write(`${version}\n`);
}

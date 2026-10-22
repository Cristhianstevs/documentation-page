import { resolve } from 'node:path';

export function siteRoot() {
  return resolve(/* turbopackIgnore: true */ process.env.DOCUMENTATION_SITE_ROOT ?? '../../site');
}

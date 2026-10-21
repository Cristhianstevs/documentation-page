import { readLegacySite } from '@documentation-page/content';
import legacyInput from '@/generated/legacy-config.json';

export const legacySitePromise = readLegacySite(legacyInput.projectRoot, {
  configuration: legacyInput.configuration,
  source: legacyInput.source as 'examples' | 'site',
});

export type LegacyPageConfig = {
  id: string;
  title: string;
  file: string;
  icon?: string;
};

export type LegacyTabConfig = {
  id: string;
  title: string;
  pages: LegacyPageConfig[];
};

export type LegacyAppSettings = {
  siteTitle: string;
  logoText: string;
  sidebarTitle: string;
};

export function validateConfig(configuration: unknown): {
  appSettings: LegacyAppSettings;
  docsConfig: LegacyTabConfig[];
};

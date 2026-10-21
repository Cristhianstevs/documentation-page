export type LegacyHeading = {
  id: string;
  level: 1 | 2 | 3;
  text: string;
};

export type LegacyPage = {
  file: string;
  headings: LegacyHeading[];
  html: string;
  icon?: string;
  id: string;
  issues: string[];
  title: string;
};

export type LegacyTab = {
  id: string;
  pages: LegacyPage[];
  title: string;
};

export type LegacySite = {
  appSettings: {
    logoText: string;
    sidebarTitle: string;
    siteTitle: string;
  };
  source: 'examples' | 'site';
  sourceDirectory: string;
  tabs: LegacyTab[];
};

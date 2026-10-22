import { z } from 'zod';

const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const sourceSchema = z.string().regex(/^pages\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:md|html)$/);

export const siteSchema = z
  .object({
    schemaVersion: z.literal(1),
    site: z.object({
      title: z.string().trim().min(1),
      brand: z.string().trim().min(1),
      language: z.string().trim().min(2).default('pt-BR'),
      defaultTheme: z.enum(['light', 'dark', 'system']).default('system'),
    }),
    tabs: z.array(
      z.object({ id: idSchema, title: z.string().trim().min(1), pages: z.array(idSchema) }),
    ),
    pages: z.record(idSchema, z.object({ title: z.string().trim().min(1), source: sourceSchema })),
    aliases: z
      .object({
        tabs: z.record(idSchema, idSchema).default({}),
        pages: z.record(idSchema, idSchema).default({}),
      })
      .default({ tabs: {}, pages: {} }),
  })
  .superRefine((site, context) => {
    const tabIds = new Set<string>();
    const listedPages = new Set<string>();
    for (const [index, tab] of site.tabs.entries()) {
      if (tabIds.has(tab.id)) {
        context.addIssue({
          code: 'custom',
          path: ['tabs', index, 'id'],
          message: `Aba repetida: ${tab.id}.`,
        });
      }
      tabIds.add(tab.id);
      for (const pageId of tab.pages) {
        if (!site.pages[pageId]) {
          context.addIssue({
            code: 'custom',
            path: ['tabs', index, 'pages'],
            message: `Página não cadastrada: ${pageId}.`,
          });
        }
        if (listedPages.has(pageId)) {
          context.addIssue({
            code: 'custom',
            path: ['tabs', index, 'pages'],
            message: `Página listada mais de uma vez: ${pageId}.`,
          });
        }
        listedPages.add(pageId);
      }
    }
    for (const pageId of Object.keys(site.pages)) {
      if (!listedPages.has(pageId)) {
        context.addIssue({
          code: 'custom',
          path: ['pages', pageId],
          message: 'Página fora das abas.',
        });
      }
    }
    for (const [source, target] of Object.entries(site.aliases.tabs)) {
      if (tabIds.has(source)) {
        context.addIssue({
          code: 'custom',
          path: ['aliases', 'tabs', source],
          message: 'Um alias de aba não pode usar um ID ativo.',
        });
      }
      if (!tabIds.has(target)) {
        context.addIssue({
          code: 'custom',
          path: ['aliases', 'tabs', source],
          message: `Destino de alias inexistente: ${target}.`,
        });
      }
    }
    for (const [source, target] of Object.entries(site.aliases.pages)) {
      if (site.pages[source]) {
        context.addIssue({
          code: 'custom',
          path: ['aliases', 'pages', source],
          message: 'Um alias de página não pode usar um ID ativo.',
        });
      }
      if (!site.pages[target]) {
        context.addIssue({
          code: 'custom',
          path: ['aliases', 'pages', source],
          message: `Destino de alias inexistente: ${target}.`,
        });
      }
    }
  });

export type SiteCatalog = z.infer<typeof siteSchema>;

export function validateSiteCatalog(input: unknown): SiteCatalog {
  return siteSchema.parse(input);
}

import { z } from 'zod';

const markSchema = z.enum(['bold', 'italic', 'underline', 'strikethrough', 'code']);

const textSchema = z.object({
  type: z.literal('text'),
  value: z.string(),
  marks: z.array(markSchema).default([]),
});

type Inline =
  | z.infer<typeof textSchema>
  | { type: 'link'; url: string; title?: string; children: z.infer<typeof textSchema>[] };

const inlineSchema: z.ZodType<Inline> = z.lazy(() =>
  z.union([
    textSchema,
    z.object({
      type: z.literal('link'),
      url: z.string().min(1),
      title: z.string().optional(),
      children: z.array(textSchema),
    }),
  ]),
);

type Block =
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'heading'; level: 1 | 2 | 3; id?: string; children: Inline[] }
  | { type: 'list'; ordered: boolean; start?: number; items: ListItem[] }
  | { type: 'quote'; children: Block[] }
  | { type: 'code'; value: string; language?: string }
  | { type: 'table'; align: Array<'left' | 'center' | 'right' | null>; rows: Inline[][][] }
  | { type: 'thematicBreak' }
  | { type: 'image'; src: string; alt: string; title?: string }
  | { type: 'callout'; tone: 'info' | 'warning' | 'danger'; title?: string; children: Block[] }
  | { type: 'toggle'; title: string; children: Block[] }
  | { type: 'columns'; columns: Block[][] }
  | { type: 'file'; src: string; label: string; description?: string }
  | { type: 'video'; src: string; title?: string; caption?: string }
  | { type: 'audio'; src: string; title?: string }
  | { type: 'date'; value: string; label?: string }
  | { type: 'embed'; provider: 'figma' | 'miro'; url: string; title?: string };

type ListItem = { checked?: boolean; children: Block[] };

const blockSchema: z.ZodType<Block> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('paragraph'), children: z.array(inlineSchema) }),
    z.object({
      type: z.literal('heading'),
      level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      id: z.string().min(1).optional(),
      children: z.array(inlineSchema),
    }),
    z.object({
      type: z.literal('list'),
      ordered: z.boolean(),
      start: z.number().int().positive().optional(),
      items: z.array(z.object({ checked: z.boolean().optional(), children: z.array(blockSchema) })),
    }),
    z.object({ type: z.literal('quote'), children: z.array(blockSchema) }),
    z.object({
      type: z.literal('code'),
      value: z.string(),
      language: z.string().min(1).optional(),
    }),
    z.object({
      type: z.literal('table'),
      align: z.array(
        z.union([z.literal('left'), z.literal('center'), z.literal('right'), z.null()]),
      ),
      rows: z.array(z.array(z.array(inlineSchema))),
    }),
    z.object({ type: z.literal('thematicBreak') }),
    z.object({
      type: z.literal('image'),
      src: z.string().min(1),
      alt: z.string(),
      title: z.string().optional(),
    }),
    z.object({
      type: z.literal('callout'),
      tone: z.enum(['info', 'warning', 'danger']).default('info'),
      title: z.string().optional(),
      children: z.array(blockSchema),
    }),
    z.object({
      type: z.literal('toggle'),
      title: z.string().min(1),
      children: z.array(blockSchema),
    }),
    z.object({
      type: z.literal('columns'),
      columns: z.array(z.array(blockSchema)).min(2).max(4),
    }),
    z.object({
      type: z.literal('file'),
      src: z.string().min(1),
      label: z.string().min(1),
      description: z.string().optional(),
    }),
    z.object({
      type: z.literal('video'),
      src: z.string().min(1),
      title: z.string().optional(),
      caption: z.string().optional(),
    }),
    z.object({
      type: z.literal('audio'),
      src: z.string().min(1),
      title: z.string().optional(),
    }),
    z.object({ type: z.literal('date'), value: z.iso.date(), label: z.string().optional() }),
    z.object({
      type: z.literal('embed'),
      provider: z.enum(['figma', 'miro']),
      url: z.url(),
      title: z.string().optional(),
    }),
  ]),
);

export const documentSchema = z.object({
  schemaVersion: z.literal(1),
  children: z.array(blockSchema),
});

export type DocumentAst = z.infer<typeof documentSchema>;
export type DocumentBlock = Block;
export type DocumentInline = Inline;
export type DocumentText = z.infer<typeof textSchema>;

export function validateDocument(input: unknown): DocumentAst {
  return documentSchema.parse(input);
}

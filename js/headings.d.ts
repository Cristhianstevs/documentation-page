export type HeadingInput = {
  id?: string;
  level: number;
  text: string;
};

export type HeadingEntry = {
  id: string;
  level: number;
  text: string;
};

export function buildHeadingEntries(
  headings: HeadingInput[],
  options?: { reservedIds?: string[] },
): { entries: HeadingEntry[]; issues: string[] };

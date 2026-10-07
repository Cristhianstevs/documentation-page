export function normalizeHeadingId(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueId(base, unavailable) {
  if (!unavailable.has(base)) return base;
  let suffix = 2;
  while (unavailable.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}

export function buildHeadingEntries(headings, { reservedIds: externalIds = [] } = {}) {
  const externalIdSet = new Set(externalIds);
  const reservedIds = new Set(
    [...externalIdSet, ...headings.map((heading) => heading.id?.trim()).filter(Boolean)],
  );
  const usedIds = new Set();
  const issues = [];

  const entries = headings.map((heading, index) => {
    const text = heading.text.trim();
    const explicitId = heading.id?.trim();
    let id;

    if (explicitId && !usedIds.has(explicitId) && !externalIdSet.has(explicitId)) {
      id = explicitId;
    } else {
      const normalized = explicitId || normalizeHeadingId(text) || 'secao';
      const unavailable = new Set([...usedIds, ...reservedIds]);
      id = uniqueId(normalized, unavailable);
      if (explicitId) issues.push(`ID explícito repetido ou em conflito: ${explicitId}.`);
      if (!text) issues.push(`Título vazio na posição ${index + 1}.`);
    }

    usedIds.add(id);
    return {
      id,
      text: text || 'Seção sem título',
      level: heading.level,
    };
  });

  return { entries, issues };
}

export function indexContentHeadings(container) {
  const elements = [...container.querySelectorAll('h1, h2, h3')];
  const headingSet = new Set(elements);
  const reservedIds = [...container.querySelectorAll('[id]')]
    .filter((element) => !headingSet.has(element))
    .map((element) => element.id)
    .filter(Boolean);
  const { entries, issues } = buildHeadingEntries(
    elements.map((element) => ({
      id: element.id,
      text: element.textContent ?? '',
      level: Number(element.tagName.slice(1)),
    })),
    { reservedIds },
  );

  entries.forEach((entry, index) => {
    elements[index].id = entry.id;
    entry.element = elements[index];
  });

  return { entries, issues };
}

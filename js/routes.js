export function readRoute(hash) {
  const value = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!value) return { type: 'start' };

  const segments = value.split('/');
  if (segments.length > 3 || segments.some((segment) => !segment)) {
    return { type: 'invalid' };
  }

  const [sectionId, pageId, encodedHeadingId] = segments;
  let headingId;
  try {
    headingId = encodedHeadingId ? decodeURIComponent(encodedHeadingId) : undefined;
  } catch {
    return { type: 'invalid' };
  }
  return { type: 'target', sectionId, pageId, headingId };
}

export function createPageHash(sectionId, pageId, headingId) {
  const pageHash = `#${sectionId}/${pageId}`;
  return headingId ? `${pageHash}/${encodeURIComponent(headingId)}` : pageHash;
}

export function resolveRoute(docsConfig, route) {
  if (route.type === 'invalid') return { status: 'invalid' };

  if (route.type === 'start') {
    const section = docsConfig.find((item) => item.pages.length);
    if (!section) return { status: 'empty', section: docsConfig[0] };
    const page = section.pages[0];
    return {
      status: 'page',
      section,
      page,
      canonicalHash: createPageHash(section.id, page.id),
    };
  }

  const section = docsConfig.find((item) => item.id === route.sectionId);
  if (!section) return { status: 'invalid' };

  if (!route.pageId) {
    if (!section.pages.length) return { status: 'empty', section };
    const page = section.pages[0];
    return {
      status: 'page',
      section,
      page,
      canonicalHash: createPageHash(section.id, page.id),
    };
  }

  const page = section.pages.find((item) => item.id === route.pageId);
  if (!page) return { status: 'invalid', section };
  return {
    status: 'page',
    section,
    page,
    headingId: route.headingId,
    canonicalHash: createPageHash(section.id, page.id, route.headingId),
  };
}

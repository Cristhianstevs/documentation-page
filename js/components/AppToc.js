function createTree(entries) {
  const roots = [];
  const stack = [];

  for (const entry of entries) {
    const node = { entry, children: [] };
    while (stack.length && stack.at(-1).entry.level >= entry.level) stack.pop();
    const parent = stack.at(-1);
    if (parent) parent.children.push(node);
    else roots.push(node);
    stack.push(node);
  }

  return roots;
}

function createList(nodes, pageHash) {
  const list = document.createElement('ol');
  list.className = 'toc-list';

  for (const node of nodes) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'toc-link';
    link.dataset.heading = node.entry.id;
    link.href = `${pageHash}/${encodeURIComponent(node.entry.id)}`;
    link.textContent = node.entry.text;
    item.append(link);
    if (node.children.length) item.append(createList(node.children, pageHash));
    list.append(item);
  }

  return list;
}

class AppToc extends HTMLElement {
  render(entries, pageHash, issues = []) {
    this.replaceChildren();
    if (!entries.length) return;

    const aside = document.createElement('aside');
    aside.className = 'toc-panel';
    const title = document.createElement('h2');
    title.className = 'toc-title';
    title.textContent = 'Nesta página';
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Nesta página');
    nav.append(createList(createTree(entries), pageHash));
    aside.append(title, nav);

    if (issues.length) {
      const warning = document.createElement('p');
      warning.className = 'toc-warning';
      warning.textContent = 'Alguns títulos tinham IDs repetidos ou estavam vazios e foram ajustados.';
      aside.append(warning);
    }

    this.append(aside);
  }

  setActive(headingId) {
    for (const link of this.querySelectorAll('.toc-link')) {
      const active = link.dataset.heading === headingId;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
}

customElements.define('app-toc', AppToc);

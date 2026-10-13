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
    link.dataset.level = String(node.entry.level);
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
    const collapseButton = document.createElement('button');
    collapseButton.className = 'panel-collapse-button';
    collapseButton.type = 'button';
    collapseButton.dataset.panel = 'toc';
    collapseButton.setAttribute('aria-label', 'Recolher índice da página');
    collapseButton.title = 'Recolher índice da página';
    collapseButton.textContent = '›';
    const details = document.createElement('details');
    details.className = 'toc-details';
    details.open = !window.matchMedia('(max-width: 800px)').matches;
    const summary = document.createElement('summary');
    summary.className = 'toc-title';
    summary.textContent = 'Nesta página';
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Nesta página');
    nav.append(createList(createTree(entries), pageHash));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('.toc-link') && window.matchMedia('(max-width: 800px)').matches) {
        details.open = false;
      }
    });
    details.append(summary, nav);
    const content = document.createElement('div');
    content.className = 'panel-content';
    content.append(details);
    aside.append(content);

    if (issues.length) {
      const warning = document.createElement('p');
      warning.className = 'toc-warning';
      warning.textContent = issues.join(' ');
      details.append(warning);
    }

    const resizer = document.createElement('div');
    resizer.className = 'panel-resizer';
    resizer.dataset.panel = 'toc';
    resizer.setAttribute('role', 'separator');
    resizer.setAttribute('aria-label', 'Redimensionar índice da página');
    resizer.setAttribute('aria-orientation', 'vertical');
    resizer.setAttribute('aria-valuemin', '180');
    resizer.setAttribute('aria-valuemax', '420');
    resizer.tabIndex = 0;
    this.append(collapseButton, aside, resizer);
  }

  setActive(headingId) {
    for (const link of this.querySelectorAll('.toc-link')) {
      const active = link.dataset.heading === headingId;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  collapse() {
    const details = this.querySelector('.toc-details');
    if (details) details.open = false;
  }
}

customElements.define('app-toc', AppToc);

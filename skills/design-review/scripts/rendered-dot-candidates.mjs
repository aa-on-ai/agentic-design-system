// Browser-side diagnostic, passed directly to page.evaluate. Report candidates, not a
// style verdict: a mathematical operator or literal quotation may legitimately use a dot.
export function readRenderedDotCandidates() {
  const candidates = [];
  const dot = /[\u00b7\u2022\u2027\u2219\u22c5]/u;
  const selector = (el) => el.id
    ? `#${CSS.escape(el.id)}`
    : `${el.tagName.toLowerCase()}${el.classList.length ? `.${CSS.escape(el.classList[0])}` : ''}`;
  const painted = (el) => {
    if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    return !el.closest('script,style,template,code,pre,kbd,samp,math');
  };
  const add = (el, kind, text) => candidates.push({
    selector: selector(el), kind, text: text.replace(/\s+/g, ' ').trim().slice(0, 180),
    disposition: 'review-context',
  });
  // Own text avoids reporting the same glyph again on every ancestor. Range geometry
  // excludes text in closed disclosures and other non-rendered text nodes.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const el = node.parentElement;
    if (!el || !dot.test(node.textContent) || !painted(el)) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    if (![...range.getClientRects()].some((rect) => rect.width > 0 && rect.height > 0)) continue;
    add(el, 'text', node.textContent);
  }
  for (const el of document.body.querySelectorAll('*')) {
    if (!painted(el)) continue;
    for (const pseudo of ['::before', '::after', '::marker']) {
      const style = getComputedStyle(el, pseudo);
      const content = style.content;
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
      if (dot.test(content)) add(el, pseudo, content);
      else if (pseudo === '::marker' && getComputedStyle(el).display === 'list-item' &&
        ['disc', 'circle'].includes(getComputedStyle(el).listStyleType) &&
        getComputedStyle(el).listStyleImage === 'none' && content === 'normal') {
        add(el, 'list-marker', getComputedStyle(el).listStyleType);
      }
    }
  }
  return candidates;
}

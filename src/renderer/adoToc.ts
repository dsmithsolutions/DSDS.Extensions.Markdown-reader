import type MarkdownIt from 'markdown-it';
type StateCore = MarkdownIt.StateCore;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Token = any;

/**
 * markdown-it plugin: ADO Table of Contents rule.
 *
 * Replaces the first `[[_TOC_]]` token on the page with a <nav> element
 * containing links to every heading (h1-h6) in the document.
 *
 * Rules:
 *  - Case-sensitive: [[_TOC_]] only (not [[_toc_]])
 *  - Only the first occurrence is rendered; subsequent ones are ignored
 *  - Only Markdown-style headings (# syntax) are included; HTML heading
 *    tags are ignored (matching ADO behaviour)
 *
 * Anchor ID generation matches ADO:
 *  - Lowercase all text
 *  - Replace spaces with `-`
 *  - Convert `:`, `"`, `?`, `@`, `,`, `#` to `-`
 *
 * ADO reference: https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance#table-of-contents-for-a-wiki-page
 */
export function adoTocPlugin(md: MarkdownIt): void {
  md.core.ruler.push('ado_toc', adoTocRule);
}

function headingToId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[:"?@,#]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function extractHeadingText(tokens: Token[], index: number): string {
  // The heading_open token at `index` is followed by an inline token
  const inline = tokens[index + 1];
  if (!inline || inline.type !== 'inline') {
    return '';
  }
  return (inline.children ?? [])
    .filter((t: Token) => t.type === 'text' || t.type === 'code_inline' || t.type === 'softbreak')
    .map((t: Token) => (t.type === 'softbreak' ? ' ' : t.content))
    .join('');
}

function adoTocRule(state: StateCore): void {
  const tokens = state.tokens;
  let tocIndex = -1;

  // Find first [[_TOC_]] occurrence
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'inline' && t.content.trim() === '[[_TOC_]]') {
      tocIndex = i;
      break;
    }
  }

  if (tocIndex === -1) {
    return;
  }

  // Collect all headings
  const headings: Array<{ level: number; text: string; id: string }> = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'heading_open') {
      const level = parseInt(t.tag.slice(1), 10);
      const text = extractHeadingText(tokens, i);
      const id = headingToId(text);
      headings.push({ level, text, id });
      // Assign the id attribute to the heading so anchor links work
      t.attrSet('id', id);
    }
  }

  if (headings.length === 0) {
    return;
  }

  // Build TOC HTML
  const minLevel = Math.min(...headings.map((h) => h.level));
  let html = '<nav class="toc">\n<p>Contents</p>\n<ul>\n';
  let currentLevel = minLevel;

  for (const { level, text, id } of headings) {
    if (level > currentLevel) {
      html += '<ul>\n'.repeat(level - currentLevel);
    } else if (level < currentLevel) {
      html += '</ul>\n'.repeat(currentLevel - level);
    }
    currentLevel = level;
    html += `<li><a href="#${id}">${escapeHtml(text)}</a></li>\n`;
  }

  html += '</ul>\n'.repeat(currentLevel - minLevel + 1);
  html += '</nav>\n';

  // Replace the paragraph wrapping [[_TOC_]] with the nav HTML block
  // The inline token is at tocIndex; its parent paragraph_open is at tocIndex-1
  const htmlToken = new state.Token('html_block', '', 0);
  htmlToken.content = html;

  // Replace paragraph_open, inline, paragraph_close (3 tokens) with html_block
  const start = tokens[tocIndex - 1]?.type === 'paragraph_open' ? tocIndex - 1 : tocIndex;
  const end = tokens[tocIndex + 1]?.type === 'paragraph_close' ? tocIndex + 2 : tocIndex + 1;
  tokens.splice(start, end - start, htmlToken);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

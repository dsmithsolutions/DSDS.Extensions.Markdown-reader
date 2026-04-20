import type MarkdownIt from 'markdown-it';
type StateInline = MarkdownIt.StateInline;
type StateBlock = MarkdownIt.StateBlock;

/**
 * markdown-it plugin: ADO KaTeX math rules.
 *
 * Supports:
 *   Inline: $expression$          → <span data-katex-inline>expression</span>
 *   Block:  $$\nexpression\n$$   → <div data-katex-display>expression</div>
 *
 * The webview JS renders these placeholders using the KaTeX library at runtime.
 *
 * ADO reference: https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance#mathematical-notation-and-characters
 */
export function adoMathPlugin(md: MarkdownIt): void {
  md.block.ruler.before('fence', 'ado_math_block', adoMathBlock, {
    alt: ['paragraph', 'reference', 'blockquote'],
  });
  md.inline.ruler.before('escape', 'ado_math_inline', adoMathInline);
}

// ── Block math: $$ … $$ ──────────────────────────────────────────────────────

function adoMathBlock(
  state: StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean
): boolean {
  const startPos = state.bMarks[startLine] + state.tShift[startLine];
  const lineText = state.src.slice(startPos, state.eMarks[startLine]);

  if (!lineText.startsWith('$$')) {
    return false;
  }

  // Single-line: $$expression$$
  if (lineText.length > 4 && lineText.endsWith('$$') && lineText !== '$$') {
    if (silent) { return true; }
    const content = lineText.slice(2, -2).trim();
    const token = state.push('html_block', '', 0);
    token.content = `<div data-katex-display>${escapeHtml(content)}</div>\n`;
    token.map = [startLine, startLine + 1];
    state.line = startLine + 1;
    return true;
  }

  // Multi-line: $$\n...\n$$
  if (lineText.trim() !== '$$') {
    return false;
  }

  if (silent) { return true; }

  let nextLine = startLine + 1;
  let content = '';
  let closed = false;

  while (nextLine < endLine) {
    const pos = state.bMarks[nextLine] + state.tShift[nextLine];
    const line = state.src.slice(pos, state.eMarks[nextLine]);
    if (line.trim() === '$$') {
      closed = true;
      nextLine++;
      break;
    }
    content += state.src.slice(state.bMarks[nextLine], state.eMarks[nextLine]) + '\n';
    nextLine++;
  }

  if (!closed) { return false; }

  const token = state.push('html_block', '', 0);
  token.content = `<div data-katex-display>${escapeHtml(content.trim())}</div>\n`;
  token.map = [startLine, nextLine];
  state.line = nextLine;
  return true;
}

// ── Inline math: $…$ ─────────────────────────────────────────────────────────

function adoMathInline(state: StateInline, silent: boolean): boolean {
  const src = state.src;
  const pos = state.pos;
  const max = state.posMax;

  if (src.charCodeAt(pos) !== 0x24 /* $ */) {
    return false;
  }
  // $$ at this position belongs to block math, skip
  if (src.charCodeAt(pos + 1) === 0x24) {
    return false;
  }

  let end = pos + 1;
  while (end <= max) {
    if (src.charCodeAt(end) === 0x24) {
      break;
    }
    end++;
  }

  if (end > max) {
    return false;
  }

  const content = src.slice(pos + 1, end);
  if (!content.trim()) {
    return false;
  }

  if (!silent) {
    const token = state.push('html_inline', '', 0);
    token.content = `<span data-katex-inline>${escapeHtml(content)}</span>`;
  }

  state.pos = end + 1;
  return true;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

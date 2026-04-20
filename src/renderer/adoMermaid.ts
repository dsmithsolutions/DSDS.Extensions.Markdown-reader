import type MarkdownIt from 'markdown-it';
type StateBlock = MarkdownIt.StateBlock;

/**
 * markdown-it plugin: ADO Mermaid fence rule.
 *
 * ADO uses a ::: fence (not backtick fences) for Mermaid diagrams:
 *
 *   ::: mermaid
 *   sequenceDiagram
 *     ...
 *   :::
 *
 * Emits a <div data-mermaid> placeholder that the webview JS hydrates
 * with the Mermaid library at runtime.
 *
 * ADO limitations (not enforced here, but documented):
 *   - `flowchart` type is unsupported — use `graph`
 *   - `---->` arrow syntax is unsupported
 *   - Links to/from `subgraph` are unsupported
 *
 * ADO reference: https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance#work-with-mermaid-diagrams
 */
export function adoMermaidPlugin(md: MarkdownIt): void {
  md.block.ruler.before('fence', 'ado_mermaid', adoMermaidRule, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  });
}

function adoMermaidRule(
  state: StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean
): boolean {
  const startPos = state.bMarks[startLine] + state.tShift[startLine];
  const lineText = state.src.slice(startPos, state.eMarks[startLine]);

  // Opening marker: "::: mermaid" (with optional whitespace)
  if (!/^:::\s*mermaid\s*$/i.test(lineText)) {
    return false;
  }

  if (silent) {
    return true;
  }

  // Collect lines until closing ":::"
  let nextLine = startLine + 1;
  let content = '';
  let closed = false;

  while (nextLine < endLine) {
    const pos = state.bMarks[nextLine] + state.tShift[nextLine];
    const line = state.src.slice(pos, state.eMarks[nextLine]);

    if (/^:::\s*$/.test(line)) {
      closed = true;
      nextLine++;
      break;
    }
    content += state.src.slice(state.bMarks[nextLine], state.eMarks[nextLine]) + '\n';
    nextLine++;
  }

  if (!closed) {
    return false;
  }

  const token = state.push('html_block', '', 0);
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  token.content = `<div class="ado-mermaid" data-mermaid>${escaped}</div>\n`;
  token.map = [startLine, nextLine];

  state.line = nextLine;
  return true;
}

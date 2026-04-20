import type MarkdownIt from 'markdown-it';
type StateBlock = MarkdownIt.StateBlock;

/**
 * markdown-it plugin: ADO Azure Boards query table rule.
 *
 * Handles the single-line form:
 *   :::query-table 6ff7777e-8ca5-4f04-a7f6-9e63737dddf7:::
 *
 * In the VS Code preview context we cannot execute live ADO queries, so we
 * render a styled placeholder that shows the query GUID.
 *
 * ADO reference: https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance#embedded-azure-boards-query-results
 */
export function adoQueryTablePlugin(md: MarkdownIt): void {
  md.block.ruler.before('fence', 'ado_query_table', adoQueryTableRule, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  });
}

// UUID v4 pattern
const GUID_RE =
  /^:::query-table\s+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\s*:::$/i;

function adoQueryTableRule(
  state: StateBlock,
  startLine: number,
  _endLine: number,
  silent: boolean
): boolean {
  const startPos = state.bMarks[startLine] + state.tShift[startLine];
  const lineText = state.src.slice(startPos, state.eMarks[startLine]);

  const match = GUID_RE.exec(lineText);
  if (!match) {
    return false;
  }

  if (silent) {
    return true;
  }

  const guid = match[1].toLowerCase();
  const token = state.push('html_block', '', 0);
  token.content =
    `<div class="ado-query-table-placeholder" data-query-id="${guid}">` +
    `<em>Azure Boards query results (${guid}) — not available in local preview</em>` +
    `</div>\n`;
  token.map = [startLine, startLine + 1];
  state.line = startLine + 1;
  return true;
}

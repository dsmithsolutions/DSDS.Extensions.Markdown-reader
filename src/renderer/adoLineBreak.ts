import type MarkdownIt from 'markdown-it';

/**
 * markdown-it plugin: ADO soft-return rule.
 *
 * Azure DevOps requires two trailing spaces before \n to produce a <br>.
 * A single \n without trailing spaces merges lines into the same paragraph.
 *
 * Standard markdown-it already handles two-space hard breaks via the
 * `newline` core rule — but only when `options.breaks` is false (default).
 * This plugin ensures the behaviour matches ADO exactly by enabling
 * `breaks: false` (already default) and leaving the built-in newline rule
 * active, while explicitly disabling `options.breaks` so single newlines
 * are NOT converted to <br>.
 *
 * ADO reference: https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance#paragraphs-and-line-breaks
 */
export function adoLineBreakPlugin(md: MarkdownIt): void {
  // Ensure single bare newlines do NOT produce <br> (ADO default behaviour).
  // markdown-it's built-in `newline` rule already converts two-space+newline
  // to <br> regardless of the `breaks` option, so no extra rule is needed.
  md.options.breaks = false;
}

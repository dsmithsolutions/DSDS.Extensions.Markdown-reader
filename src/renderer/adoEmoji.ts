import type MarkdownIt from 'markdown-it';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { full: markdownItEmoji } = require('markdown-it-emoji') as { full: MarkdownIt.PluginSimple };

/**
 * markdown-it plugin: ADO emoji rule.
 *
 * Delegates to `markdown-it-emoji` which supports the full GitHub emoji set
 * (e.g. `:smile:`, `:+1:`). Custom emoji like `:bowtie:` are NOT supported
 * by ADO and are therefore also not supported here.
 *
 * Escape with backslash: `\:smile:` renders as literal `:smile:`.
 *
 * ADO reference: https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance#emoji-reactions
 */
export function adoEmojiPlugin(md: MarkdownIt): void {
  md.use(markdownItEmoji);
}

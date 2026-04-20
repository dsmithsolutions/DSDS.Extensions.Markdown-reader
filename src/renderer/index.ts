import MarkdownIt from 'markdown-it';
import { adoLineBreakPlugin } from './adoLineBreak.js';
import { adoImageSizePlugin } from './adoImageSize.js';
import { adoMermaidPlugin } from './adoMermaid.js';
import { adoTocPlugin } from './adoToc.js';
import { adoMathPlugin } from './adoMath.js';
import { adoEmojiPlugin } from './adoEmoji.js';
import { adoVideoPlugin } from './adoVideo.js';
import { adoQueryTablePlugin } from './adoQueryTable.js';

/**
 * Creates and returns a fully-configured markdown-it instance that renders
 * Markdown using Azure DevOps conventions.
 */
export function createRenderer(): MarkdownIt {
  const md = new MarkdownIt({
    html: true,        // Allow HTML tags in source (needed for <details>, <u>, etc.)
    linkify: true,     // Auto-link bare URLs
    typographer: false, // ADO does not apply typographic substitutions
    breaks: false,     // Single newlines do NOT produce <br> — enforced by adoLineBreak
  });

  md.use(adoLineBreakPlugin);
  md.use(adoMathPlugin);      // before fence, so $$ is caught before code blocks
  md.use(adoMermaidPlugin);   // before fence
  md.use(adoVideoPlugin);     // before fence
  md.use(adoQueryTablePlugin); // before fence
  md.use(adoImageSizePlugin);
  md.use(adoTocPlugin);
  md.use(adoEmojiPlugin);

  return md;
}

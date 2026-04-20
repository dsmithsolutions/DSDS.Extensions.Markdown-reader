import type MarkdownIt from 'markdown-it';
import type { Token } from 'markdown-it/index.js';

/**
 * markdown-it plugin: ADO image size syntax.
 *
 * Extends the standard image syntax to support an optional size suffix:
 *   ![alt](./image.png =500x250)   → width=500 height=250
 *   ![alt](./image.png =300x)      → width=300 (no height)
 *
 * The ` =WxH` suffix must be placed inside the parentheses, after the URL
 * (and after any title), separated by a space.
 *
 * ADO reference: https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance#image-size
 */
export function adoImageSizePlugin(md: MarkdownIt): void {
  // Post-process tokens: find image tokens and parse the size suffix from src.
  md.core.ruler.push('ado_image_size', (state) => {
    for (const token of state.tokens) {
      processToken(token);
    }
  });
}

function processToken(token: Token): void {
  if (token.children) {
    for (const child of token.children) {
      processToken(child);
    }
  }

  if (token.type !== 'image') {
    return;
  }

  const src = token.attrGet('src') ?? '';
  // Match optional size suffix: " =<width>x<height>" or " =<width>x"
  const sizeMatch = src.match(/^(.*?)\s+=([0-9]*)x([0-9]*)$/);
  if (!sizeMatch) {
    return;
  }

  const [, cleanSrc, rawWidth, rawHeight] = sizeMatch;
  token.attrSet('src', cleanSrc);

  if (rawWidth) {
    token.attrSet('width', rawWidth);
  }
  if (rawHeight) {
    token.attrSet('height', rawHeight);
  }
}

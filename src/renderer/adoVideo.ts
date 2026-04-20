import type MarkdownIt from 'markdown-it';
type StateBlock = MarkdownIt.StateBlock;

/**
 * markdown-it plugin: ADO video embed rule.
 *
 * Handles the ADO ::: video ::: fence that wraps an <iframe>:
 *
 *   ::: video
 *   <iframe width="640" height="360" src="https://..." allowfullscreen style="border:none"></iframe>
 *   :::
 *
 * Only `src`, `width`, `height`, `allowfullscreen`, and `style` attributes
 * are preserved on the iframe. All other attributes are stripped for security.
 * The `src` must be an https:// URL; file:// and javascript: URIs are rejected.
 *
 * ADO reference: https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance#embedded-videos
 */
export function adoVideoPlugin(md: MarkdownIt): void {
  md.block.ruler.before('fence', 'ado_video', adoVideoRule, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  });
}

const ALLOWED_IFRAME_ATTRS = new Set(['src', 'width', 'height', 'allowfullscreen', 'style']);
const SAFE_SRC_RE = /^https:\/\//i;

function sanitizeIframe(raw: string): string | null {
  // Extract the <iframe ...> tag (case-insensitive, single occurrence)
  const match = raw.match(/<iframe(\s[^>]*)?>\s*<\/iframe>/i);
  if (!match) {
    return null;
  }

  const attrsRaw = match[1] ?? '';
  const attrRe = /([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;
  const safeAttrs: string[] = [];

  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(attrsRaw)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? '';

    if (!ALLOWED_IFRAME_ATTRS.has(name)) {
      continue;
    }
    if (name === 'src') {
      if (!SAFE_SRC_RE.test(value)) {
        return null; // Reject non-https src
      }
      safeAttrs.push(`src="${value}"`);
    } else if (name === 'allowfullscreen') {
      safeAttrs.push('allowfullscreen');
    } else {
      // Escape quotes in attribute values
      const escaped = value.replace(/"/g, '&quot;');
      safeAttrs.push(`${name}="${escaped}"`);
    }
  }

  return `<iframe ${safeAttrs.join(' ')}></iframe>`;
}

function adoVideoRule(
  state: StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean
): boolean {
  const startPos = state.bMarks[startLine] + state.tShift[startLine];
  const lineText = state.src.slice(startPos, state.eMarks[startLine]);

  if (!/^:::\s*video\s*$/i.test(lineText)) {
    return false;
  }

  if (silent) {
    return true;
  }

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
    content += line + '\n';
    nextLine++;
  }

  if (!closed) {
    return false;
  }

  const sanitized = sanitizeIframe(content.trim());
  if (!sanitized) {
    return false;
  }

  const token = state.push('html_block', '', 0);
  token.content = `<div class="ado-video">${sanitized}</div>\n`;
  token.map = [startLine, nextLine];
  state.line = nextLine;
  return true;
}

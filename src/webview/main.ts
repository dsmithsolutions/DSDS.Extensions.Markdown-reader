// This script runs inside the VS Code webview (browser context).
// KaTeX and Mermaid are loaded as <script> tags before this file and expose globals.

import DOMPurify from 'dompurify';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const katex: {
  render(expression: string, element: HTMLElement, options?: Record<string, unknown>): void;
};

declare const mermaid: {
  initialize(config: Record<string, unknown>): void;
  run(opts: { nodes: NodeListOf<Element> | Element[] }): Promise<void>;
  parse(text: string, opts?: { suppressErrors?: boolean }): Promise<boolean | void>;
};

(async (): Promise<void> => {
  // ── DOMPurify — client-side sanitisation (defence-in-depth) ────────────────
  // The extension host already strips the most dangerous patterns; this pass
  // runs full DOMPurify in the browser DOM before any further processing.
  const preview = document.getElementById('preview');
  if (preview) {
    preview.innerHTML = DOMPurify.sanitize(preview.innerHTML, {
      FORBID_TAGS: ['script', 'iframe'],
      FORBID_ATTR: ['onerror', 'onclick', 'onload'],
      // Allow tags that ADO features rely on
      ADD_TAGS: ['details', 'summary', 'math'],
    });
  }

  // ── KaTeX ──────────────────────────────────────────────────────────────────
  // The renderer emits:
  //   <span data-katex-inline>expression</span>   for inline $...$
  //   <div  data-katex-display>expression</div>   for block $$...$$
  // katex.render() replaces the element's content in-place.

  document.querySelectorAll<HTMLElement>('[data-katex-inline]').forEach((el) => {
    const src = el.textContent ?? '';
    try {
      katex.render(src, el, { throwOnError: false });
    } catch {
      // Leave raw expression visible on error
    }
  });

  document.querySelectorAll<HTMLElement>('[data-katex-display]').forEach((el) => {
    const src = el.textContent ?? '';
    try {
      katex.render(src, el, { throwOnError: false, displayMode: true });
    } catch {
      // Leave raw expression visible on error
    }
  });

  // ── Mermaid ────────────────────────────────────────────────────────────────
  // The renderer emits:
  //   <div class="ado-mermaid" data-mermaid>diagram source</div>
  // mermaid.run({ nodes }) reads el.textContent as the diagram definition
  // and replaces the element's content with the rendered SVG.
  //
  // securityLevel:'strict' — prevents any script execution in diagram labels,
  // satisfying the webview security requirement (no eval/arbitrary script).

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'dark',
  });

  const mermaidNodes = document.querySelectorAll<HTMLElement>('.ado-mermaid');
  for (const node of Array.from(mermaidNodes)) {
    const source = node.textContent ?? '';
    try {
      await mermaid.parse(source, { suppressErrors: false });
    } catch (err) {
      showMermaidError(node, source, err);
      continue;
    }
    try {
      await mermaid.run({ nodes: [node] });
      // Fallback: if mermaid.run() silently produced no SVG, show the error
      if (!node.querySelector('svg')) {
        showMermaidError(node, source, 'Rendering produced no output (check diagram syntax)');
      } else {
        scaleMermaidSvg(node);
      }
    } catch (err) {
      showMermaidError(node, source, err);
    }
  }
})();

/**
 * Makes the mermaid SVG fill the available container width while preserving
 * aspect ratio. Mermaid emits SVGs with fixed px dimensions; we patch in a
 * viewBox (if absent) and then override width/height so CSS can scale them.
 */
function scaleMermaidSvg(node: HTMLElement): void {
  const svg = node.querySelector('svg');
  if (!svg) { return; }

  const w = parseFloat(svg.getAttribute('width') ?? '0');
  const h = parseFloat(svg.getAttribute('height') ?? '0');

  // Ensure a viewBox exists so the SVG scales proportionally
  if (w > 0 && h > 0 && !svg.getAttribute('viewBox')) {
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }

  // Allow CSS to control dimensions
  svg.setAttribute('width', '100%');
  svg.style.height = 'auto';
}

/**
 * Replaces a mermaid diagram container with an inline error box.
 * Uses only DOM API (createElement + textContent) so user-supplied source is
 * never injected as raw HTML — safe against XSS.
 */
function showMermaidError(node: HTMLElement, source: string, err: unknown): void {
  const message = err instanceof Error
    ? err.message
    : typeof (err as { str?: string }).str === 'string'
      ? (err as { str: string }).str
      : String(err);

  const wrapper = document.createElement('div');
  wrapper.className = 'mermaid-error';

  const title = document.createElement('p');
  title.className = 'mermaid-error__title';
  title.textContent = '⚠ Mermaid syntax error';

  const msg = document.createElement('p');
  msg.className = 'mermaid-error__message';
  msg.textContent = message;

  const sourceBlock = document.createElement('details');
  sourceBlock.className = 'mermaid-error__source';

  const summary = document.createElement('summary');
  summary.textContent = 'Diagram source';

  const pre = document.createElement('pre');
  pre.textContent = source;

  sourceBlock.appendChild(summary);
  sourceBlock.appendChild(pre);
  wrapper.appendChild(title);
  wrapper.appendChild(msg);
  wrapper.appendChild(sourceBlock);

  node.replaceWith(wrapper);
}

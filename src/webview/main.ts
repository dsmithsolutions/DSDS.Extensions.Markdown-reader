// This script runs inside the VS Code webview (browser context).
// KaTeX and Mermaid are loaded as <script> tags before this file and expose globals.

import DOMPurify from 'dompurify';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const katex: {
  render(expression: string, element: HTMLElement, options?: Record<string, unknown>): void;
};

declare const mermaid: {
  initialize(config: Record<string, unknown>): void;
  run(opts: { nodes: NodeListOf<Element> }): Promise<void>;
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

  const mermaidNodes = document.querySelectorAll('.ado-mermaid');
  if (mermaidNodes.length > 0) {
    await mermaid.run({ nodes: mermaidNodes });
  }
})();

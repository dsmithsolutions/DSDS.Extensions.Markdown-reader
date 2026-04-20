import * as vscode from 'vscode';
import { randomUUID } from 'crypto';

export interface WebviewContentOptions {
  webview: vscode.Webview;
  extensionUri: vscode.Uri;
  renderedHtml: string;
}

/**
 * Builds the full HTML document string injected into the webview panel.
 *
 * Security requirements (see .github/instructions/webview-security.instructions.md):
 *  - Strict CSP with per-load nonce on all script tags
 *  - All local URIs converted via webview.asWebviewUri()
 *  - Rendered HTML is passed in already-sanitised by the caller
 */
export function getWebviewContent(opts: WebviewContentOptions): string {
  const { webview, extensionUri, renderedHtml } = opts;

  const nonce = randomUUID().replace(/-/g, '');

  const cssUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'media', 'ado.css')
  );
  const katexCssUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'node_modules', 'katex', 'dist', 'katex.min.css')
  );
  const katexScriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'node_modules', 'katex', 'dist', 'katex.min.js')
  );
  const mermaidScriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js')
  );
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'out', 'webview', 'main.js')
  );

  const csp = [
    `default-src 'none'`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `script-src ${webview.cspSource} 'nonce-${nonce}'`,
    `img-src ${webview.cspSource} https: data:`,
    `font-src ${webview.cspSource}`,
    `worker-src blob:`,
  ].join('; ');

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${katexCssUri}">
  <link rel="stylesheet" href="${cssUri}">
  <title>ADO Markdown Preview</title>
</head>
<body>
  <div id="preview">${renderedHtml}</div>
  <script nonce="${nonce}" src="${katexScriptUri}"></script>
  <script nonce="${nonce}" src="${mermaidScriptUri}"></script>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

import * as vscode from 'vscode';
import { createRenderer } from '../renderer/index.js';
import { getWebviewContent } from './getWebviewContent.js';

/**
 * Manages a single ADO Markdown preview WebviewPanel.
 *
 * One panel is created per document; VS Code's CustomEditorProvider lifecycle
 * handles open/close. The panel re-renders whenever the underlying document
 * changes.
 */
export class AdoPreviewPanel {
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _filename: string;
  private readonly _renderer = createRenderer();
  private _disposables: vscode.Disposable[] = [];

  static readonly viewType = 'dsds.adoMarkdownPreview';

  constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    document: vscode.TextDocument
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._filename = document.uri.path.split('/').pop() ?? document.uri.fsPath;

    this._panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(extensionUri, 'media'),
        vscode.Uri.joinPath(extensionUri, 'out'),
        vscode.Uri.joinPath(extensionUri, 'node_modules', 'katex', 'dist'),
        vscode.Uri.joinPath(extensionUri, 'node_modules', 'mermaid', 'dist'),
      ],
    };

    this._render(document.getText());

    // Re-render on document change
    vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          this._render(e.document.getText());
        }
      },
      null,
      this._disposables
    );

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  private _render(markdown: string): void {
    const rendered = this._renderer.render(markdown);
    const sanitized = sanitizeHtml(rendered);

    this._panel.webview.html = getWebviewContent({
      webview: this._panel.webview,
      extensionUri: this._extensionUri,
      renderedHtml: sanitized,
      filename: this._filename,
    });
  }

  dispose(): void {
    for (const d of this._disposables) {
      d.dispose();
    }
    this._disposables = [];
  }
}

/**
 * Server-side HTML sanitisation.
 *
 * DOMPurify requires a DOM environment (browser or jsdom). In the extension
 * host (Node.js) we perform a lightweight strip of the most dangerous patterns.
 * The webview's CSP provides the primary defence; this is a defence-in-depth
 * measure.
 *
 * Full DOMPurify sanitisation runs in the webview itself via main.js.
 */
function sanitizeHtml(html: string): string {
  return html
    // Strip <script> blocks
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    // Strip javascript: URIs
    .replace(/href\s*=\s*["']\s*javascript:[^"']*/gi, 'href="#"')
    // Strip event handler attributes
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
}

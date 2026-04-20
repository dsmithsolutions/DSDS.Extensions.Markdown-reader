import * as vscode from 'vscode';
import { AdoPreviewPanel } from './webview/panel.js';

/**
 * Extension entry point.
 *
 * Registers:
 *  1. A CustomEditorProvider for .md files (viewType: dsds.adoMarkdownPreview)
 *  2. A command `dsds.openAdoPreview` to open the current .md file in the
 *     ADO preview panel
 */
export function activate(context: vscode.ExtensionContext): void {
  // 1. Custom editor provider
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      AdoPreviewPanel.viewType,
      new AdoMarkdownEditorProvider(context),
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: false,
      }
    )
  );

  // 2. Command: open active .md in ADO preview
  context.subscriptions.push(
    vscode.commands.registerCommand('dsds.openAdoPreview', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !editor.document.fileName.endsWith('.md')) {
        vscode.window.showWarningMessage('Open a Markdown (.md) file first.');
        return;
      }
      vscode.commands.executeCommand(
        'vscode.openWith',
        editor.document.uri,
        AdoPreviewPanel.viewType
      );
    })
  );
}

export function deactivate(): void {
  // Nothing to clean up; subscriptions are disposed by VS Code automatically.
}

/**
 * Implements the VS Code CustomEditorProvider interface.
 * Creates an AdoPreviewPanel for each .md document opened with this editor.
 */
class AdoMarkdownEditorProvider implements vscode.CustomEditorProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  // This preview is read-only — we don't implement custom persistence.
  readonly onDidChangeCustomDocument = new vscode.EventEmitter<never>().event;

  async saveCustomDocument(): Promise<void> { /* read-only */ }
  async saveCustomDocumentAs(): Promise<void> { /* read-only */ }
  async revertCustomDocument(): Promise<void> { /* read-only */ }
  async backupCustomDocument(document: vscode.CustomDocument, context: vscode.CustomDocumentBackupContext): Promise<vscode.CustomDocumentBackup> {
    return { id: context.destination.toString(), delete: () => undefined };
  }

  async openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.CustomDocument> {
    return { uri, dispose: () => undefined };
  }

  async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    const textDoc = await vscode.workspace.openTextDocument(document.uri);
    new AdoPreviewPanel(webviewPanel, this.context.extensionUri, textDoc);
  }
}

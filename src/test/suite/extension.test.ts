import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  test('Extension is registered', () => {
    const ext = vscode.extensions.getExtension('DSDS.dsds-extensions-markdown-reader');
    assert.ok(ext, 'Extension should be present in the development host');
  });

  test('Command dsds.openAdoPreview is registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes('dsds.openAdoPreview'),
      'dsds.openAdoPreview command should be registered'
    );
  });
});

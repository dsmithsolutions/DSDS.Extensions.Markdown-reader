# Contributing & Development

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- VS Code 1.90 or later

## Setup

```bash
npm install
npm run compile
```

Or use **watch mode** to recompile on every save:

```bash
npm run watch
```

## Running the Extension Locally

1. Open this folder in VS Code (`File → Open Folder…`).
2. Press **F5** (or go to **Run → Start Debugging**).
3. VS Code opens a second window — the **Extension Development Host** — with the extension loaded.

> The launch configuration is in `.vscode/launch.json` under the **"Extension Development Host"** profile. It automatically runs `npm run compile` before launching.

### Open a Markdown file with the ADO preview

**Option A — Open with the ADO editor directly**

1. Open any `.md` file (e.g. `sample.md` in this repo).
2. Right-click the file in the Explorer and choose **"Open With…"**.
3. Select **"ADO Markdown Preview"** from the list.

**Option B — Use the command palette**

1. Open a `.md` file in the active editor.
2. Open the Command Palette (`⇧⌘P` / `Ctrl+Shift+P`).
3. Run **"ADO Markdown: Open ADO Markdown Preview"**.

### Live reload

With **watch mode** running (`npm run watch`), edits to `src/` are recompiled automatically. In the Extension Development Host, use **Developer: Reload Window** (`⌘R` / `Ctrl+R`) to pick up the new compiled output.

## Project Structure

```
src/
  extension.ts              # Activation, command + custom editor registration
  renderer/
    index.ts                # Configures the markdown-it instance
    adoLineBreak.ts         # Two-space soft-return rule
    adoImageSize.ts         # =WxH image size suffix
    adoMermaid.ts           # ::: mermaid fence
    adoToc.ts               # [[_TOC_]] table of contents
    adoMath.ts              # KaTeX $…$ / $$…$$
    adoEmoji.ts             # :emoji-name: support
    adoVideo.ts             # ::: video <iframe> :::
    adoQueryTable.ts        # :::query-table {guid}:::
  webview/
    panel.ts                # WebviewPanel wrapper
    getWebviewContent.ts    # HTML builder (nonce CSP, asset URIs)
media/
  ado.css                   # Extension stylesheet
```

## Building a VSIX Package

```bash
npm run compile && npm run package
```

Produces `dsds-extensions-markdown-reader-<version>.vsix`. Install manually via **Extensions: Install from VSIX…** in the Command Palette.

## Publishing

```bash
npm run login    # authenticate with the Marketplace (one-time)
npm run publish  # compile + publish to VS Code Marketplace
```

## Sample File

`sample.md` demonstrates every supported ADO feature. Open it with the ADO preview in the Extension Development Host to verify rendering.

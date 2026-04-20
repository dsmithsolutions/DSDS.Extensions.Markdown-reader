# ADO Markdown Reader

Preview Markdown files in VS Code exactly as they appear in **Azure DevOps** — wikis, pull requests, and READMEs — using ADO rendering conventions instead of standard CommonMark.

---

## Features

| Feature | Syntax |
|---|---|
| **ADO line breaks** | Two trailing spaces → line break; single newline merges |
| **Image sizing** | ADO extended syntax sets explicit width × height |
| **Mermaid diagrams** | `::: mermaid … :::` fence (ADO style) |
| **KaTeX math** | `$inline$` and `$$block$$` |
| **Table of Contents** | `[[_TOC_]]` auto-generates a heading nav |
| **Emoji** | `:smile:` GitHub emoji set |
| **Video embeds** | `::: video … :::` block |
| **Query table** | `:::query-table {guid}:::` placeholder |

---

## Usage

### Open a file with the ADO preview

**Via Explorer context menu**
Right-click any `.md` file → **Open With…** → **ADO Markdown Preview**

**Via Command Palette**
Open a `.md` file, then press `⇧⌘P` / `Ctrl+Shift+P` and run:
> **ADO Markdown: Open ADO Markdown Preview**

The preview updates automatically as you edit the file.

---

## Known Limitations

The following ADO features require a live Azure DevOps connection and are shown as informational placeholders in the local preview:

| Feature | Behaviour |
|---|---|
| `:::query-table {guid}:::` | Placeholder: _"Azure Boards query table — not available in local preview"_ |
| `[[_TOSP_]]` | Placeholder: _"Table of Sub-Pages — not available in local preview"_ |
| `::: video … :::` | Placeholder showing the raw iframe source |
| `@<alias>` mentions | Rendered as plain text |
| `#<work-item-id>` links | Rendered as plain text |

---

## References

- [Azure DevOps Markdown guidance](https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance)
- [Contributing & local development](CONTRIBUTING.md)



# ADO Markdown Sample

This file demonstrates all Azure DevOps Markdown features supported by this extension.

---

## 1. Basic Formatting

**Bold text**, _italic text_, ~~strikethrough~~, and `inline code`.

> Blockquote example — ADO renders these with a left border.

---

## 2. Line Breaks (ADO Style)

ADO only creates a `<br>` when you use **two trailing spaces**:

Line one (no break follows — lines merge)
Line two (still the same paragraph)

Line one with two trailing spaces  
Line two (this is on a new line)

---

## 3. Image with Size

![VS Code logo](https://code.visualstudio.com/assets/images/code-stable.png =120x120)

Caption: sized to 120×120 via `=120x120` suffix.

---

## 4. Mathematical Notation (KaTeX)

Inline math: $E = mc^2$

Block math:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

---

## 5. Mermaid Diagram

::: mermaid
sequenceDiagram
  participant User
  participant Extension
  participant Renderer
  User->>Extension: Open .md file
  Extension->>Renderer: render(markdown)
  Renderer-->>Extension: HTML string
  Extension-->>User: Webview panel
:::

---

## 6. Table of Contents

[[_TOC_]]

---

## 7. Emoji

:smile: :rocket: :white_check_mark: :warning: :tada:

Escaped: \:not-an-emoji\:

---

## 8. Tables

| Feature          | Standard MD | ADO  |
|------------------|:-----------:|:----:|
| Line breaks      | Single `\n` | 2 spaces |
| Image sizing     | ✗           | ✓    |
| Mermaid (`:::`)  | ✗           | ✓    |
| KaTeX math       | ✗           | ✓    |
| `[[_TOC_]]`      | ✗           | ✓    |

---

## 9. Collapsible Section

<details>
<summary>Click to expand</summary>

This content is hidden until the user clicks the summary.

- Item A
- Item B
- Item C

</details>

---

## 10. Code Blocks

```typescript
export function createRenderer(): MarkdownIt {
  const md = new MarkdownIt({ html: true });
  md.use(adoMathPlugin);
  md.use(adoMermaidPlugin);
  return md;
}
```

```json
{
  "publisher": "DSDS",
  "name": "dsds-extensions-markdown-reader"
}
```

---

## 11. Task List

- [x] Implement renderer plugins
- [x] Implement extension entry point
- [ ] Publish to VS Code Marketplace

---

## 12. Anchor Links

Jump to sections: [Basic Formatting](#basic-formatting) · [Tables](#tables) · [Emoji](#emoji)

---

*Rendered by the ADO Markdown Reader extension.*

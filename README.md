# UI Grabber

Inspect any element on any web page, the way you would in Figma. UI Grabber is a single script with no dependencies, and it works with any framework or none.

- **Measurements on hover:** padding in green, margin in orange, gap in purple, each with its value in px.
- **Readable names:** shows `CaseCard › button “View case”` instead of `a.relative.isolate.inline-flex…`. It reads component names from React, Next.js, Vue, Svelte and Angular in development builds, and otherwise falls back to the element's role and text.
- **Copy what you need:**
  - a short, unique CSS selector;
  - the CSS rules that apply to the element, including Tailwind 4 layers and media queries, with the final value of each `var()`;
  - its spacing.
- **Made for AI-assisted work:** ⌘C copies the element's name, selector and HTML, ready to paste into your AI chat.

The interface follows the browser language: Portuguese or English.

## Install

Add one line to your page. Load it in development only, so your visitors never see it:

```html
<script src="https://cdn.jsdelivr.net/gh/AdrianSilvaFuentes/ui-grabber@0.1/ui-grabber.js" defer></script>
```

`@0.1` gets every 0.1.x fix automatically. Use `@0.1.0` to pin an exact version.

### Next.js

```tsx
import Script from "next/script";

{process.env.NODE_ENV === "development" && (
  <Script src="https://cdn.jsdelivr.net/gh/AdrianSilvaFuentes/ui-grabber@0.1/ui-grabber.js" />
)}
```

### Vite (React, Vue, Svelte…)

```html
<!-- index.html -->
<script type="module">
  if (import.meta.env.DEV) {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/gh/AdrianSilvaFuentes/ui-grabber@0.1/ui-grabber.js";
    document.head.appendChild(s);
  }
</script>
```

### Language

The language comes from the browser. To force one, add `data-lang="en"` or `data-lang="pt"` to the script tag.

## Use

| Action | What it does |
|---|---|
| **Grab** badge (bottom right) or **⌘G / Ctrl+G** | Turn on / off |
| Hover | Outline, name, size and spacing of the element |
| **↑ / ↓** | Select the parent / first child |
| Click or **Alt** | Open the menu: copy selector, copy CSS, copy spacing, hide element |
| **⌘C / Ctrl+C** | Copy name + selector + HTML |
| **Esc** | Close the menu |

Elements you hide come back when you turn Grab off.

## Good to know

- Component names only show in development builds. Production builds minify them, so UI Grabber shows the element's role and text instead.
- CSS from another domain, such as some font or CDN stylesheets, cannot be read by any script, so those rules are left out.
- Some sites block outside scripts through a Content Security Policy. On those sites, add `cdn.jsdelivr.net` to the policy in development, or serve the file yourself.

---

## Em português

O UI Grabber inspeciona qualquer elemento de qualquer página, como no Figma. É um script único, sem dependências, que funciona com qualquer framework ou sem nenhum.

**O que ele faz:**
- **Medidas ao passar o mouse:** padding em verde, margem em laranja e gap em roxo, cada um com o valor em px.
- **Nomes legíveis:** mostra o nome do componente, o papel do elemento e o texto dele.
- **Opções para copiar:**
  - um seletor curto e único;
  - o CSS que vale para o elemento;
  - os espaçamentos.
- **⌘C:** copia tudo pronto para colar no seu chat de IA.

**Instalação:** cole a linha do `<script>` acima no seu projeto, só no modo de desenvolvimento. A interface aparece em português quando o navegador está em português. Para escolher o idioma, use `data-lang="pt"` ou `data-lang="en"`.

## License

[MIT](LICENSE) © Adrián Silva Fuentes

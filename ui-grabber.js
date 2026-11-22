/*! UI Grabber v0.1.1 · MIT License · https://github.com/AdrianSilvaFuentes/ui-grabber */
/* ═══ UI Grabber ═══
   Inspect any element on any page, framework-agnostic, no dependencies.

   Click          → menu: copy selector / copy CSS / copy spacing / hide element
   Alt            → open the menu for the hovered element
   ↑ / ↓          → select the parent / first child
   ⌘C / Ctrl+C    → copy name + selector + HTML
   ⌘G / Ctrl+G    → turn on / off
   Esc            → close the menu
   Badge          → bottom right corner
   Measurements   → on hover, like Figma: padding in green, margin in orange, gap in purple,
                    corner radius in pink (the outline follows the element's corners)

   Language: follows the browser (Portuguese or English). Force it with
   <script src="…/ui-grabber.js" data-lang="en"></script> (or "pt").
*/
(function () {
  if (window.__uiGrabber) return; // loaded twice: keep the first one
  window.__uiGrabber = true;

  /* ─── Language ─── */
  const script = document.currentScript;
  const forced = script && script.dataset && script.dataset.lang;
  const LANG = (forced || navigator.language || 'en').toLowerCase().startsWith('pt') ? 'pt' : 'en';

  const STRINGS = {
    en: {
      badge: 'Grab', badgeOn: '✦ Grab ON', badgeTitle: 'Turn on UI Grabber (⌘G / Ctrl+G)',
      copySelector: 'Copy selector', copyCSS: 'Copy CSS', copySpacing: 'Copy spacing',
      hide: 'Hide element', show: 'Show element',
      selectorCopied: '✦ Selector copied', cssCopied: '✦ CSS copied', spacingCopied: '▣ Spacing copied',
      hidden: '◻ Element hidden — turn Grab off to restore it', restored: '◻ Element restored',
      htmlCopied: '✦ Selector + HTML copied — paste it into your AI chat',
      noRules: '/* no rules found */', noValue: '/* no value */',
      gapRowsCols: '/* rows columns */', notFlexGrid: '/* not flex or grid */',
      size: 'size', truncated: '…[truncated]',
      groups: { Layout: 'Layout', Style: 'Style', Typography: 'Typography', Transition: 'Transition', Other: 'Other' },
      tags: {
        a: 'link', article: 'article', aside: 'aside', blockquote: 'quote', button: 'button',
        code: 'code', dialog: 'dialog', div: 'block', dl: 'description list', fieldset: 'field group',
        figcaption: 'caption', figure: 'figure', footer: 'footer', form: 'form', header: 'header',
        h1: 'heading 1', h2: 'heading 2', h3: 'heading 3', h4: 'heading 4', h5: 'heading 5', h6: 'heading 6',
        hr: 'divider', iframe: 'frame', img: 'image', input: 'input', label: 'label', li: 'list item',
        main: 'main content', nav: 'navigation', ol: 'numbered list', option: 'option', p: 'paragraph',
        picture: 'image', pre: 'code block', section: 'section', select: 'select', small: 'small text',
        span: 'text', strong: 'bold text', svg: 'icon', table: 'table', tbody: 'table body', td: 'cell',
        textarea: 'text area', th: 'header cell', thead: 'table header', tr: 'row',
        ul: 'list', video: 'video', canvas: 'canvas', path: 'icon path',
      },
    },
    pt: {
      badge: 'Grab', badgeOn: '✦ Grab ON', badgeTitle: 'Ativar o UI Grabber (⌘G / Ctrl+G)',
      copySelector: 'Copiar seletor', copyCSS: 'Copiar CSS', copySpacing: 'Copiar espaçamentos',
      hide: 'Ocultar elemento', show: 'Mostrar elemento',
      selectorCopied: '✦ Seletor copiado', cssCopied: '✦ CSS copiado', spacingCopied: '▣ Espaçamentos copiados',
      hidden: '◻ Elemento oculto — desative o Grab para restaurar', restored: '◻ Elemento restaurado',
      htmlCopied: '✦ Seletor + HTML copiados — cole no seu chat de IA',
      noRules: '/* nenhuma regra encontrada */', noValue: '/* sem valor */',
      gapRowsCols: '/* linhas colunas */', notFlexGrid: '/* não é flex nem grid */',
      size: 'tamanho', truncated: '…[truncado]',
      groups: { Layout: 'Layout', Style: 'Estilo', Typography: 'Tipografia', Transition: 'Transição', Other: 'Outros' },
      tags: {
        a: 'link', article: 'artigo', aside: 'lateral', blockquote: 'citação', button: 'botão',
        code: 'código', dialog: 'diálogo', div: 'bloco', dl: 'lista de definições', fieldset: 'grupo de campos',
        figcaption: 'legenda', figure: 'figura', footer: 'rodapé', form: 'formulário', header: 'cabeçalho',
        h1: 'título 1', h2: 'título 2', h3: 'título 3', h4: 'título 4', h5: 'título 5', h6: 'título 6',
        hr: 'divisória', iframe: 'quadro', img: 'imagem', input: 'campo', label: 'rótulo', li: 'item de lista',
        main: 'conteúdo principal', nav: 'navegação', ol: 'lista numerada', option: 'opção', p: 'parágrafo',
        picture: 'imagem', pre: 'bloco de código', section: 'seção', select: 'seleção', small: 'texto pequeno',
        span: 'texto', strong: 'destaque', svg: 'ícone', table: 'tabela', tbody: 'corpo da tabela', td: 'célula',
        textarea: 'campo de texto', th: 'célula de cabeçalho', thead: 'cabeçalho da tabela', tr: 'linha',
        ul: 'lista', video: 'vídeo', canvas: 'tela de desenho', path: 'traço do ícone',
      },
    },
  };
  const T = STRINGS[LANG];

  function start() {
    let active = false;
    const IGNORE = new WeakSet();

    const hl = document.createElement('div');
    hl.style.cssText = 'position:fixed;z-index:2147483644;pointer-events:none;outline:2px solid #0360FD;background:rgba(3,96,253,.07);border-radius:3px;opacity:0;transition:opacity .1s;';
    document.body.appendChild(hl);
    IGNORE.add(hl);

    /* ─── Measurements (padding, margin, gap), drawn under the outline ─── */
    const measures = document.createElement('div');
    measures.style.cssText = 'position:fixed;inset:0;z-index:2147483643;pointer-events:none;';
    document.body.appendChild(measures);
    IGNORE.add(measures);

    const COLORS = {
      padding: { fill: 'rgba(16,185,129,.28)', label: '#059669' },
      margin: { fill: 'rgba(249,115,22,.24)', label: '#ea580c' },
      gap: { fill: 'rgba(139,92,246,.30)', label: '#7c3aed' },
    };

    function px(v) { return parseFloat(v) || 0; }
    function fmt(n) { return String(Math.round(n * 10) / 10); }

    function addRect(x, y, w, h, kind) {
      if (w < 0.5 || h < 0.5) return;
      const d = document.createElement('div');
      d.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${COLORS[kind].fill};`;
      measures.appendChild(d);
    }

    function addLabel(x, y, value, kind) {
      if (value < 0.5) return;
      const d = document.createElement('div');
      d.textContent = fmt(value);
      d.style.cssText = `position:fixed;left:${x}px;top:${y}px;transform:translate(-50%,-50%);background:${COLORS[kind].label};color:#fff;font:600 10px/1 monospace;padding:2px 4px;border-radius:3px;white-space:nowrap;`;
      measures.appendChild(d);
    }

    // A colored band with its value in the middle.
    function band(x, y, w, h, value, kind) {
      addRect(x, y, w, h, kind);
      if (w >= 0.5 && h >= 0.5) addLabel(x + w / 2, y + h / 2, value, kind);
    }

    function clearMeasures() { measures.innerHTML = ''; }

    function drawMeasures(el) {
      clearMeasures();
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const m = { t: px(cs.marginTop), r: px(cs.marginRight), b: px(cs.marginBottom), l: px(cs.marginLeft) };
      const bw = { t: px(cs.borderTopWidth), r: px(cs.borderRightWidth), b: px(cs.borderBottomWidth), l: px(cs.borderLeftWidth) };
      const p = { t: px(cs.paddingTop), r: px(cs.paddingRight), b: px(cs.paddingBottom), l: px(cs.paddingLeft) };

      // Margin: outside the box. Negative margins are not drawn.
      if (m.t > 0) band(r.left, r.top - m.t, r.width, m.t, m.t, 'margin');
      if (m.b > 0) band(r.left, r.bottom, r.width, m.b, m.b, 'margin');
      if (m.l > 0) band(r.left - m.l, r.top, m.l, r.height, m.l, 'margin');
      if (m.r > 0) band(r.right, r.top, m.r, r.height, m.r, 'margin');

      // Padding: inside the border.
      const inL = r.left + bw.l, inR = r.right - bw.r, inT = r.top + bw.t, inB = r.bottom - bw.b;
      if (p.t > 0) band(inL, inT, inR - inL, p.t, p.t, 'padding');
      if (p.b > 0) band(inL, inB - p.b, inR - inL, p.b, p.b, 'padding');
      if (p.l > 0) band(inL, inT + p.t, p.l, inB - inT - p.t - p.b, p.l, 'padding');
      if (p.r > 0) band(inR - p.r, inT + p.t, p.r, inB - inT - p.t - p.b, p.r, 'padding');

      // Gap: flex and grid only, between neighbouring children, using the declared value.
      if (!/flex|grid/.test(cs.display)) return;
      const rowGap = px(cs.rowGap), colGap = px(cs.columnGap);
      if (!rowGap && !colGap) return;
      const kids = Array.from(el.children).filter(c => {
        if (IGNORE.has(c)) return false;
        const k = getComputedStyle(c);
        return k.display !== 'none' && k.position !== 'absolute' && k.position !== 'fixed';
      }).map(c => c.getBoundingClientRect()).filter(k => k.width || k.height);
      const cL = inL + p.l, cR = inR - p.r;
      let rowLabel = false, colLabel = false;
      for (let i = 1; i < kids.length; i++) {
        const a = kids[i - 1], b = kids[i];
        if (rowGap && b.top >= a.bottom - 1) {
          // New row: horizontal band above the child, across the content width.
          addRect(cL, b.top - rowGap, cR - cL, rowGap, 'gap');
          if (!rowLabel) { addLabel(cL + (cR - cL) / 2, b.top - rowGap / 2, rowGap, 'gap'); rowLabel = true; }
        } else if (colGap && b.left >= a.right - 1) {
          // Same row: vertical band left of the child, as tall as the pair.
          const top = Math.min(a.top, b.top), bottom = Math.max(a.bottom, b.bottom);
          addRect(b.left - colGap, top, colGap, bottom - top, 'gap');
          if (!colLabel) { addLabel(b.left - colGap / 2, top + (bottom - top) / 2, colGap, 'gap'); colLabel = true; }
        }
      }
    }

    function four(cs, a, b, c, d, unit) {
      const v = [a, b, c, d].map(x => `${fmt(px(cs[x]))}${unit}`);
      if (v.every(x => x === v[0])) return v[0];
      if (v[0] === v[2] && v[1] === v[3]) return `${v[0]} ${v[1]}`;
      return v.join(' ');
    }

    // Corner radius in px, as drawn: % resolved against the box, and each corner capped at half the
    // shorter side (that is how browsers draw rounded-full / 9999px). Returns '' when there is none.
    function radiusText(el, cs, unit) {
      const r = el.getBoundingClientRect();
      const half = Math.min(r.width, r.height) / 2;
      const corners = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'];
      let pill = true;
      const v = corners.map(k => {
        const first = String(cs[k] || '0').trim().split(/\s+/)[0]; // "8px" or "8px 4px" (elliptical): use the first
        const raw = first.endsWith('%') ? (parseFloat(first) || 0) * r.width / 100 : px(first);
        if (raw <= half) pill = false;
        return Math.min(raw, half);
      });
      if (v.every(x => x < 0.5)) return '';
      if (pill) return 'full';
      const s = v.map(x => `${fmt(x)}${unit}`);
      if (s.every(x => x === s[0])) return s[0];
      if (s[0] === s[2] && s[1] === s[3]) return `${s[0]} ${s[1]}`;
      return s.join(' ');
    }

    // Summary in the label: p (padding), m (margin), gap and r (corner radius), in px.
    function measureSummary(el) {
      const cs = getComputedStyle(el);
      const parts = [];
      const pad = four(cs, 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', '');
      const mar = four(cs, 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', '');
      if (pad !== '0') parts.push(`<span style="color:#34d399">p ${pad}</span>`);
      if (mar !== '0') parts.push(`<span style="color:#fb923c">m ${mar}</span>`);
      if (/flex|grid/.test(cs.display)) {
        const rg = px(cs.rowGap), cg = px(cs.columnGap);
        if (rg || cg) parts.push(`<span style="color:#a78bfa">gap ${rg === cg ? fmt(rg) : `${fmt(rg)} ${fmt(cg)}`}</span>`);
      }
      const rad = radiusText(el, cs, '');
      if (rad) parts.push(`<span style="color:#f472b6">r ${rad}</span>`);
      return parts.join('<span style="color:#475569"> · </span>');
    }

    // "Copy spacing": padding, margin and gap in px, plus the utility classes that set them.
    function getSpacing(el) {
      const cs = getComputedStyle(el);
      const lines = [getName(el), shortSelector(el), ''];
      lines.push(`padding: ${four(cs, 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'px')};`);
      lines.push(`margin: ${four(cs, 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'px')};`);
      if (/flex|grid/.test(cs.display)) {
        const rg = px(cs.rowGap), cg = px(cs.columnGap);
        lines.push(rg === cg ? `gap: ${fmt(rg)}px;` : `gap: ${fmt(rg)}px ${fmt(cg)}px; ${T.gapRowsCols}`);
      } else {
        lines.push(`gap: — ${T.notFlexGrid}`);
      }
      const rad = radiusText(el, cs, 'px');
      lines.push(`border-radius: ${rad === 'full' ? '9999px; /* full */' : (rad || '0') + ';'}`);
      const SPACING = /^(?:[a-z0-9-]+:)*-?(?:(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-|rounded(?:-|$))/;
      const classes = Array.from(el.classList).filter(c => SPACING.test(c));
      if (classes.length) lines.push('', `classes: ${classes.join(' ')}`);
      const r = el.getBoundingClientRect();
      lines.push(`${T.size}: ${Math.round(r.width)}×${Math.round(r.height)}px`);
      return lines.join('\n');
    }

    const tip = document.createElement('div');
    tip.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;background:#0f1117;color:#e2e8f0;font:600 11px/1 monospace;padding:4px 8px;border-radius:5px;white-space:nowrap;opacity:0;transition:opacity .1s;';
    document.body.appendChild(tip);
    IGNORE.add(tip);

    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#0f1117;color:#fff;font:500 12px/1 sans-serif;padding:8px 18px;border-radius:8px;opacity:0;transition:opacity .2s;pointer-events:none;white-space:nowrap;';
    document.body.appendChild(toast);
    IGNORE.add(toast);

    const badge = document.createElement('button');
    badge.type = 'button';
    badge.textContent = T.badge;
    badge.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:2147483646;padding:5px 12px;border-radius:999px;border:1.5px solid #0360FD;background:#fff;color:#0360FD;font:600 11px/1 sans-serif;cursor:pointer;opacity:.55;transition:opacity .15s,background .15s,color .15s;letter-spacing:.03em;';
    badge.title = T.badgeTitle;
    document.body.appendChild(badge);
    IGNORE.add(badge);

    const menu = document.createElement('div');
    menu.style.cssText = 'position:fixed;z-index:2147483647;background:#0f1117;border:1px solid #2d3748;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:opacity .1s;min-width:180px;';
    document.body.appendChild(menu);
    IGNORE.add(menu);

    let hovered = null;
    let toastTimer;
    let menuVisible = false;
    const hiddenEls = new Map();

    function setActive(val) {
      active = val;
      badge.textContent = active ? T.badgeOn : T.badge;
      badge.style.background = active ? '#0360FD' : '#fff';
      badge.style.color = active ? '#fff' : '#0360FD';
      badge.style.opacity = active ? '1' : '.55';
      if (!active) { hl.style.opacity = '0'; tip.style.opacity = '0'; clearMeasures(); hideMenu(); restoreHidden(); }
    }

    badge.addEventListener('click', () => setActive(!active));

    /* ─── Readable element name (works on any site) ───
       1. Name given by the author: data-name, data-testid, data-component, data-slot or id.
       2. Component that created the element: React, Vue, Svelte or Angular (dev builds only;
          minified production names are ignored).
       3. The element's role, in plain words (ARIA role, or the translated tag).
       4. A bit of its content: button, link, heading or label text, or the image alt. */
    const TEXT_TAGS = /^(a|button|h[1-6]|label|figcaption|option|summary|legend|th|dt)$/;
    // "Plumbing" components that wrap others and say nothing about what the element is.
    const PLUMBING = /^(Slot|SlotClone|Slottable|Primitive.*|Presence|Portal|Fragment|Suspense|StrictMode|ForwardRef|Memo|Anonymous|Popper.*|.*Anchor|Collection.*|Dismissable.*|FocusScope|FocusGuards|RovingFocus.*|VisuallyHidden|RemoveScroll.*|.*Provider|.*Context|.*Boundary|.*Router|.*Handler|.*Template|.*Wrapper|LinkComponent|Head|Script|Transition.*)$/;

    function clip(text, max = 32) {
      const t = (text || '').replace(/\s+/g, ' ').trim();
      return t.length > max ? `${t.slice(0, max - 1)}…` : t;
    }

    function goodName(n) {
      // "Slot.Slot", "Select.Trigger": every part of the name is checked.
      return typeof n === 'string' && n.length >= 3 && /^[A-Z]/.test(n) && !n.split('.').some(x => PLUMBING.test(x)) ? n : null;
    }

    function reactName(el) {
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
      if (!key) return null;
      const fiber = el[key];
      const nameOf = f => {
        if (!f) return null;
        const t = f.type;
        if (t && typeof t === 'object') return t.displayName || t.render?.displayName || t.render?.name || t.type?.displayName || t.type?.name || null;
        if (typeof t === 'function') return t.displayName || t.name;
        return f.name || null; // server component (React 19 only gives a name)
      };
      // The owner first: the component whose code wrote this element.
      for (let o = fiber._debugOwner, i = 0; o && i < 15; o = o._debugOwner || o.owner, i++) {
        const n = goodName(nameOf(o));
        if (n) return n;
      }
      // No owner (production or older React): walk up the tree.
      for (let f = fiber.return, i = 0; f && i < 40; f = f.return, i++) {
        if (typeof f.type === 'string') continue;
        const n = goodName(nameOf(f));
        if (n) return n;
      }
      return null;
    }

    function componentName(el) {
      try {
        const r = reactName(el);
        if (r) return r;
        // Vue 3 and Vue 2
        const v3 = el.__vueParentComponent;
        const vue = v3 && (v3.type?.name || v3.type?.__name || (v3.type?.__file || '').split('/').pop()?.replace(/\.vue$/, ''));
        if (goodName(vue)) return vue;
        const v2 = el.__vue__?.$options;
        if (v2 && goodName(v2.name || v2._componentTag)) return v2.name || v2._componentTag;
        // Svelte: the component file
        const sv = el.__svelte_meta?.loc?.file;
        if (sv) return sv.split('/').pop().replace(/\.svelte$/, '');
        // Angular
        const ng = window.ng?.getOwningComponent?.(el);
        if (ng && goodName(ng.constructor?.name)) return ng.constructor.name.replace(/^_/, '');
      } catch (_) { /* an unexpected framework must never break the grabber */ }
      return null;
    }

    function authorName(el) {
      for (const a of ['data-name', 'data-testid', 'data-test', 'data-cy', 'data-component', 'data-slot']) {
        const v = el.getAttribute(a);
        if (v) return v;
      }
      // An id written by a person, not generated (e.g. ":r1:", "radix-:r3:", "headlessui-menu-5").
      if (el.id && !/[:«»]|^_r_|^radix-|^headlessui-|^react-|\d{3,}|^[a-f0-9-]{16,}$/i.test(el.id)) return `#${el.id}`;
      return null;
    }

    function roleName(el) {
      const role = el.getAttribute('role');
      if (role) return role;
      const tag = el.tagName.toLowerCase();
      return T.tags[tag] || tag;
    }

    function contentHint(el) {
      const aria = el.getAttribute('aria-label');
      if (aria) return clip(aria);
      const tag = el.tagName.toLowerCase();
      if (tag === 'img') return clip(el.getAttribute('alt'));
      if (tag === 'input' || tag === 'textarea') return clip(el.getAttribute('placeholder') || el.getAttribute('name'));
      if (TEXT_TAGS.test(tag)) return clip(el.innerText || el.textContent);
      // A section with a heading: use the heading.
      const lb = el.getAttribute('aria-labelledby');
      const ref = lb && document.getElementById(lb.split(' ')[0]);
      if (ref) return clip(ref.textContent);
      return '';
    }

    // e.g. "CaseCard › button “View case”", "Hero › heading 1 “Hi! I’m…”", "#contact › section".
    function getName(el) {
      const parts = [];
      const comp = componentName(el);
      const author = authorName(el);
      if (comp) parts.push(comp);
      if (author && author !== comp) parts.push(author);
      const hint = contentHint(el);
      parts.push(hint ? `${roleName(el)} “${hint}”` : roleName(el));
      return parts.join(' › ');
    }

    /* ─── Short, unique selector (no long lists of utility classes) ───
       Anchors, best first: hand-written id, data-testid & co., aria-labelledby, landmark
       tags (header, nav, main, footer, aside), aria-label. From the element up to the anchor,
       steps go by tag and, when siblings share the tag, by position (:nth-of-type). Stops as
       soon as the selector matches exactly one element. */
    const esc = s => (window.CSS && CSS.escape ? CSS.escape(s) : s.replace(/([^a-zA-Z0-9_-])/g, '\\$1'));
    const isUnique = sel => { try { return document.querySelectorAll(sel).length === 1; } catch (_) { return false; } };

    function anchorOf(el) {
      const tag = el.tagName.toLowerCase();
      const id = authorName(el);
      if (id && id.startsWith('#')) return `#${esc(el.id)}`;
      for (const a of ['data-testid', 'data-test', 'data-cy', 'data-name', 'data-component']) {
        const v = el.getAttribute(a);
        if (v) return `${tag}[${a}="${v.replace(/"/g, '\\"')}"]`;
      }
      const lb = el.getAttribute('aria-labelledby');
      if (lb) return `${tag}[aria-labelledby="${lb}"]`;
      if (/^(header|nav|main|footer|aside)$/.test(tag)) return tag;
      const al = el.getAttribute('aria-label');
      if (al) return `${tag}[aria-label="${al.replace(/"/g, '\\"')}"]`;
      return null;
    }

    function stepOf(el) {
      const tag = el.tagName.toLowerCase();
      const parent = el.parentElement;
      if (!parent) return tag;
      const same = Array.from(parent.children).filter(c => c.tagName === el.tagName);
      return same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(el) + 1})` : tag;
    }

    function shortSelector(el) {
      const own = anchorOf(el);
      if (own && isUnique(own)) return own;
      const steps = [stepOf(el)];
      let node = el.parentElement;
      for (let i = 0; node && node !== document.documentElement && i < 12; node = node.parentElement, i++) {
        const anchor = anchorOf(node);
        if (anchor && isUnique(anchor)) {
          const sel = [anchor, ...steps].join(' > ');
          if (isUnique(sel)) return sel;
        }
        steps.unshift(node === document.body ? 'body' : stepOf(node));
      }
      // No anchor: the shortest path that still matches exactly one element.
      for (let k = 1; k <= steps.length; k++) {
        const sel = steps.slice(-k).join(' > ');
        if (isUnique(sel)) return sel;
      }
      return steps.join(' > ');
    }

    /* ─── CSS rules that apply to the element ───
       Walks into @layer, @media, @supports, @container and nested rules (Tailwind 4 puts
       everything there). Skips the browser reset (Tailwind's "base" layer, "*", html, :root)
       and the internal --tw-* variables. When a value uses var() or calc(), the final value
       is shown next to it. */
    const SKIP_LAYERS = /^(base|properties|theme|reset|preflight)$/;
    const SKIP_SELECTOR = /^\s*(\*|::?[a-z-]+|html|body|:root|:host)(\s*[,{]|\s*$)/i;

    function collectRules(list, el, decls, parentSel) {
      for (const rule of list || []) {
        try {
          if (window.CSSLayerBlockRule && rule instanceof CSSLayerBlockRule) {
            if (!SKIP_LAYERS.test(rule.name || '')) collectRules(rule.cssRules, el, decls, parentSel);
            continue;
          }
          if (window.CSSMediaRule && rule instanceof CSSMediaRule) {
            if (matchMedia(rule.conditionText || rule.media.mediaText).matches) collectRules(rule.cssRules, el, decls, parentSel);
            continue;
          }
          if (window.CSSSupportsRule && rule instanceof CSSSupportsRule) {
            if (CSS.supports(rule.conditionText)) collectRules(rule.cssRules, el, decls, parentSel);
            continue;
          }
          if (window.CSSContainerRule && rule instanceof CSSContainerRule) {
            collectRules(rule.cssRules, el, decls, parentSel);
            continue;
          }
          if (!rule.selectorText) continue;
          // Nested rule: "&" becomes the outer selector.
          const sel = parentSel
            ? (rule.selectorText.includes('&') ? rule.selectorText.replace(/&/g, `:is(${parentSel})`) : `:is(${parentSel}) ${rule.selectorText}`)
            : rule.selectorText;
          if (!parentSel && SKIP_SELECTOR.test(sel)) continue;
          if (!el.matches(sel)) continue;
          for (let i = 0; i < rule.style.length; i++) {
            const prop = rule.style[i];
            if (prop.startsWith('--tw-')) continue;
            decls.set(prop, rule.style.getPropertyValue(prop).trim());
          }
          if (rule.cssRules && rule.cssRules.length) collectRules(rule.cssRules, el, decls, sel);
        } catch (_) { /* a selector or rule the browser does not understand: skip it */ }
      }
    }

    const GROUPS = [
      ['Layout', ['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
        'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
        'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
        'justify-content', 'justify-items', 'justify-self', 'align-content', 'align-items', 'align-self',
        'gap', 'row-gap', 'column-gap',
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'padding-inline', 'padding-inline-start', 'padding-inline-end',
        'padding-block', 'padding-block-start', 'padding-block-end',
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'margin-inline', 'margin-inline-start', 'margin-inline-end',
        'margin-block', 'margin-block-start', 'margin-block-end',
        'overflow', 'overflow-x', 'overflow-y', 'box-sizing', 'float', 'clear',
        'grid', 'grid-template-columns', 'grid-template-rows', 'grid-area', 'grid-column', 'grid-row']],
      ['Style', ['background', 'background-color', 'background-image', 'background-size',
        'background-position', 'background-repeat',
        'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
        'border-color', 'border-width', 'border-style',
        'border-radius', 'border-top-left-radius', 'border-top-right-radius',
        'border-bottom-left-radius', 'border-bottom-right-radius',
        'outline', 'box-shadow', 'opacity', 'visibility', 'cursor', 'pointer-events',
        'filter', 'backdrop-filter']],
      ['Typography', ['font', 'font-family', 'font-size', 'font-weight', 'font-style',
        'line-height', 'letter-spacing', 'text-align', 'text-decoration', 'text-transform',
        'text-overflow', 'color', 'white-space', 'word-break']],
      ['Transition', ['transition', 'animation', 'transform', 'transform-origin', 'will-change']],
    ];

    function getMatchedCSS(el) {
      const decls = new Map();
      for (const sheet of document.styleSheets) {
        let rules;
        try { rules = sheet.cssRules; } catch (_) { continue; } // cross-origin stylesheet
        collectRules(rules, el, decls, null);
      }
      const cs = getComputedStyle(el);
      for (const [prop, value] of decls) {
        // A shorthand with var() (e.g. "padding-inline: var(--x)") leaves its longhands
        // empty: use the computed value.
        if (!value) { decls.set(prop, cs.getPropertyValue(prop).trim() || T.noValue); continue; }
        if (prop.startsWith('--') || !/var\(|calc\(/.test(value)) continue;
        const final = cs.getPropertyValue(prop).trim();
        if (final && final !== value) decls.set(prop, `${value} /* ${final} */`);
      }
      if (!decls.size) return T.noRules;

      const placed = new Set();
      const sections = [];
      for (const [name, props] of GROUPS) {
        const lines = [];
        for (const p of props) {
          if (decls.has(p)) { lines.push(`${p}: ${decls.get(p)};`); placed.add(p); }
        }
        if (lines.length) sections.push({ name: T.groups[name], lines });
      }
      const other = [];
      for (const [p, v] of decls) { if (!placed.has(p)) other.push(`${p}: ${v};`); }
      if (other.length) sections.push({ name: T.groups.Other, lines: other });

      return sections.map((s, i) => {
        const isLast = i === sections.length - 1;
        return `${s.name}:\n${s.lines.join('\n')}${isLast ? '' : '\n-------'}`;
      }).join('\n').replace(/ \/\* ([^*]*) \*\/;$/gm, '; /* $1 */');
    }

    /* ─── Highlight, label, toast and menu ─── */
    function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function highlight(el) {
      const r = el.getBoundingClientRect();
      hl.style.top = r.top + 'px';
      hl.style.left = r.left + 'px';
      hl.style.width = r.width + 'px';
      hl.style.height = r.height + 'px';
      hl.style.opacity = '1';
      // The outline takes the element's own corners, so the radius is visible (3px when it has none).
      const elRadius = getComputedStyle(el).borderRadius;
      hl.style.borderRadius = /[1-9]/.test(elRadius) ? elRadius : '3px';
      const summary = measureSummary(el);
      tip.innerHTML = `${escapeHtml(getName(el))}<span style="margin-left:9px;font-weight:400;color:#38bdf8">${Math.round(r.width)}×${Math.round(r.height)}px</span>${summary ? `<span style="margin-left:9px;font-weight:400">${summary}</span>` : ''}`;
      drawMeasures(el);
      // The label sits above the top margin, so it never covers the numbers.
      const above = r.top - px(getComputedStyle(el).marginTop);
      const tipTop = above < 26 ? r.bottom + 4 : above - 22;
      tip.style.top = tipTop + 'px';
      tip.style.left = Math.max(4, Math.min(r.left, window.innerWidth - tip.offsetWidth - 4)) + 'px';
      tip.style.opacity = '1';
    }

    function showToast(msg) {
      toast.textContent = msg;
      toast.style.opacity = '1';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
    }

    function copy(text, msg) {
      navigator.clipboard.writeText(text).then(() => showToast(msg), () => showToast('✕ Clipboard blocked'));
    }

    function restoreHidden() {
      for (const [el, orig] of hiddenEls) {
        el.style.opacity = orig.opacity;
        el.style.pointerEvents = orig.pointerEvents;
        el.style.outline = orig.outline;
      }
      hiddenEls.clear();
    }

    function hideMenu() {
      menu.style.opacity = '0';
      menu.style.pointerEvents = 'none';
      menuVisible = false;
    }

    function menuItem(label, icon, onClick) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;background:none;border:none;border-bottom:1px solid #1a2035;color:#e2e8f0;font:500 12px/1 sans-serif;text-align:left;cursor:pointer;white-space:nowrap;box-sizing:border-box;';
      btn.innerHTML = `<span style="opacity:.5;font-size:13px">${icon}</span>${escapeHtml(label)}`;
      btn.addEventListener('mouseenter', () => { btn.style.background = '#1a2538'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = 'none'; });
      btn.addEventListener('click', e => { e.stopPropagation(); onClick(); });
      return btn;
    }

    function showMenu(x, y, el) {
      menu.innerHTML = '';

      const itemSelector = menuItem(T.copySelector, '⬡', () => { copy(shortSelector(el), T.selectorCopied); hideMenu(); });
      const itemCSS = menuItem(T.copyCSS, '✦', () => { copy(getMatchedCSS(el), T.cssCopied); hideMenu(); });
      const itemSpacing = menuItem(T.copySpacing, '▣', () => { copy(getSpacing(el), T.spacingCopied); hideMenu(); });

      const sep = document.createElement('div');
      sep.style.cssText = 'height:1px;background:#2d3748;margin:2px 0;';

      const isHidden = hiddenEls.has(el);
      const itemHide = menuItem(isHidden ? T.show : T.hide, '◻', () => {
        if (hiddenEls.has(el)) {
          const orig = hiddenEls.get(el);
          el.style.opacity = orig.opacity;
          el.style.pointerEvents = orig.pointerEvents;
          el.style.outline = orig.outline;
          hiddenEls.delete(el);
          showToast(T.restored);
        } else {
          hiddenEls.set(el, { opacity: el.style.opacity, pointerEvents: el.style.pointerEvents, outline: el.style.outline });
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.style.outline = 'none';
          showToast(T.hidden);
        }
        hideMenu();
      });
      itemHide.style.borderBottom = 'none';

      menu.append(itemSelector, itemCSS, itemSpacing, sep, itemHide);

      // Clamp to the viewport.
      menu.style.left = '0px';
      menu.style.top = '0px';
      menu.style.opacity = '1';
      menu.style.pointerEvents = 'all';
      menuVisible = true;
      const left = Math.min(x + 4, window.innerWidth - menu.offsetWidth - 8);
      const top = Math.min(y + 4, window.innerHeight - menu.offsetHeight - 8);
      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
    }

    /* ─── Events ─── */
    document.addEventListener('mousemove', e => {
      if (!active || menuVisible) return;
      const el = e.target;
      if (!(el instanceof Element) || IGNORE.has(el)) return;
      hovered = el;
      highlight(el);
    });

    document.addEventListener('mouseleave', () => {
      hovered = null;
      hl.style.opacity = '0';
      tip.style.opacity = '0';
      clearMeasures();
    });

    // Follow the element on scroll and resize.
    const follow = () => { if (active && hovered) highlight(hovered); };
    window.addEventListener('scroll', follow, { capture: true, passive: true });
    window.addEventListener('resize', follow);

    document.addEventListener('click', e => {
      if (!active) return;
      if (IGNORE.has(e.target) || menu.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      if (menuVisible) { hideMenu(); return; }
      showMenu(e.clientX, e.clientY, hovered || e.target);
    }, true);

    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyG') { e.preventDefault(); setActive(!active); return; }
      if (e.key === 'Alt' && active && hovered && !menuVisible) {
        e.preventDefault();
        const r = hovered.getBoundingClientRect();
        showMenu(r.left, r.bottom + 4, hovered);
        return;
      }
      if (e.key === 'Escape' && menuVisible) { hideMenu(); return; }

      if (active && hovered && !menuVisible) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const parent = hovered.parentElement;
          if (parent && parent !== document.body) { hovered = parent; highlight(parent); }
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const child = Array.from(hovered.children).find(c => !IGNORE.has(c));
          if (child) { hovered = child; highlight(child); }
          return;
        }
      }

      if (!(e.metaKey || e.ctrlKey) || e.key !== 'c') return;
      if (!active || !hovered) return;
      if (window.getSelection()?.toString().length > 0) return;
      e.preventDefault();
      const rawHtml = hovered.outerHTML;
      const html = rawHtml.length > 3000 ? `${rawHtml.slice(0, 3000)}\n${T.truncated}` : rawHtml;
      copy(`${getName(hovered)}\n${shortSelector(hovered)}\n\n${html}`, T.htmlCopied);
    });
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();

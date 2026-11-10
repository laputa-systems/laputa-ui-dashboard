# Theming

Laputa UI ships one light dashboard theme. A consumer can keep that theme, restyle it page-wide, or scope a different theme to one region. This document is the public theming contract, the cascade-order guidance, the structural limits, and the T1 styling audit.

## Contract

The public theme surface is the semantic `--ui-*` custom properties declared in `src/tokens.css`. Raw palette values are not a separate public tier. A theme is a rule that sets those tokens on a scope:

```css
:root {
  --ui-accent: #7a3f2b;
  --ui-font: "Inter", system-ui, sans-serif;
}

.reader-theme {
  --ui-accent: #7a3f2b;
  --ui-ok: #20432f;
  --ui-surface: #fcfbf8;
}
```

```html
<section class="ui-theme reader-theme">...</section>
```

`.ui-theme` is the only new selector. It has zero specificity, so a consumer rule on the same element wins wherever it is written. Set the base tokens on the element that carries `.ui-theme`; descendants inherit the resolved values. Tokens set on a descendant do not recalculate the derived tokens that already resolved on the theme element.

### Derived tokens

Five tokens are pure functions of other tokens. They are declared on `:root, :where(.ui-theme)`, so they recompute on a scoped theme instead of inheriting the values resolved at `:root`. Do not set them directly.

| Derived token | Input tokens |
| --- | --- |
| `--ui-accent-soft` | `--ui-accent` |
| `--ui-ok-soft` | `--ui-ok`, `--ui-surface` |
| `--ui-warn-soft` | `--ui-warn`, `--ui-surface` |
| `--ui-bad-soft` | `--ui-bad`, `--ui-surface` |
| `--ui-head-height` | `--ui-control`, `--ui-space-sm` |

Every other token is an input and is declared only on `:root`. A theme sets inputs; a themed region inherits every input it does not set, including page-wide overrides such as `--ui-accent` or `--ui-shadow-card`. Themes set the semantic status tokens `--ui-ok`, `--ui-warn` and `--ui-bad`, not the palette tokens `--ui-good`, `--ui-serious` and `--ui-critical` they default to. Likewise set `--ui-inset`, `--ui-outline`, the shadows and `--ui-side-gap` directly when a theme changes the spacing or line colors they default from.

Colors mixed inline in component rules (`color-mix()` in buttons, notices, meters and the error ring) already resolve against the element's tokens and need no derived declaration.

No token was added and no default value changed. The `.ui-theme` hook is the only new public selector.

## Cascade order

The base and family sheets stay unlayered so existing consumers keep their current cascade. A consumer that wants its own styles to win can import the library into the `ui` layer and declare its layers in order:

```css
@layer ui, app;
@import url("@laputa-systems/ui-dashboard/styles.css") layer(ui);
@import url("@laputa-systems/ui-dashboard/styles/forms.css") layer(ui);

@layer app {
  .ui-btn { background-color: #7a3f2b; }
}
```

An `app`-layer rule beats every `ui`-layer rule regardless of specificity, so a consumer does not need `!important` or selector escalation. Keep both imports adjacent at the top of the consumer sheet; `@layer` statements may precede `@import`.

Without layers, load the library first and the theme rule after it. A theme rule in the app layer or in a later unlayered sheet beats the library's zero-specificity `.ui-theme` defaults.

## Two themes on the same controls

`fixture/themes.html` and `fixture/themes.tsx` render one set of Solid controls twice: once under the default dashboard theme and once inside a `.ui-theme` region carrying a fixture editorial theme modeled on Discover. The controls cover Button appearances (default, primary, danger, ghost, small, busy and disabled), IconButton, every Badge tone, Notice, TextField, Checkbox, RadioGroup, NativeSelect, Tabs, Disclosure, Pagination, a DataTable and a Modal. The editorial rule sets input tokens only: Discover's paper, panel, ink, muted, rule, well and link colors, a sans body at 14px, a larger type scale, square radii, quieter shadows and a looser spacing scale. Consumer fixture CSS supplies `Georgia` for headings; no component rule is overridden.

`fixture/themes-static.html` carries the CSS-only subset with the same two regions for the no-JavaScript check. `tests/browser/themes.spec.ts` proves that both regions expose the same accessible tree and Tab order, that arrow keys move within Tabs and RadioGroup in each theme, and that Escape closes each dialog and returns focus to its opener. Focused controls keep a visible outline under normal and forced-colors media. The same controls stay inside a 640px viewport at `deviceScaleFactor` 2 without horizontal page overflow. The editorial region's computed tokens differ from the default region, which still equals the plain `:root` values, so the theme is scoped rather than leaked. The spec also asserts that `.ui-icon-btn` resolves `font-family` from `--ui-font` like `.ui-btn`, so a consumer does not need to re-add `font: inherit`.

Screenshots at 1440px and 390px are written to `.work/tmp/t3-shots/` and are not committed. They show the limit of tokens: palette, type scale, radii and density change, but the two regions still read as one product. Distinct character comes from the consumer's own composition and type, as on the Discover reader, not from library tokens. Links inside library tables keep the browser's link color because no library rule styles plain links.

## Review surface

`fixture/review-static.html` renders Discover's admin maker review as a CSS-only page inside one `.ui-theme` region. It carries the desk surface: a page header with two navigation links, a success flash and an error, pending counts, three queue rows each with its review form, and the public-maker-names setting. Every user-facing control and message uses a library static class. The editorial rule sets the same input tokens as `fixture/themes.html`; headings take Georgia from fixture CSS because the reading face stays consumer-owned and no library rule sets it.

The fixture proves the review flow needs no JavaScript. Native `POST` forms keep `method`, `action`, server-provided hidden values, and `name`/`value` pairs. The score number field and note textarea keep visible labels, hints, and an error linked through `aria-describedby`. Approve and Reject are separate submit buttons with the same `name` and different values. Keyboard order inside a row is score, note, Approve, Reject, and each stop has a visible focus outline. Flash is `role=status`, the error is `role=alert`, and the page has no horizontal overflow at 390px or at 640px with `deviceScaleFactor` 2. `tests/browser/review.spec.ts` is the check; screenshots at 1440px and 390px go to `.work/tmp/t5-shots/`.

The fixture replaces Discover's admin classes where an equivalent exists. The rest stay page composition.

| Discover admin element (`cloudflare/src/site/admin.ts`) | Library equivalent used | Gap |
| --- | --- | --- |
| `.admin-header`, `.admin-nav` | `ui-page-header` with ordinary links | No admin header or navigation component; the page composes them. |
| `.admin-flash` | `ui-notice ui-notice-ok` plus `role=status` | None. |
| `.admin-error` | `ui-notice ui-notice-bad` plus `role=alert` | None. |
| `.admin-counts` | `ui-badge` list | No count or statistic primitive; the badge carries the text. |
| `.admin-queue`, `.admin-row` | Semantic `<ol>`/`<li>` with fixture layout | No static collection or card component. |
| `.admin-summary` | `ui-badge` for kind, meta text for label and fit | No record-summary primitive; art direction stays with the consumer. |
| `.admin-review` | Native `<form method="post">` with fixture layout | No form container component; native form semantics are retained. |
| Hidden `csrf`, `subject_id`, `expected_data_epoch`, `idempotency_key` | Native hidden inputs | No library equivalent and none needed; hidden controls are not in the accessibility tree. |
| Score field | `ui-field`, `ui-field-label`, `ui-field-hint`, `ui-field-error`, `ui-text-field` with `type="number"` | No number-specific control; native `min`, `max`, `step`, and `inputmode` carry the constraints. |
| Note field | `ui-field`, `ui-text-field ui-textarea`, native `maxlength` | `TextArea`'s `showCount` needs JavaScript, so a static character count has no equivalent. |
| `.admin-actions`, `.admin-reject` | `ui-btn ui-button-primary` and `ui-btn ui-button-danger` | None. |
| `.admin-setting` | `ui-settings-row-container`, `ui-settings-row`, `ui-settings-row-heading`, `ui-settings-row-description`, `ui-settings-row-content` | No gap for the labelled group; the wrapping form is page composition. |
| Naming radios | `ui-radio-group`, `ui-radio-options`, `ui-radio-option` with native `fieldset` and `legend` | None. |
| Naming save button | `ui-btn ui-button-primary` | None. |
| `.admin-empty` | Not rendered; a plain paragraph or `ui-notice` | `EmptyState` is a Solid component with no documented static markup. |
| `.admin-kicker`, `.admin-fit` | Fixture `.review-kicker` and `.review-fit` text | No library class; type and metadata composition stay with the consumer. |

Discover adoption remains pending H3 on its `main`. This fixture does not edit Discover; the table is the proposed mapping, not a landed change.

## Structural invariants

Themes may change colors, type family and scale, radii, shadows, control and row density, spacing scale, side-navigation width and panel chrome. These remain structural and a theme must not change them:

- **Hit areas:** `--ui-control`, `--ui-control-sm`, `--ui-row-height`, `--ui-side-link-height`, the 44px switch row, and the 24px split separator.
- **Focus ring:** every interactive element keeps a visible `:focus-visible` outline (2px in `--ui-accent`, with its offset). A theme must keep accent contrast against the surrounding fill.
- **Overlay stacking:** `--ui-z-veil` (40) sits below `--ui-z-modal` (50); dialogs, popovers and menus use the browser top layer; `--ui-scrim` dims what is behind them.
- **Scroll ownership:** the table scroll wrapper, split panes, modal body, command menu, popover, tooltip content, side navigation, workbench drawer and artifact preview own their overflow.
- **Reduced motion and forced colors:** the `prefers-reduced-motion` paths for progress and skeletons, and the `forced-colors` paths for the switch and split separator, stay in place.
- **Container-query breakpoints:** 34rem, 600px, 720px, 900px and 480px are literal because custom properties cannot appear in query conditions. Media breakpoints use the build-time `@custom-media` values in `src/css/media.css`.
- **No global element styles:** the library selects `ui-*` classes, `:root` tokens and the `.ui-theme` hook. `.ui-data-table .numeric` is the one consumer class it styles, and only inside a `ui-*` selector.

## Audit (T1)

### `src/tokens.css`

| Group | Tokens | Literal values | Class | Consumer need |
| --- | --- | --- | --- | --- |
| Neutral colors | `--ui-bg`, `--ui-surface`, `--ui-text`, `--ui-text-2`, `--ui-muted`, `--ui-line`, `--ui-line-strong`, `--ui-hover` | `#fafaf9`, `#ffffff`, `#1c1c1a`, `#5d5d58`, `#706f6a`, `#ecebe7`, `#e0dfda`, `#f5f4f1` | design | Discover maps paper/panel/ink/muted/rule/well onto these. |
| Status colors | `--ui-good`, `--ui-serious`, `--ui-critical`, `--ui-ok`, `--ui-warn`, `--ui-bad` | `#0ca30c`, `#ec835a`, `#d03b3b`; aliases | design | Discover maps entity ink separately; no library change. |
| Soft fills | `--ui-accent-soft`, `--ui-ok-soft`, `--ui-warn-soft`, `--ui-bad-soft` | `color-mix` 15% / 12% | design, derived | Recompute under a scoped theme. |
| Scrim | `--ui-scrim`, `--ui-scrim-filter` | `rgb(20 20 18 / 28%)`, `blur(2px)` | design; stacking is structural | No. |
| Visualization | `--ui-viz-blue`, `--ui-viz-ghost`, `--ui-s0`–`--ui-s4` | `#2a78d6`, `#9a9992`, `#2a78d6`, `#1baf7a`, `#6250d6`, `#e87ba4`, `#eb6834` | design | No. |
| Type families | `--ui-font`, `--ui-mono` | Inter stack, mono stack | design | Discover's serif reading family has no library rule that would use it; it stays a Discover variable until a library primitive sets reading type. |
| Type scale | `--ui-fs-label`, `--ui-fs-meta`, `--ui-fs-body`, `--ui-fs-title`, `--ui-fs-page` | `11px`, `12px`, `13px`, `14px`, `22px` | design | Discover editorial scale can override these. |
| Weight and tracking | `--ui-weight-medium`, `--ui-weight-semibold`, `--ui-tracking-*`, `--ui-caps-tracking` | `500`, `600`, `-.01em`, `-.02em`, `.06em` | design | No. |
| Spacing | `--ui-space-*`, `--ui-inset` | `2px`–`64px`; inset defaults to `--ui-space-lg` | design | Discover's gutter maps nearest to `--ui-inset`; the responsive gutter itself has no equivalent. |
| Control sizes | `--ui-control-sm`, `--ui-control`, `--ui-head-height`, `--ui-row-height`, `--ui-icon-size`, `--ui-dot`, `--ui-dot-sm` | `20px`, `24px`, `40px`, `44px`, `16px`, `8px`, `6px` | structural for hit areas; icon/dot design | Discover row density can use `--ui-row-height`; no new token. |
| Radius | `--ui-radius-sm` … `--ui-radius-pill` | `4px`–`16px`, `99px` | design | Themes may override. |
| Outline and shadows | `--ui-outline`, `--ui-shadow-card`, `--ui-shadow-pop`, `--ui-shadow-modal` | inset ring; layered shadows | design inputs with defaults from line colors | A theme that changes line colors sets them too. |
| Side navigation | `--ui-side-width`, `--ui-side-gap`, `--ui-side-link-height` | `236px`, `12px`, `34px` | design width; structural hit area | Themes may change width, not the link height. |
| Stacking | `--ui-z-veil`, `--ui-z-modal` | `40`, `50` | structural | No. |
| Color scheme | `color-scheme: light` | `light` | structural | No dark scheme exists. |

### Hard-coded literals in `src/css`

| File:line | Literal | Decision | Class | Token it would become | Consumer need |
| --- | --- | --- | --- | --- | --- |
| `shell.css:15` | `28px`, `clamp(20px, 4vw, 56px)`, `64px` | main padding | design | `--ui-main-pad-start`, `--ui-main-pad-inline`, `--ui-main-pad-end` | Discover page gutter; future token. |
| `shell.css:23` | `30px` | compact side-link height | structural hit area | compact value of `--ui-side-link-height` | No. |
| `shell.css:1,15` | `100vh`, `calc(100vh - 2 * var(--ui-space-sm))` | page frame height | structural layout | none | No. |
| `table.css:3-4` | `nowrap`, `--ui-row-height`, `--ui-inset` | table density | structural readability | existing `--ui-row-height`, `--ui-inset` | Discover reading tables can change row height. |
| `table.css:11` | `260px` | search width | design | `--ui-search-width` | No. |
| `meter.css:1` | `44px × 6px` | meter size | design | `--ui-meter-width`, `--ui-meter-height` | No. |
| `skeleton.css:4,5-7` | `140px`, `2.4s`, `opacity: .4` | skeleton shape and pulse | design / motion | `--ui-skeleton-height`, `--ui-skeleton-duration` | No. |
| `layout.css:134,136,141` | `15rem`, `48rem`, `18rem` | page-frame sidebar, reading measure, dashboard card minimum | design | `--ui-page-frame-sidebar`, `--ui-reading-width`, `--ui-dashboard-min` | Discover reading measure; future token. |
| `layout.css:60-63,66` | `3.5rem`, `15rem`, `20rem`, `22rem` | workbench columns and drawer | design / structural mechanics | `--ui-workbench-rail`, `--ui-workbench-secondary`, `--ui-workbench-workspace`, `--ui-workbench-drawer` | No. |
| `layout.css:89-90` | `24px` | split separator target | structural hit area | `--ui-split-separator` | No. |
| `layout.css:78,122,132,137,146` | `900px`, `600px`, `480px`, `720px` | container-query breakpoints | structural | none; custom properties cannot appear in queries | No. |
| `forms.css:45,66` / `recipes.css:14` | `34rem`, `12rem`, `24rem`, `20rem` | dialog and popup widths, container breakpoint | design; breakpoint structural | `--ui-dialog-width`, `--ui-select-*` | No. |
| `forms.css:72,76-79` | `44px`, `2.25rem`, `1.25rem`, `1rem`, `2px`, `-6px` | switch geometry | structural hit area; shape design | `--ui-switch-width`, `--ui-switch-height` | No. |
| `modal.css:1-2,8,12` | `1120px`, `440px`, `94vw`, `88vh`, `18px`, `100dvh` | modal width and close glyph | design | `--ui-modal-width`, `--ui-modal-compact-width`, `--ui-modal-glyph` | No. |
| `panel.css:9` | `56px 6vw 40px` | expanded panel inset | design geometry | `--ui-panel-expanded-inset` | No. |
| `layout.css:17` | `36rem`, `70vh`, `40rem` | command menu width and height | design | `--ui-command-menu-width` | No. |
| `recipes.css:1` | `48rem` | integration dialog width | design | `--ui-integration-dialog-width` | No. |
| `forms.css:31` | `rgb(0 0 0 / .35)` | date dialog backdrop | design | `--ui-scrim-strong` | No. |
| `button.css:13-17` | `color-mix(…, black)` 85% / 72% | primary and danger fills | design, recomputes from accent/bad | `--ui-accent-strong`, `--ui-bad-strong` if a consumer needs it | No; recomputes per scope. |
| `error-state.css:1`, `meter.css:2`, `notice.css:1-4` | `35%`, `26%`, `55%`, `6%`, `10%` | tinted fills | design, recomputes | none | No. |
| All focus rules | `2px` outline, offsets `1px`, `2px`, `-2px` | focus ring presence | structural | none | Never removed. |
| `layout.css:93-94` | `1px` gradient hairline | split divider | structural | none | No. |
| `tooltip` rules | `22rem`, `6px`, `16px`, `32px` | tooltip size and caret | design | none | No. |
| `sr-only.css:1` | `1px`, `-1px`, `50%` | visually hidden text | structural accessibility | none | No. |
| `media.css:1-6` | `375px`, `600px`, `640px`, `720px`, `1000px`, `hover` | media breakpoints | structural | none; build-time only | No. |
| `layout.css:97`, `forms.css:81` | `forced-colors: active` | forced-colors paths | structural | none | No. |
| `feedback.css:4`, `skeleton.css:9` | `prefers-reduced-motion: reduce` | reduced motion | structural | none | No. |
| `layout.css:60,89` | `--_ui-workbench-narrow`, `--_ui-split-primary` | private component state | neither | keep private | No. |
| `meter.css:1-2` | `--ui-tone` fallback | tone selector | component-internal | keep private | No. |
| `badge.css:2`, `forms.css:77`, `meter.css:1` | `50%`, `1rem`, pill radius | dot and thumb shape | design | existing radius tokens | No. |

### Selectors outside a single `ui-*` class

| Selector | File:line | Scope | Class |
| --- | --- | --- | --- |
| `.ui-data-table .numeric` | `table.css:7` | descendant of `ui-*` | consumer class, the one exception |
| `caption`, `li`, `label`, `select`, `button`, `input`, `a`, `svg`, `p`, `h1`, `h2`, `h3`, `dl`, `dt`, `dd`, `th`, `td`, `tr`, `summary`, `img`, `pre` | throughout `src/css` | always a descendant of a `ui-*` class | scoped element selector |
| `::backdrop` | `modal.css:4`, `layout.css:18,67`, `recipes.css:2`, `forms.css:31` | `ui-*` dialog/panel | scoped pseudo-element |
| `::before`, `::after`, `::placeholder` | `forms.css:77,79`, `layout.css:55-57`, `table.css:14` | `ui-*` | scoped pseudo-element |
| `::-webkit-progress-bar`, `::-webkit-progress-value` | `feedback.css:6-7` | `ui-*` | scoped vendor pseudo-element |
| `[aria-*]`, `[data-*]`, `[hidden]`, `[open]`, `[href]` | throughout | `ui-*` | scoped state selector |
| `:is()`, `:not()`, `:has()`, `:focus-visible`, `:hover`, `:disabled`, `:checked` | throughout | `ui-*` | scoped state or function selector |
| `@keyframes ui-pulse` | `skeleton.css:5` | global animation name | not a selector |
| `@media`, `@container` | `media.css`, `src/css` | global conditions | not selectors |
| `:root` | `tokens.css:1` | token scope | public, documented |

There are no unscoped global element selectors.

### Discover token mapping

Read-only inventory of `~/d/discover/site/site.css` (`:root` inside `@layer site`).

| Discover token | Value | Nearest `--ui-*` | Gap |
| --- | --- | --- | --- |
| `--paper` | `#f8f7f3` | `--ui-bg` (`#fafaf9`) | close; map with a theme override. |
| `--panel` | `#fcfbf8` | `--ui-surface` (`#ffffff`) | map with a theme override. |
| `--ink` | `#1f1d19` | `--ui-text` (`#1c1c1a`) | map with a theme override. |
| `--muted` | `#6f6b62` | `--ui-muted` (`#706f6a`) | close. |
| `--rule` | `#ddd8cd` | `--ui-line-strong` (`#e0dfda`) | nearest hairline; `--ui-line` is lighter. |
| `--well` | `#ece9e1` | `--ui-hover` (`#f5f4f1`) | nearest; there is no dedicated well token. |
| `--link` | `#2c4d6e` | `--ui-accent` | Discover's link color is the accent its library controls use. |
| `--gutter` | `clamp(12px, 2.5vw, 32px)` | `--ui-inset` / `--ui-space-*` | no responsive gutter token. |
| `--serif` | `Georgia, "Times New Roman", serif` | no equivalent | stays a Discover variable; no library rule sets reading type. |
| `.entity-artist --entity` | `#20432f` | no equivalent | entity marks stay in Discover. |
| `.entity-source --entity` | `#334a6e` | no equivalent | entity marks stay in Discover. |
| `.entity-exhibition`/`-publication --entity` | `#7a3f2b` | no equivalent | entity marks stay in Discover. |
| `.entity-media`/`-technique`/`-form --entity` | `#5a4720`, fills `#efe8d6`, `#e5dcc6` | no equivalent | entity marks stay in Discover. |
| `.entity-place --entity` | `#4a5a38` | no equivalent | entity marks stay in Discover. |

### Responsibility matrix

| Area | Stats | Discover | Niceforge |
| --- | --- | --- | --- |
| Theme scope | page `:root` | page `:root` or `.ui-theme` regions | default `:root` |
| Type | dashboard sans scale | serif reading family in consumer CSS | dashboard sans |
| Color | default dashboard palette | editorial palette mapped to `--ui-bg`, `--ui-surface`, `--ui-text`, `--ui-muted`, `--ui-line-strong`, `--ui-hover`, `--ui-accent` | default |
| Density | existing control and row tokens | reading measure and row density overrides | default |
| Components | Solid components | CSS-only classes and markup | CSS-only CSS |

Discover's entity-link colors, art direction and page composition remain consumer-owned. This slice adds the contract, not a Discover theme sheet.

## Top design choices a consumer needs tokenized

1. Serif reading family and a separate link color. Neither is added: no library rule would read them yet. Add them with the first library primitive that sets reading type or link color.
2. Reading measure (`48rem`) and page gutter (`clamp(12px, 2.5vw, 32px)` in Discover) have no tokens yet; Discover keeps its own or overrides the layout tokens it already has.
3. Scoped themes need derived tokens to recompute; fixed for the five computed tokens without changing any default value.
4. Row density is already expressible through `--ui-row-height`; table cells also take `--ui-inset`.

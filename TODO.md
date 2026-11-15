Prefix: LUD
Next: 3
### LUD-1 · P2 · Data table rows grow to 61px when table.css and data.css are both loaded

- **Area:** css
- **Where:** src/css/table.css:4 and src/css/data.css:5
- **Problem:** table.css gives .ui-data-table td a 44px height with zero block padding while data.css gives the same cells 8px padding on every side; a consumer loading styles.css and data.css (as stuff's dependency dashboard does) gets 61px rows, 16px left padding on the first cell, and conflicting vertical-align, so a 26-row lookup table spans 1600px
- **Recommendation:** Give .ui-data-table one owner for cell height, padding and alignment (fold the data.css rules into table.css or scope one of them), and add a fixture test that measures a td box with both stylesheets loaded
- **Fix with:** worker
- **Effort:** S


### LUD-2 · P2 · Panel titles overlap the panel meta between 376 and 720px

- **Area:** css
- **Where:** src/css/panel.css:3-4 and :20
- **Problem:** .ui-panel-title h2 is white-space: nowrap; flex: none inside a min-width: 0 title, and the wrap override only applies at max-width 375px, so from 376 to 720px a long title paints over .ui-panel-meta (seen at 390px in stuff's dependency dashboard: 'What the fleet is written in' over 'code lines, docs and data excluded')
- **Recommendation:** Let the head wrap at the same breakpoint as the shell (720px) with the title taking the full row and the h2 allowed to wrap, and add a 390px fixture check that title and meta boxes do not intersect
- **Fix with:** worker
- **Effort:** S


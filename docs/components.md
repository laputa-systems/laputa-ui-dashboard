# Component reference

Import components and types from `@laputa-systems/ui-dashboard`. Import `styles.css` separately.
`Shell` and `SideNav` do not accept `class`; every other component does. Children and other element-valued props accept Solid JSX.

| Export | Contract |
| --- | --- |
| `Badge`, `BadgeProps`, `Tone` | `tone` is `ok`, `warn`, `bad`, `neutral`, `info`, or `accent`. `dot` adds a decorative dot. |
| `Button`, `ButtonProps` | Native button attributes and events are forwarded. `variant` is `default`, `small`, or `icon`. `type` defaults to `button`; `ariaLabel` supplies an accessible label. |
| `IconButton`, `IconButtonProps` | Native button attributes and events are forwarded. `ariaLabel` and `children` are required. `type` defaults to `button`. |
| `Icon`, `IconProps`, `IconName` | `name` selects a built-in icon, `size` defaults to 16 pixels. Icons are decorative unless `label` names them. |
| `Panel`, `PanelProps` | `title` and `children` are required. `meta`, `id`, `bodyClass`, and `flush` control the header and body. |
| `CollapsiblePanel`, `CollapsiblePanelProps` | `expandable` and `collapsible` enable controls. `expanded` and `collapsed` make each state controlled. Without a value, the component owns that state and initializes it from `defaultExpanded` or `defaultCollapsed` (both default to false). Default values are read once at mount. The corresponding `onToggleExpanded` or `onToggleCollapsed` fires once for each user request, whether controlled or local. A parent value change does not fire it. A controlled state without a callback disables its control. `label` names controls when `title` is JSX. `slotClass` styles the expansion placeholder. |
| `Modal`, `ModalProps` | Render conditionally. `title`, accessible `label`, and `onClose` are required. `size="compact"`, `onBack`, and `backLabel` are optional. Native dialog close and Escape call `onClose`. |
| `Segmented`, `SegmentedProps` | A named button group with `label`, `value`, `options` as value-label tuples, and `onChange`. `pending` styles the group. |
| `EmptyState`, `EmptyStateProps` | Requires `title`. Optional `detail`, `icon`, and `action`; `icon={null}` removes the icon. |
| `ErrorState`, `ErrorStateProps` | An alert with optional `title`, `detail`, `icon`, `retry`, `retryLabel`, and `compact`. |
| `Notice`, `NoticeProps` | A message with optional `tone` (`info`, `warn`, `bad`, `ok`) and `icon`. |
| `Skeleton`, `SkeletonProps` | Decorative loading placeholder. `rows` defaults to 3 and `chart` adds a chart placeholder. |
| `Pagination`, `PaginationProps` | `page`, `pages`, `from`, `to`, `total`, and `onChange` describe pagination. Pages are one-based. |
| `Meter`, `MeterProps` | Decorative bar for `value`, `warn`, `bad`, and optional `max` (default 100). Supply a text equivalent separately. |
| `PageHeader`, `PageHeaderProps` | Requires a string `title`. Optional `mark`, `titleExtra`, and children render alongside it. |
| `Shell`, `ShellProps`, `ShellBrand`, `NavGroup`, `NavItem` | Requires `brand`, `nav`, and children. `foot` and `mainId` are optional. Groups can have visible headings and links can mark the current page. |
| `SideNav`, `groupId` | `SideNav` renders a `group` and its zero-based `index`; use distinct indexes on the page. `groupId(index)` returns the heading ID. |

Refer to the exported declarations for exact prop types.

## Examples

These examples assume the named exports are imported. `setOpen`, `setRange`, and `setPage`
are Solid signal setters. Render the modal only while `open()` is true and close it with
`setOpen(false)`. `retry` is an application callback.

```tsx
<Badge tone="ok" dot>Healthy</Badge>
<Button type="submit" name="action" value="save">Save</Button>
<IconButton ariaLabel="Refresh" onClick={retry}><Icon name="refresh" /></IconButton>
<Icon name="check" label="Complete" />
<Panel title="Activity">Recent activity</Panel>
<CollapsiblePanel title="Logs" collapsible defaultCollapsed>Log entries</CollapsiblePanel>
<Show when={open()}><Modal title="Details" label="Details" onClose={() => setOpen(false)}>Details</Modal></Show>
<Segmented label="Range" value={range()} options={[["day", "Day"], ["week", "Week"]]} onChange={setRange} />
<EmptyState title="No results" detail="Try another query" />
<ErrorState detail="Request failed" retry={retry} />
<Notice tone="warn">Check the configuration</Notice>
<><span role="status">Loading</span><Skeleton rows={2} /></>
<Pagination page={page()} pages={3} from={1} to={10} total={30} onChange={setPage} />
<><span>CPU: 82%</span><Meter value={82} warn={70} bad={90} /></>
<PageHeader title="Overview" />
<Shell brand={{ href: "/", name: "Forge" }} nav={[{ label: "Main", items: [{ href: "/", label: "Home", current: true }] }]}><p>Home</p></Shell>
<SideNav index={0} group={{ label: "Main", items: [{ href: "/", label: "Home" }] }} />
```

`groupId(0)` returns `"ui-side-group-0"`. Use a unique index for each `SideNav` with a
visible heading. See [usage patterns](patterns.md) for complete interactive and CSS-only examples.

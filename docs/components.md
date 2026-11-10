# Component reference

Import components and types from `@laputa-systems/ui-dashboard`. Import `styles.css` separately.
`Shell` and `SideNav` do not accept `class`; every other component does. Children and other element-valued props accept Solid JSX.

| Export | Contract |
| --- | --- |
| `Badge`, `BadgeProps`, `Tone` | `tone` is `ok`, `warn`, `bad`, `neutral`, `info`, or `accent`. `dot` adds a decorative dot. |
| `Button`, `ButtonProps` | Native button attributes and events are forwarded. `variant` is `default`, `small`, or `icon`. `type` defaults to `button`; `ariaLabel` supplies an accessible label. `appearance` is `default`, `primary`, `danger`, or `ghost`, independent of `variant`. `leadingIcon` and `trailingIcon` are decorative slots hidden from assistive technology. `busy` sets `aria-busy` and disables activation while retaining the label. |
| `IconButton`, `IconButtonProps` | Native button attributes and events are forwarded. `ariaLabel` and `children` are required. `type` defaults to `button`. `appearance` accepts the same values as `Button`. `busy` sets `aria-busy` and disables activation. |
| `Icon`, `IconProps`, `IconName` | `name` selects a built-in icon, `size` defaults to 16 pixels. Icons are decorative unless `label` names them. |
| `Panel`, `PanelProps` | `title` and `children` are required. `meta`, `id`, `bodyClass`, and `flush` control the header and body. |
| `CollapsiblePanel`, `CollapsiblePanelProps` | `expandable` and `collapsible` enable controls. `expanded` and `collapsed` make each state controlled. Without a value, the component owns that state and initializes it from `defaultExpanded` or `defaultCollapsed` (both default to false). Default values are read once at mount. The corresponding `onToggleExpanded` or `onToggleCollapsed` fires once for each user request, whether controlled or local. A parent value change does not fire it. A controlled state without a callback disables its control. `label` names controls when `title` is JSX. `slotClass` styles the expansion placeholder. |
| `Modal`, `ModalProps` | Render conditionally. `title`, accessible `label`, and `onClose` are required. `size="compact"`, `onBack`, and `backLabel` are optional. Native dialog close and Escape call `onClose`. `returnFocus` optionally names the connected opener to focus after the close callback; use it when pointer activation does not focus the opener. |
| `Segmented`, `SegmentedProps` | A named button group with `label`, `value`, `options` as value-label tuples, and `onChange`. `pending` styles the group. |
| `EmptyState`, `EmptyStateProps` | Requires `title`. Optional `detail`, `icon`, and `action`; `icon={null}` removes the icon. |
| `ErrorState`, `ErrorStateProps` | An alert with optional `title`, `detail`, `icon`, `retry`, `retryLabel`, and `compact`. |
| `Notice`, `NoticeProps` | A message with optional `tone` (`info`, `warn`, `bad`, `ok`) and `icon`. |
| `Skeleton`, `SkeletonProps` | Decorative loading placeholder, hidden from assistive technology. `rows` defaults to 3 and `chart` adds a chart placeholder. Animation stops when reduced motion is requested. |
| `Pagination`, `PaginationProps` | `page`, `pages`, `from`, `to`, `total`, and `onChange` describe pagination. Pages are one-based. |
| `Meter`, `MeterProps` | Decorative bar for `value`, `warn`, `bad`, and optional `max` (default 100). Supply a text equivalent separately. |
| `PageHeader`, `PageHeaderProps` | Requires a string `title`. Optional `mark`, `titleExtra`, and children render alongside it. |
| `Shell`, `ShellProps`, `ShellBrand`, `NavGroup`, `NavItem` | Requires `brand`, `nav`, and children. `foot` and `mainId` are optional. Groups can have visible headings and links can mark the current page. |
| `SideNav`, `groupId` | `SideNav` renders a `group` and its zero-based `index`; use distinct indexes on the page. `groupId(index)` returns the heading ID. |

Import `TextField` and `TextFieldProps` from `@laputa-systems/ui-dashboard/forms`, and
load `@laputa-systems/ui-dashboard/styles/forms.css` after the base stylesheet. `TextField`
requires a unique `id` and a visible `label`. It forwards native input attributes and events.
`hint` and `error` add associated descriptions; an error also sets `aria-invalid`. Existing
`aria-describedby` values are retained. Generated description IDs reserve the `ui-field-description-` prefix; do not use that prefix for application IDs. For multiple independently rendered Solid roots on one page, supply a distinct `renderId` to each server render and its corresponding hydration call. Use `defaultValue` for an uncontrolled input that
resets with its form; use `value` and `onInput` for parent-controlled state. The control
classes can also be used directly in static HTML as shown in the README.

`Checkbox` and `CheckboxProps` from `forms` require `id` and `label`. Native name, value,
required, disabled, form, and input attributes are forwarded. `hint` and `error` are associated
with the input; `card` adds a padded label. `defaultChecked` initializes an uncontrolled
checkbox once, and native form reset restores that initial value. `checked` with
`onCheckedChange` is parent-controlled: each user request calls the handler once, and parent
updates do not call it. Reset retains the current parent value unless the parent changes it. A
controlled checkbox without a handler is disabled. `indeterminate` represents mixed selection;
it sets the native property after hydration and exposes the mixed state in server markup.
`class` applies to the label. Static HTML can use `ui-choice`, `ui-choice-card`, `ui-checkbox`,
`ui-choice-content`, and the field classes with a native checkbox and label.

`DateRangePicker`, `DateRangePickerProps`, `DateRange`, `DateRangeRequestState`, and
`dateRangeComparison` are exported from `forms`.
Supply a `label`, a controlled `value`, and `onChange`. A range has inclusive `start` and `end`
dates in `YYYY-MM-DD` form. Dates are Gregorian calendar dates from `0001-01-01` through
`9999-12-31`, not instants. No timezone conversion occurs. Optional `min` and `max` use the same
format and are inclusive. Invalid bounds or values throw `RangeError`. Opening the dialog copies
the current value into a draft. Apply requests one change; Cancel or Escape discards the draft.
Parent updates do not call `onChange` or replace an open draft. The dialog closes when the parent
supplies the requested value. A rejected or delayed request leaves the draft open. Editing the
draft supersedes the outstanding request, so its later acknowledgment does not close the dialog.
The host correlates requests and rejects stale results before updating the value. Supply
`requestState` as `idle`, `pending`, or `failed` with a message to present the host's operation
state. Pending disables Apply. A failure leaves the draft available for retry. The dialog requires
JavaScript. For a static form, use labelled native date inputs
with matching `min` and `max` and validate their order on submission. Generated IDs reserve the
`ui-date-range-` prefix.

Supply `today` as a date in the same format to offer Today, Last 7 days, and Last 30 days.
Each preset includes `today` and edits the draft without applying it. A preset outside the bounds
or supported date range is disabled. The host supplies `today`, so the component does not read a
clock or infer a timezone.

The calendar uses `locale` for month, weekday, and date labels, defaulting to `en-US`.
`weekStartsOn` sets the first weekday from 0 for Sunday to 6 for Saturday and defaults to 0.
Select a start and end date in the calendar. Selecting an earlier end reverses the endpoints.
Arrow keys move by day or week, Home and End move within the week, and Page Up and Page Down
move by month. Hold Shift with Page Up or Page Down to move by year. Month movement clamps the
day to the destination month. Calendar dates outside the bounds are disabled. Two months appear
when the dialog has room; a narrow dialog shows one.

Set `allowComparison` to offer previous-period and previous-year comparisons. The selected mode
travels in `DateRange.comparison` with the primary range in the same Apply request. The previous
period has the same inclusive day count and ends the day before the primary range. Previous year
shifts each endpoint back one calendar year, clamping February 29 to February 28. Comparison dates
may fall outside `min` and `max`, which constrain the primary range. Comparisons that would fall
before `0001-01-01` cannot be applied. `dateRangeComparison(range)` returns the derived inclusive
range, or `null` when no comparison is selected. Invalid or unrepresentable input throws
`RangeError`.

`Dropzone`, `DropzoneProps`, and `DropzoneFile` are exported from `forms`. Supply a `label`,
the host-owned `files` with nonempty unique IDs, `maxFiles` from 1 to 100, and a nonnegative
integer `maxFileBytes`. Optional `accept` entries are file extensions, MIME types, or MIME
wildcards. The picker and drop target request accepted `File` objects through `onFiles` once per
selection. A batch may contain both accepted and rejected files. The component displays each
rejection and refuses batches over 100 files. If the callback is absent or the queue is full,
selection is unavailable. A callback is a request, not proof that a file was queued or uploaded.
The host validates file contents and manages upload, authorization, and reconciliation. File names
are rendered as text and truncated to 255 characters for display. The component does not read file
contents or create object URLs. The native picker works with keyboard and touch. For a static form,
use `ui-field ui-file-field` on a label containing a native file input, and validate submitted files
on the server.

Each `DropzoneFile` may include a `DropzoneUploadState`: `queued`, `uploading`, `cancelling`,
`cancelled`, `failed`, or `complete`. An omitted state means queued. Uploading may carry finite
`progress` with `value` from zero through a positive `max`; omit it for unknown progress. Failed
state requires a message, displayed up to 500 characters. `onCancel`, `onRetry`, and `onRemove`
receive the stable file ID. Missing callbacks disable their actions. The host updates the file
state after each request. Retry and cancel focus the file row before calling the host; Remove
focuses the queue. Background updates do not move focus. The component never starts an upload.

`Combobox`, `ComboboxProps`, `ComboboxOption`, `ComboboxGroup`, and `ComboboxEntry` are exported
from `forms`. Supply `id`, `label`, `options`, a selected `value` ID or `null`, and `onChange`.
Options can be individual items or labelled groups. Option IDs must be unique across the whole
control, group IDs must be unique, and at most 500 options are accepted. Invalid collections
throw. Search text is local; a user choice or Clear requests one change and parent updates never
notify the callback. A selected ID missing from the current options remains selected and is
shown as unavailable. An optional `name` submits the selected ID in a hidden input; a null
selection and a disabled control submit nothing. Hidden inputs do not provide native required
validation. Reset discards a search draft and retains the current parent value. The control
requires JavaScript and the browser Popover API. Use a native `<select>` for a no-JavaScript or
native-validation path. Generated IDs reserve the `ui-combobox-` prefix.

`MultiCombobox` and `MultiComboboxProps` use the same option model and a controlled array of
selected IDs. The host supplies `value` and `onChange`; duplicate IDs and more than 500 selected
IDs throw. The picker adds one available option at a time. Selected chips can be removed with
their buttons, Backspace or Delete; Left and Right move between chips, and Left at the start of
the search moves to the last chip. Missing option IDs remain visible and submitted until the
host removes them. With `name`, each selected ID is submitted as a separate hidden input with
the same name. A disabled control submits nothing. The host owns reset and rejected changes;
hidden inputs do not provide native required validation. Use `<select multiple>` for a static
fallback.

Both controls accept an optional `create` object with `onCreate(query)` and a
`ComboboxCreateState`: `idle`, `pending` with the requested query, or `failed` with that query
and a message. A nonempty trimmed draft offers creation only when no existing option has the same
trimmed, case-insensitive label. Tab reaches the create button; Escape returns focus to the input.
Pending prevents duplicate activation. Failure remains available for retry, and states for other
drafts are not shown. A request does not create or select an option: the host adds the acknowledged
option and updates the selected value. The host must correlate requests and ignore late responses,
including repeated requests with identical text.

For remote search, pass `search` with an `onSearch(request)` callback and a
`ComboboxSearchState`. Opening the picker requests the empty query; edits request the current
text after composition completes. Each request carries a unique `id` and its `query`. The host
supplies `pending`, `ready` with grouped or individual options, or `failed` with a message, each
carrying the original request. The control shows only results for the latest request and retains
the first terminal result for it; retry issues a fresh request. Remote results are displayed in
host order without local filtering and obey the same ID and 500-option limits. Creation is offered
only after the current search succeeds. The host fetches data, handles cancellation and retains
selected option records in `options` so their labels remain available across searches. No search is
started by server rendering.

`CommandMenu`, `CommandMenuProps`, `CommandGroup`, and `Command` are exported from `layout`.
Load `styles/layout.css` after the base stylesheet. Supply a trigger `label`, groups with unique
group IDs and unique command IDs, and `onSelect(id)`. At most 500 commands are accepted. Each
command has a label, optional search keywords and an optional disabled state. Search keeps focus
in the input while Up and Down move the active enabled command; Enter requests that action once.
Escape first clears a query, then closes the dialog and returns focus to the trigger. A Close
button provides the same exit for pointer and touch users. The host performs actions and supplies
unavailable commands as disabled. This JavaScript-enhanced menu supplements ordinary navigation;
a submenu can contain one level of commands. Supply a `CommandSubmenu` with `kind: "submenu"`
and its own stable ID, label and commands; all command and submenu IDs must be unique, and both
count toward the 500-item limit. Opening a submenu does not call `onSelect`; choosing an enabled
child calls it with the child ID. The input searches within the current level. Escape clears the
draft, returns from a submenu while restoring the parent query and active item, then closes the
dialog. Back is also available as a button. If a submenu disappears or becomes disabled, the
menu returns to its parent without executing an action. Nested submenus are not supported.

An optional `shortcut` takes one ASCII letter or
digit, a `Control`, `Meta`, or `Alt` modifier, and optional `shift`. It opens the menu only when
focus is within its children or trigger. It does not intercept editable fields, composition,
repeats, or extra modifiers. A shortcut-opened dialog restores focus to the invoking control, or
the trigger if that control has disappeared. Choose a shortcut appropriate to the host platform;
the visible trigger remains available.

Import `Progress` and `ProgressProps` from `@laputa-systems/ui-dashboard/feedback`, and load
`@laputa-systems/ui-dashboard/styles/feedback.css` after the base stylesheet. `label` names a
native `<progress>` element. A missing `value` means indeterminate progress; zero is a measured
value. `max` defaults to 100 and must be positive and finite. A value must be finite and within
zero and `max`; invalid values throw `RangeError`. A reduced-motion preference makes the
indeterminate presentation static. Static HTML can use `ui-progress`, `ui-progress-label`,
and `ui-progress-bar` with the same native markup.

`ActionStatus` and its `ActionState` type are also exported from `feedback`. The host supplies
one of `idle`, `pending`, `succeeded`, `failed`, or `unavailable`. Non-idle states carry a
message. Only a failed state may supply `retry`; the component never starts or acknowledges an
operation itself. Failures use an alert and other messages use a status. Activating Retry moves
focus to the status container before calling the host, so the disappearing button does not
strand focus. The host retains structured error details and decides whether retry is appropriate.

Import `Disclosure` and `DisclosureProps` from `@laputa-systems/ui-dashboard/layout`, and load
`@laputa-systems/ui-dashboard/styles/layout.css` after the base stylesheet. `label` names a
native summary and `children` supplies its content. `defaultOpen` initializes local state once.
`open` makes the state controlled; `onOpenChange` receives the requested state once per user
action, and parent changes do not notify it. A controlled disclosure without a callback is
read-only. Static HTML can use `ui-disclosure`, `ui-disclosure-summary`, and
`ui-disclosure-body` with `<details>` and `<summary>` and needs no JavaScript.

`Accordion` from the same entry accepts a unique group `id` and an `items` array with stable,
unique item IDs, labels, children, and optional `disabled` states. `defaultOpenId` initializes
local selection; `openId` and `onOpenChange` control selection from the parent. `null` closes
all items. An absent selected item displays no open item and does not change the supplied ID.
A controlled group without a callback is read-only. Arrow keys move between enabled summaries;
Home and End move to the first and last enabled summary. Duplicate item IDs throw. Static HTML
can group `<details>` elements with the same unique `name` for single-open behavior.

`ActionMenu` from the layout entry accepts a trigger `label`, an `items` array with unique IDs,
labels and optional disabled states, and an `onSelect` callback. It owns its open state locally.
Arrow keys, Home, End and single-character matching move among enabled actions. Escape closes the
menu and returns focus to its trigger. Tab and outside clicks close the menu without taking
focus back. When all actions become unavailable, the menu closes and its trigger remains
focusable with `aria-disabled`. The menu requires JavaScript and the browser Popover API; use
ordinary links or forms for no-JavaScript actions. Generated IDs reserve the `ui-action-menu-`
prefix. Use distinct Solid `renderId` values when independently hydrating multiple roots.

Choose placeholder dimensions to match the content they replace. Keep the loading status outside
the busy region so assistive technology can announce it immediately.

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
<><span role="status">Loading</span><div aria-busy="true"><Skeleton rows={2} /></div></>
<Pagination page={page()} pages={3} from={1} to={10} total={30} onChange={setPage} />
<><span>CPU: 82%</span><Meter value={82} warn={70} bad={90} /></>
<PageHeader title="Overview" />
<Shell brand={{ href: "/", name: "Forge" }} nav={[{ label: "Main", items: [{ href: "/", label: "Home", current: true }] }]}><p>Home</p></Shell>
<SideNav index={0} group={{ label: "Main", items: [{ href: "/", label: "Home" }] }} />
```

`groupId(0)` returns `"ui-side-group-0"`. Use a unique index for each `SideNav` with a
visible heading. See [usage patterns](patterns.md) for complete interactive and CSS-only examples.

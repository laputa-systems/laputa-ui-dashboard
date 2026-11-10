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
retains the current parent value on form reset. The control classes can also be used directly in
static HTML as shown in the README.

`leadingContent` and `trailingContent` add decorative, noninteractive affixes around the input.
`showCount` associates a UTF-16 character count with the field and displays `maxlength` when
supplied. These options are additive; fields without affixes retain their original markup. The
native `prefix` attribute remains available. Static markup can wrap an input with
`ui-text-field-control` and use `ui-text-field-affix` for decorative spans. `clearable` adds a
clear button that dispatches one native input event and respects `disabled` and `readonly`;
controlled fields retain the parent value if the parent rejects the edit. `copyable` copies the
current value only on activation and reports success or failure in a live status. Clipboard
access requires browser support and permission; an edit invalidates an outstanding result.
`revealable` requires `type="password"` and toggles visibility while retaining the input and
selection. Copy and reveal controls respect `disabled`.

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

`Switch`, `SwitchProps`, and `SwitchRequestState` from `forms` present an immediate setting as a
native checkbox with switch semantics. The same controlled and `defaultChecked` behavior as
`Checkbox` applies. `placement` puts the switch at the start or end of its label. Optional
`state` is `idle`, `pending`, or `failed` with a nonempty message. Pending prevents another request
while retaining focus and the current native form value. Failure is announced and leaves the
current value unchanged. The host reports the result and updates `checked`. Native `disabled`
omits the value from form submission. Use a checkbox instead for a choice applied by a later form
submission. Static markup can combine `ui-choice`, `ui-switch`, `ui-checkbox`, and
`ui-choice-content` with a native checkbox carrying `role="switch"`.

`TagInput`, `TagInputProps`, `Tag`, `TagAddRequest`, `TagEditRequest`, and `TagRequestState` from `forms` provide
controlled tag chips. Supply a unique input ID, label, tags with nonempty unique IDs and normalized
labels, a request state, and `onAdd`. Labels are normalized with Unicode NFKC, trimmed, and have
internal whitespace collapsed. Duplicate comparison is case-insensitive. `maxTags` defaults to 50
and accepts 1–100. `maxLength` defaults to 80 and accepts 1–256 UTF-16 code units. Optional
`validate(label)` returns a message to reject a label. Enter or Add splits a list on commas,
semicolons, and line breaks. Pasting a list requests its valid entries immediately; spaces remain
inside labels. Rejected entries remain in the draft with their reasons. Drafts over 32,768 UTF-16
code units are not submitted. The host receives a unique request ID and an array of valid labels.
The host supplies `pending`,
`accepted`, or `failed` with that ID and adds accepted tags to `value`. The draft clears only
after the matching acceptance and values arrive. Later edits and stale results do not clear it.
`onEdit(request)` requests an edit with a unique request ID, tag ID, and normalized label. Editing
treats the whole draft as one label and restores any earlier draft after matching acceptance.
Cancel edit restores the earlier draft and does not cancel an in-flight host request. `onRemove(id)` requests removal; absent
edit or removal capabilities disable their chip buttons. Backspace at
an empty input moves focus to the last chip, and arrow keys traverse chips. Optional `name` submits
one hidden value per tag label. Form reset discards the draft and retains host-owned tags. Hidden
inputs do not provide native required validation. For a static form, use a labelled text field and
parse the submitted tags on the server.

`TextArea` and `TextAreaProps` from `forms` render a labelled native textarea. `hint`, `error`,
and optional `showCount` are associated with the control. The count uses UTF-16 code units and
shows `maxlength` when supplied. Native attributes and input, keyboard, and composition handlers
are forwarded. `defaultValue` initializes an uncontrolled textarea once. `value` with `onInput`
is parent-controlled; a rejected input restores the parent value outside composition. During IME
composition the browser retains the draft until the final input event. Form reset
restores the uncontrolled default or the current controlled value.

Optional `autosize` specifies `minRows` and `maxRows` from 1 to 100. Height updates when content
or container width changes. Autosize owns the textarea height and disables manual resizing while
enabled. Optional `expandRows` must exceed `maxRows` and be at most 100; its button expands or
collapses the control and restores the textarea selection. `submitShortcut` may be `ControlEnter`
or `MetaEnter`. The shortcut requests native form submission outside composition and does not
override a prevented key event. Plain Enter remains a newline. Read-only or disabled textareas do
not submit through the shortcut. Static forms can use a native textarea with `ui-text-field` and
`ui-textarea`.

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
are rendered as text and truncated to 255 characters for display. The native picker works with
keyboard and touch. For a static form,
use `ui-field ui-file-field` on a label containing a native file input, and validate submitted files
on the server.

Each `DropzoneFile` may include a `DropzoneUploadState`: `queued`, `uploading`, `cancelling`,
`cancelled`, `failed`, or `complete`. An omitted state means queued. Uploading may carry finite
`progress` with `value` from zero through a positive `max`; omit it for unknown progress. Failed
state requires a message, displayed up to 500 characters. `onCancel`, `onRetry`, and `onRemove`
receive the stable file ID. Missing callbacks disable their actions. The host updates the file
state after each request. Retry and cancel focus the file row before calling the host; Remove
focuses the queue. Background updates do not move focus. The component never starts an upload.

Set `imagePreviews` to show decorative previews of up to the first ten PNG, JPEG, GIF, or WebP
files at most 5 MiB each. Other files, including SVG, are not previewed. Preview eligibility uses
the browser-supplied MIME type and size; the host must validate file contents independently. The
component creates object URLs in the browser and revokes them when a file changes, its preview is
removed, or the component unmounts. Server rendering creates no object URLs.

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

`NotificationStack`, `NotificationStackProps`, and `Notification` from `feedback` present a
host-owned persistent list. Supply a label and at most 100 notices with nonempty unique IDs.
The stack renders one notice at a time. Previous and Next change the visible notice. An optional
action and Dismiss call the host with the notice ID; missing callbacks disable the corresponding
actions. A rejected dismissal leaves the notice in place. After the host removes a deliberately
dismissed notice, focus moves to the next notice if the user has not moved focus elsewhere.
Background updates do not move focus. Optional `total` includes all shown notices; if it exceeds
the supplied list, `inbox` must provide an HTTP or HTTPS link or a relative URL. Invalid IDs,
counts, or URLs throw. The stack does not expire notices.

`createToastStore`, `ToastStore`, `Toast`, `Toaster`, and `ToasterProps` from `feedback` provide
an isolated queue and its view. Create a store per application or server request; never share a
store between requests. `add` requires a unique nonempty ID and title, `update` replaces the
content for an existing ID, and `dismiss` returns whether an ID was present. Each store accepts
at most 100 notices. A toaster displays the oldest three by default; `maxVisible` can be 1–10.
A notice may supply an action label and callback. Notices persist unless `durationMs` supplies a
whole number from 1,000 to 86,400,000 milliseconds. A single host clock starts each timer when its notice becomes visible,
pauses on hover, focus or a hidden document, and restarts on update or remount. Unmounting cancels
the timers. Mount one toaster per store.
`store.track(id, operation, states)` adds a persistent pending notice and replaces it with the
mapped success or failure when the operation settles. It returns a promise with the operation's
value or rejection; callers must handle rejection. Dismissed or explicitly updated notices are
not overwritten by late results. `ToastPromiseStates<T>` describes the pending content and
result mapping callbacks.
A focused action removed by an update remains disabled until focus leaves it. Deliberately
dismissing a focused notice returns
focus to the connected element that most recently preceded entry into the toaster, when focus has
not moved elsewhere. Background removal never restores focus. Static HTML can use `ui-toaster`,
`ui-toast`, and `ui-toast-actions` to present a noninteractive notice.

`Tooltip` and `TooltipProps` from `layout` render a button with nonempty `label` and `content`
strings and noninteractive `children`. The label names the button independently of its tooltip;
the content is an associated description. Hover or focus shows it, touch toggles it, and Escape
dismisses it without leaving the trigger. It requires JavaScript and the browser Popover API.
Use short supplementary text; required instructions must remain visible outside the tooltip. A
static page can display the information as ordinary text.

`Popover` and `PopoverProps` from `layout` accept nonempty `trigger` and `label` strings and
`children`. Opening places focus on the first visible enabled control, or the surface when there
is none. Escape closes the surface and restores focus to its trigger; outside activation closes
it without moving focus. The surface is nonmodal and uses the browser Popover API and shared
anchored positioning. Use a native `<details>` disclosure when the content must work without
JavaScript. Do not use a popover as a substitute for modal confirmation.

`Breadcrumbs`, `BreadcrumbsProps`, and `Breadcrumb` from `layout` render a labelled navigation
landmark with ordinary ancestor links and a non-link current page. Supply `ancestors` in order and
`current`; `label` defaults to “Breadcrumb”. Labels must contain text, and ancestor URLs must be
relative or HTTP(S). Invalid labels and URLs throw. Long paths wrap without hiding links. Static
HTML can use `ui-breadcrumbs` on a `nav`, an ordered list of links, and
`ui-breadcrumb-separator` on decorative separators.

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

An action menu item may supply an HTTP or HTTPS `href` or a relative URL. A link navigates using
native browser behavior and does not call `onSelect`. Invalid URLs throw. An optional `header`
renders noninteractive content above the actions. A header keeps the menu available even if every
action is disabled.

`FilterMenu`, `FilterMenuProps`, `FilterGroup`, `FilterOption`, and `FilterSelection` are exported
from `layout`. Supply a `label`, named `groups`, a controlled `value`, and `onChange`. Selections
are `{ groupId, optionId }` pairs suitable for URL serialization. Group IDs are unique and option
IDs are unique within their group. IDs must be nonempty. The menu supports at most 50 groups,
500 options, and 500 selected pairs. Invalid collections throw. A selected pair missing from the
groups remains as a removable unavailable chip. Group selection affects enabled options only;
Clear all requests removal of every selected pair. Each action calls `onChange` once. Parent
updates do not call it. Native disclosures and checkboxes support keyboard operation. Arrow keys
move between chips. Escape closes the filter disclosure and focuses its summary. Removing a chip
restores focus after the parent removes it; a rejected request retains focus on the chip. A static
form can use native fieldsets and named checkboxes for server-side filtering.

`Tabs`, `TabsProps`, and `Tab` from `layout` provide semantic tabs and associated panels. Supply
a label, at most 100 tabs with nonempty unique IDs, a controlled `value`, and `onChange`.
Arrow keys, Home, and End move focus among enabled tabs. Automatic activation requests a selection
on movement; set `activation="manual"` to select with Enter or Space. Parent updates do not invoke
the callback. A missing selected ID displays no panel. Disabled tabs cannot be activated. Optional
icons are decorative and counts must be nonnegative integers. The tab strip scrolls when needed;
touch drags do not select a tab. Use distinct Solid `renderId` values for independently hydrated
roots. For static pages, use navigation links and server-rendered content.

`RadioGroup`, `RadioGroupProps`, and `RadioOption` from `forms` use native radios in a fieldset.
Supply a label, a form `name`, a controlled value or `null`, at most 100 options with nonempty
unique IDs, and `onChange`. Optional icons are decorative and counts must be nonnegative integers.
`required` and `disabled` retain native semantics. User changes request one value; parent changes
do not call the callback. Native form submission uses the selected ID. Form reset retains the
current parent value. If the selected ID is absent, no radio is checked. Give different groups
different names. Static forms can use ordinary fieldsets and radio inputs.

`NativeSelect`, `NativeSelectProps`, and `NativeSelectOption` from `forms` render a labelled
native select. Supply a unique `id`, label, and at most 500 options with nonempty unique values.
`hint` and `error` are associated with the control. Native select attributes such as `name`,
`required`, `disabled`, `form`, and `autocomplete` are forwarded. `defaultValue` initializes an
uncontrolled select and native reset restores that value. `value` and `onValueChange` make the
control parent-owned; a rejected request and form reset retain the parent value. A controlled
select without a callback is disabled. A `placeholder` supplies the empty value for a required
choice. An empty value with nonempty options requires a placeholder. A value missing from the options throws. The
component supports one selection. Static forms can use native select and option elements with
the field classes.

`Select`, `SelectProps`, and `SelectOption` from `forms` add an optional rich option browser to a
visible native select. Supply a controlled value and `onValueChange`, with at most 100 options.
The native select handles form submission, required validation, disabled state, and reset as in
`NativeSelect`. The Browse options button opens a collision-aware list with optional descriptions
and decorative icons. Arrow keys, Home, End, and type-ahead move the active option without changing
the value. Enter or Space requests a choice; Escape closes without changing it. Tab leaves the list.
The button retains focus during browsing. A parent may reject a request by retaining its value.
The enhanced browser requires JavaScript and the Popover API; the native control remains usable in
server-rendered markup without JavaScript.

Import `IntegrationPicker`, `IntegrationPickerProps`, `Integration`, and `IntegrationConnection`
from `@laputa-systems/ui-dashboard/recipes`. Load `styles/recipes.css` after the base stylesheet.
Supply a label and up to 500 services with nonempty unique IDs, names, descriptions, optional
keywords, and host-owned connection states. Invalid identities or empty failure and expiry messages
throw. The picker searches locally and keeps the selected service as presentation state. A removed
service loses its selection and does not become selected again if it returns. The host reports
`disconnected`, `pending`, `connected`, `expired`, or `failed`; selecting a service does not connect
it. `onConnect(id)` requests a connection or retry once per activation. A missing callback disables
the action. Pending disables it until the host supplies another state. The host owns authorization,
request correlation, and external results. Back returns to search. Escape returns to search from
details, then closes the dialog. Close restores focus to the trigger. The picker requires JavaScript;
provide an ordinary link to integration management for static pages.

`ProfileMenu`, `ProfileMenuProps`, and `ProfileAccount` from `recipes` compose `ActionMenu` and
`Progress`. Load the base stylesheet, then `styles/feedback.css`, `styles/layout.css`, and
`styles/recipes.css`. Supply a label, account name, optional detail and decorative avatar, and menu
items. Items with `href` are links; other items call `onSelect(id)` when supplied. Actions without
a callback are disabled. Optional `progress` uses the same value and max rules as `Progress`.
Arrow keys navigate enabled items and Escape returns focus to the trigger. The menu requires
JavaScript and the browser Popover API. Provide ordinary account links for static pages.

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

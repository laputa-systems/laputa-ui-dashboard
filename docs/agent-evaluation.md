# Agent evaluation scenarios

Status: unexecuted. These prompts describe outcomes without naming a library. Judge generated
results independently against the same criteria for every candidate. Record the environment and
candidate versions. Do not infer a score from this list.

| Prompt | Observable criteria |
| --- | --- |
| Build a page with navigation and mark the current section. | Navigation has an accessible name; exactly the current link has `aria-current="page"`. |
| Show a service status with text and a colored indicator. | Status remains understandable without color; indicator is decorative. |
| Let a user hide and reveal a section. | A keyboard user can operate the control; expanded state matches visible content. |
| Present details in a dismissible overlay. | Dialog is named, traps focus while open, closes by Escape, and returns focus. |
| Let a user choose one time range from three. | Group is named; each option is keyboard operable; selected state is exposed. |
| Show a failed request with a retry action. | Error text is accessible; retry is a working button with an accessible name. |
| Show a searchable table on a narrow phone. | Search has a label and visible focus; table remains reachable without page overflow. |
| Provide previous and next pages with a result count. | Boundary buttons are disabled; actions request the correct page; count is readable. |
| Show a loading placeholder and its loading status. | Placeholder is hidden from assistive technology; loading status is available as text. |
| Build a server-rendered repository page without JavaScript. | Styles load without scripts; links and forms work; content fits at 320 pixels. |

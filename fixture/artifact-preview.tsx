import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { ArtifactPreview, type ArtifactPreviewState } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [state, setState] = createSignal<ArtifactPreviewState>({ kind: "failed", message: "Preview unavailable", retry: () => setState({ kind: "loading", message: "Loading preview" }) });
  const text = <pre>{'<img src=x onerror="alert(1)">'}</pre>;
  const image = <img alt="Pixel preview" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" />;
  const table = <table><tbody><tr><th>Build</th><td>Passed</td></tr></tbody></table>;
  const file = <a href="/files/report.txt">Download report.txt</a>;
  const longCode = <pre>{"long-code-line-".repeat(100)}</pre>;
  return <>
    <button type="button" onClick={() => setState({ kind: "ready", dirty: true, content: text })}>Show text</button>
    <button type="button" onClick={() => setState({ kind: "ready", content: image })}>Show image</button>
    <button type="button" onClick={() => setState({ kind: "ready", content: table })}>Show table</button>
    <button type="button" onClick={() => setState({ kind: "ready", content: file })}>Show file</button>
    <button type="button" onClick={() => setState({ kind: "ready", content: longCode })}>Show long code</button>
    <button type="button" onClick={() => setState({ kind: "not-found", message: "Artifact no longer exists" })}>Show missing</button>
    <div style={{ width: "360px", "max-width": "100%" }}><ArtifactPreview label="Artifact preview" state={state()} actions={<button type="button">Open artifact</button>} /></div>
  </>;
}

render(() => <Fixture />, document.getElementById("root")!);

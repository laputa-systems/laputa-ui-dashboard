import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { hydrate } from "@solidjs/web";
import { ArtifactPreview, type ArtifactPreviewState } from "@laputa-systems/ui-dashboard/layout";

const root = document.getElementById("root");
if (!root) throw new Error("fixture root is missing");
function Preview() {
  const [state, setState] = createSignal<ArtifactPreviewState>({ kind: "failed", message: "Preview unavailable", retry: () => setState({ kind: "loading", message: "Loading" }) });
  return <ArtifactPreview label="Artifact" state={state()} />;
}
hydrate(() => <Preview />, root);
document.documentElement.dataset.reused = String(document.querySelector(".ui-artifact-preview") === (window as Window & { initialPreview?: Element }).initialPreview);
document.documentElement.dataset.hydrated = "yes";

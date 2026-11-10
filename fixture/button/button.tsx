import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Button, IconButton } from "../../dist/index.js";

interface FixtureWindow extends Window {
  updateButton?: () => void;
  removeAttributes?: () => void;
  swapHandler?: () => void;
  toggleLeading?: () => void;
  setType?: (type: "button" | "submit" | undefined) => void;
  updateIcon?: () => void;
}

function Fixture() {
  const [title, setTitle] = createSignal<string | undefined>("ready");
  const [describedBy, setDescribedBy] = createSignal<string | undefined>("hint");
  const [busy, setBusy] = createSignal(false);
  const [ariaLabel, setAriaLabel] = createSignal<string | undefined>();
  const [type, setType] = createSignal<"button" | "submit" | undefined>();
  const [mode, setMode] = createSignal<"a" | "b">("a");
  const [leading, setLeading] = createSignal(true);
  const [a, setA] = createSignal(0);
  const [b, setB] = createSignal(0);
  const [iconTitle, setIconTitle] = createSignal("icon ready");
  const [iconLabel, setIconLabel] = createSignal("Refresh");
  const [iconClicks, setIconClicks] = createSignal(0);
  const win = window as FixtureWindow;
  win.updateButton = () => {
    setTitle("updated");
    setDescribedBy("updated-hint");
    setBusy(true);
    setAriaLabel("Updated label");
    setType("submit");
  };
  win.removeAttributes = () => {
    setTitle(undefined);
    setDescribedBy(undefined);
  };
  win.swapHandler = () => setMode(current => (current === "a" ? "b" : "a"));
  win.toggleLeading = () => setLeading(current => !current);
  win.setType = setType;
  win.updateIcon = () => {
    setIconTitle("icon updated");
    setIconLabel("Reload");
  };
  return (
    <>
      <Button
        data-testid="target"
        title={title()}
        aria-describedby={describedBy()}
        aria-label="native label"
        ariaLabel={ariaLabel()}
        busy={busy()}
        type={type()}
        leadingIcon={leading() ? <span data-testid="leading">*</span> : undefined}
        trailingIcon={<span data-testid="trailing">!</span>}
        onClick={mode() === "a" ? () => setA(value => value + 1) : () => setB(value => value + 10)}
      >
        Save
      </Button>
      <output data-testid="a">{a()}</output>
      <output data-testid="b">{b()}</output>
      <IconButton data-testid="icon-target" ariaLabel={iconLabel()} title={iconTitle()} onClick={() => setIconClicks(value => value + 1)}>
        R
      </IconButton>
      <output data-testid="icon-clicks">{iconClicks()}</output>
      <Button data-testid="ref-target" ref={node => { node.dataset.refTag = node.localName; }}>Referenced</Button>
      <IconButton data-testid="icon-ref-target" ariaLabel="Referenced icon" ref={node => { node.dataset.refTag = node.localName; }}>I</IconButton>
    </>
  );
}

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);

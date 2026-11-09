import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Disclosure } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [open, setOpen] = createSignal(false);
  const [requests, setRequests] = createSignal(0);
  const [initial, setInitial] = createSignal(true);
  const [localRequests, setLocalRequests] = createSignal(0);
  return (
    <>
      <Disclosure label="Controlled" open={open()} onOpenChange={next => { setRequests(count => count + 1); setOpen(next); }}><button>Controlled content</button></Disclosure>
      <button onClick={() => setOpen(!open())}>Parent toggle</button>
      <output data-testid="disclosure-requests">{requests()}</output>
      <Disclosure label="Local" defaultOpen={initial()} onOpenChange={() => setLocalRequests(count => count + 1)}><button>Local content</button></Disclosure>
      <button onClick={() => setInitial(false)}>Change default</button>
      <output data-testid="local-requests">{localRequests()}</output>
      <Disclosure label="Locked" open={false}><button>Locked content</button></Disclosure>
    </>
  );
}
const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);

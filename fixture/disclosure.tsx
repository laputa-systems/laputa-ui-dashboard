import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Accordion, Disclosure } from "@laputa-systems/ui-dashboard/layout";

function Fixture() {
  const [open, setOpen] = createSignal(false);
  const [requests, setRequests] = createSignal(0);
  const [initial, setInitial] = createSignal(true);
  const [localRequests, setLocalRequests] = createSignal(0);
  const [selected, setSelected] = createSignal<string | null>(null);
  const [accordionRequests, setAccordionRequests] = createSignal(0);
  const [initialSection, setInitialSection] = createSignal<string | null>("a");
  const [localAccordionRequests, setLocalAccordionRequests] = createSignal(0);
  return (
    <>
      <Disclosure label="Controlled" open={open()} onOpenChange={next => { setRequests(count => count + 1); setOpen(next); }}><button>Controlled content</button></Disclosure>
      <button onClick={() => setOpen(!open())}>Parent toggle</button>
      <output data-testid="disclosure-requests">{requests()}</output>
      <Disclosure label="Local" defaultOpen={initial()} onOpenChange={() => setLocalRequests(count => count + 1)}><button>Local content</button></Disclosure>
      <button onClick={() => setInitial(false)}>Change default</button>
      <output data-testid="local-requests">{localRequests()}</output>
      <Disclosure label="Locked" open={false}><button>Locked content</button></Disclosure>
      <Accordion id="settings" openId={selected()} onOpenChange={next => { setAccordionRequests(count => count + 1); setSelected(next); }} items={[
        { id: "one", label: "First section", children: <button>First content</button> },
        { id: "disabled", label: "Unavailable section", disabled: true, children: "Unavailable content" },
        { id: "two", label: "Second section", children: <button>Second content</button> }
      ]} />
      <button onClick={() => setSelected("one")}>Select first</button>
      <output data-testid="accordion-requests">{accordionRequests()}</output>
      <Accordion id="local-sections" defaultOpenId={initialSection()} onOpenChange={() => setLocalAccordionRequests(count => count + 1)} items={[
        { id: "a", label: "Local first", children: "Local first body" },
        { id: "b", label: "Local second", children: "Local second body" }
      ]} />
      <button onClick={() => setInitialSection("b")}>Change initial section</button>
      <output data-testid="local-accordion-requests">{localAccordionRequests()}</output>
      <Accordion id="locked-sections" openId={null} items={[{ id: "locked", label: "Locked section", children: "Locked body" }]} />
    </>
  );
}
const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);

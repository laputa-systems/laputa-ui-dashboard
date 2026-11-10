import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/forms.css";
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";
import { Checkbox } from "@laputa-systems/ui-dashboard/forms";

function Fixture() {
  const [checked, setChecked] = createSignal(false);
  const [mixed, setMixed] = createSignal(true);
  const [changes, setChanges] = createSignal(0);
  const [rejected, setRejected] = createSignal(0);
  const [mixedRejected, setMixedRejected] = createSignal(0);
  const [dailyInitial, setDailyInitial] = createSignal(true);
  const [submitted, setSubmitted] = createSignal("");
  return (
    <>
      <form onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get("notify"))); }}>
        <fieldset><legend>Notifications</legend>
          <Checkbox id="notify" label="Email updates" hint="Receive updates by email" error="Selection required" name="notify" value="email" required card />
          <Checkbox id="daily" label="Daily summary" name="daily" defaultChecked={dailyInitial()} />
        </fieldset>
        <button type="submit">Save preferences</button>
        <button type="reset">Reset preferences</button>
        <button type="button" onClick={() => setDailyInitial(false)}>Change daily default</button>
      </form>
      <output data-testid="checkbox-submitted">{submitted()}</output>
      <form>
        <Checkbox id="all" label="Select all" checked={checked()} indeterminate={mixed()} onCheckedChange={next => { setChanges(count => count + 1); setChecked(next); setMixed(false); }} />
        <button type="reset">Reset controlled</button>
      </form>
      <button onClick={() => setChecked(value => !value)}>Parent checkbox update</button>
      <output data-testid="checkbox-changes">{changes()}</output>
      <Checkbox id="refused" label="Refused change" checked={false} onCheckedChange={() => setRejected(count => count + 1)} />
      <output data-testid="checkbox-rejected">{rejected()}</output>
      <Checkbox id="mixed-held" label="Mixed held" checked={false} indeterminate onCheckedChange={() => setMixedRejected(count => count + 1)} />
      <output data-testid="mixed-rejected">{mixedRejected()}</output>
      <Checkbox id="locked-checkbox" label="Locked checkbox" checked={false} />
    </>
  );
}
const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(() => <Fixture />, root);

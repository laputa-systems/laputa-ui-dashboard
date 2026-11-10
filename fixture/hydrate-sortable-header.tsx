import { createSignal } from "solid-js";
import { hydrate } from "@solidjs/web";
import { SortableHeader, type SortDirection } from "@laputa-systems/ui-dashboard/data";

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
const initial = root.querySelector("button");
hydrate(() => {
  const [direction, setDirection] = createSignal<SortDirection>("ascending");
  return <SortableHeader label="Host" direction={direction()} onSort={() => setDirection("descending")} />;
}, root);
document.documentElement.dataset.hydrated = "yes";
document.documentElement.dataset.reused = String(root.querySelector("button") === initial);

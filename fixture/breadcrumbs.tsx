import "@laputa-systems/ui-dashboard/styles.css";
import "@laputa-systems/ui-dashboard/styles/layout.css";
import { render } from "@solidjs/web";
import { Breadcrumbs } from "@laputa-systems/ui-dashboard/layout";

render(() => <main style={{ width: "min(100%, 22rem)" }}><Breadcrumbs ancestors={[{ label: "Projects", href: "/projects" }, { label: "A project with a very long name that remains readable", href: "/projects/long" }]} current="Repository settings" /></main>, document.getElementById("root")!);

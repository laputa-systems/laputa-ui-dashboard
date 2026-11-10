import { render } from "@solidjs/web";
import { Button } from "../../dist/index.js";

const root = document.getElementById("root");
if (root === null) throw new Error("fixture root is missing");
render(
  () => (
    <Button
      data-testid="target"
      title="server title"
      form="editor"
      name="action"
      value="save"
      aria-describedby="hint"
      style={{ color: "red" }}
      leadingIcon="*"
      onClick={() => {}}
    >
      Hydrate
    </Button>
  ),
  root
);

import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  root: import.meta.dirname,
  plugins: [solid()],
  server: { host: "127.0.0.1", strictPort: true }
});

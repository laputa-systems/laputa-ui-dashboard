import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vite";
import { staticForge } from "./static-forge-server.ts";

export default defineConfig({
  root: import.meta.dirname,
  plugins: [solid(), staticForge()],
  server: { host: "127.0.0.1", strictPort: true }
});

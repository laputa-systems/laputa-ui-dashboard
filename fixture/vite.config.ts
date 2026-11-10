import { resolve } from "node:path";
import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vite";
import { staticForge } from "./static-forge-server.ts";

export default defineConfig({
  root: import.meta.dirname,
  plugins: [{
    name: "fixture-dist-assets",
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url?.startsWith("/dist/")) request.url = `/@fs${resolve(import.meta.dirname, "../dist")}${request.url.slice(5)}`;
        next();
      });
    }
  }, solid(), staticForge()],
  server: { host: "127.0.0.1", strictPort: true }
});

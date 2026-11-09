import { resolve } from "node:path";
import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: { index: resolve(import.meta.dirname, "src/index.ts"), forms: resolve(import.meta.dirname, "src/forms/index.ts"), feedback: resolve(import.meta.dirname, "src/feedback/index.ts") },
      formats: ["es"],
      fileName: (_, name) => `${name}.js`,
    },
    rollupOptions: {
      external: [
        "solid-js",
        "solid-js/web",
        "@solidjs/web",
        "@solidjs/web/jsx-runtime",
      ],
    },
    emptyOutDir: false,
  },
});

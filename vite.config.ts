import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project Pages serves under https://<user>.github.io/sailboat-comparison/,
// so all asset URLs must be prefixed with that subpath.
export default defineConfig({
  base: "/sailboat-comparison/",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});

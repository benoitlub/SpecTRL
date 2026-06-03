import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  base: "/SpecTRL/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(srcPath),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
});

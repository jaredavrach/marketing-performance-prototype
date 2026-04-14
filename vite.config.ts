import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const projectRoot = path.resolve(__dirname, "src/project");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": projectRoot,
      "@lib": path.resolve(__dirname, "src/lib"),
    },
  },
  server: {
    open: true,
  },
});

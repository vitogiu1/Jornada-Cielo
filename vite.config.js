import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },
});

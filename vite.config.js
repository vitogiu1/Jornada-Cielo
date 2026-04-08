import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      // Mapeia tanto o '@' quanto o '/src' para a pasta física dentro de public
      "@": path.resolve(__dirname, "./public/src"),
      "/src": path.resolve(__dirname, "./public/src"),
    },
  },
  build: {
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },
  // Opcional: Garante que o servidor do Vite observe mudanças na pasta public/src
  server: {
    watch: {
      usePolling: true,
    },
  },
});

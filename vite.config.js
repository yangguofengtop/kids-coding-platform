import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/srbc/",
  plugins: [vue()],
  server: { port: Number(process.env.PORT || 5174) },
  preview: { port: 4173 },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.spec.js"],
    clearMocks: true,
  },
});

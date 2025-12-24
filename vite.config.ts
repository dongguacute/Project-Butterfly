import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  ssr: {
    noExternal: ["gsap", "@gsap/react"],
  },
  build: {
    assetsInlineLimit: 0, // 确保静态资源路径清晰
  },
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo.webp"],
      manifest: {
        name: "Project Butterfly",
        short_name: "Butterfly",
        description: "⭐A beauty transformation diary, wishing everyone can become the person they want to be⭐",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "logo.webp",
            sizes: "512x512",
            type: "image/webp",
          },
          {
            src: "logo.webp",
            sizes: "512x512",
            type: "image/webp",
            purpose: "any maskable",
          },
        ],
      },
    }) as any,
  ],
});

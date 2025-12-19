// eslint-disable-next-line no-restricted-imports
import {envSchema} from "./src/utils/env/envSchema";
import react from "@vitejs/plugin-react-swc";
import {cleanEnv} from "envalid";
import path from "path";
import {defineConfig, loadEnv} from "vite";
import eslint from "vite-plugin-eslint";
import {VitePWA} from "vite-plugin-pwa";
import viteTsconfigPaths from "vite-tsconfig-paths";

// eslint-disable-next-line no-restricted-exports
export default defineConfig(() => {
  const env = loadEnv("", process.cwd(), "");
  const validatedEnvs = cleanEnv(env, envSchema);

  const isProd = env.ENV_TYPE === "prod";

  const config = {
    build: {
      target: "esnext",
      outDir: "build",
      cache: true,
    },
    resolve: {alias: {"src": path.resolve(__dirname, "./src")}},
    plugins: [
      react(),
      eslint(
        // Exclude "virtual" and "sb-preview" to fix bug with vite-plugin-eslint and Storybook
        // https://github.com/storybookjs/builder-vite/issues/535#issuecomment-1507352550
        // https://github.com/vitejs/vite/issues/15374
        {
          exclude: ["/virtual:/**", "/sb-preview/**"],
          failOnError: false,
        },
      ),
      viteTsconfigPaths(),
    ],
    define: {"process.env": validatedEnvs},
  };

  if (isProd) {
    config.plugins.push(
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg", "favicon.ico", "robots.txt", "apple-touch-icon.png"],
        // Manifest: {
        //   name: 'My App',
        //   short_name: 'MyApp',
        //   description: 'My awesome app',
        //   theme_color: '#ffffff',
        //   icons: [
        //     {
        //       src: 'pwa-192x192.png',
        //       sizes: '192x192',
        //       type: 'image/png',
        //     },
        //     {
        //       src: 'pwa-512x512.png',
        //       sizes: '512x512',
        //       type: 'image/png',
        //     },
        //   ],
        // },
        workbox: {
          // Если нужно, вы можете кастомизировать воркер, используя Workbox
          // Например, можете настроить стратегии кэширования и другие параметры.
          // eslint-disable-next-line max-len, no-magic-numbers
          maximumFileSizeToCacheInBytes: 200 * 1024 * 1024, // 200MB - нужно про запас, скорее всего потом просто артифакты с googledrive лучше тянуть будет чем cdn
        },
      }),
    );
  }

  return config;
});

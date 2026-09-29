import { createSerwistRoute } from "@serwist/turbopack";

const revision = "1";

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [
    { url: "/offline", revision },
    { url: "/icons/icon-192.png", revision },
    { url: "/icons/icon-512.png", revision },
    { url: "/icons/icon-maskable-512.png", revision },
    { url: "/icons/apple-touch-icon.png", revision },
  ],
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AWWAB",
    short_name: "AWWAB",
    description: "Catat kebiasaan harian, kejar skor 100 tiap hari.",
    lang: "id",
    start_url: "/hari-ini",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#2B2350",
    background_color: "#FFF4D6",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

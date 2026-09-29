import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development", // Disable service worker in dev for easier debugging
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);

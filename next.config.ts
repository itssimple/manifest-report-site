import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    /* config options here */
    staticPageGenerationTimeout: 3600,
    images: {
        unoptimized: process.env.JSONDEBUG === "true",
        remotePatterns: [
            {
                protocol: "https",
                hostname: "www.bungie.net",
                port: "",
            },
        ],
    },
};

export default nextConfig;

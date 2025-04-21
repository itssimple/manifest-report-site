import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    staticPageGenerationTimeout: 3600,
    images: {
        unoptimized: false,
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

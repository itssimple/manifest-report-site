import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    /* config options here */
    staticPageGenerationTimeout: 3600,
};

export default nextConfig;

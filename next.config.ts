import type { NextConfig } from "next";
const s3Hostname = process.env.S3_ENDPOINT
  ? new URL(process.env.S3_ENDPOINT).hostname
  : undefined;

const publicHostname = process.env.PUBLIC_FILE_URL
  ? new URL(process.env.PUBLIC_FILE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/*",
      },
      ...(s3Hostname
        ? [
            {
              protocol: "https" as const,
              hostname: s3Hostname,
              pathname: "/**",
            },
          ]
        : []),
      ...(publicHostname
        ? [
            {
              protocol: "https" as const,
              hostname: publicHostname,
              pathname: "/images/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;

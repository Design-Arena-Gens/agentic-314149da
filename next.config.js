/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["agentic-314149da.vercel.app"]
    }
  }
};

module.exports = nextConfig;

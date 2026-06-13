/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@consumet/extensions", "got-scraping", "got"],
  }
};

export default nextConfig;
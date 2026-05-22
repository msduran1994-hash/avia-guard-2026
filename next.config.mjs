/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  env: {
    BASE44_APP_ID: process.env.BASE44_APP_ID,
    BASE44_API_KEY: process.env.BASE44_API_KEY,
  },
};

export default nextConfig;

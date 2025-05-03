/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "api.microlink.io", // Microlink Image Preview
      "img.clerk.com",    // Clerk authentication profile images
    ],
  },
};

export default nextConfig;

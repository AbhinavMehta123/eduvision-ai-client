/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Exposes environment variables as safe Next.js Config without requiring the NEXT_PUBLIC_ prefix
  env: {
    API_URL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://eduvision-ai-server-node.onrender.com/api',
    FLASK_URL: process.env.FLASK_URL || process.env.FLASK_AI_URL || process.env.NEXT_PUBLIC_FLASK_URL || 'https://eduvision-ai-server-flask.onrender.com/api/ai',
  },
};

export default nextConfig;

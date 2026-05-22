/** @type {import('next').NextConfig} */

const requiredEnvs = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DEFAULT_ADMIN_EMAIL',
  'DEFAULT_ADMIN_PASSWORD'
];

for (const env of requiredEnvs) {
  if (!process.env[env]) {
    throw new Error(`CRITICAL STARTUP ERROR: Missing required environment variable: ${env}`);
  }
}

const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Allow local network IP to load JS chunks in dev
  allowedDevOrigins: ['192.168.31.248', 'localhost', '127.0.0.1'],
};

export default nextConfig;

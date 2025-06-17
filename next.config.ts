import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
      'https://9003-firebase-studio-1750195328679.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev',
      'http://localhost:9003', // Good to have for local access too
    ],
  },
};

export default nextConfig;


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
  allowedDevOrigins: [
    'https://6000-firebase-studio-1750195328679.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev',
    'http://6000-firebase-studio-1750195328679.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev',
    'http://localhost:9003', // As per package.json dev script -p flag
    'http://localhost:9002'  // As per server logs --port flag
  ],
};

export default nextConfig;

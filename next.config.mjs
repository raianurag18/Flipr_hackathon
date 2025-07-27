import withPWA from 'next-pwa';

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
};

const nextConfig = {
  // Your Next.js config options here
  turbopack: {},
};

export default withPWA(pwaConfig)(nextConfig);

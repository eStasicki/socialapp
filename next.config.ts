import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Portrety mockowe (tryb DEV). Avatary z Supabase Storage dojdą w etapie 3.
    remotePatterns: [new URL("https://randomuser.me/api/portraits/**")],
  },
};

export default nextConfig;

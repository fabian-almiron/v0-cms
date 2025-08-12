/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Suppress webpack warnings for our theme auto-discovery system
    config.ignoreWarnings = [
      {
        module: /register-blocks\.tsx$/,
        message: /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      },
    ]
    return config
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  output: 'standalone',

  // This silences the warning and makes Turbopack use tsconfig paths.
  turbopack: {}
}

export default nextConfig

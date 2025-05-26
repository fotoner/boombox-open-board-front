/** @type {import('next').NextConfig} */
const repoName = "boombox-open-board-front"; // 실제 저장소 이름으로 변경

const nextConfig = {
  output: "export",
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}/`,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  compiler: {
    emotion: true,
  },
};

export default nextConfig;

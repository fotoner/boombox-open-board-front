/** @type {import('next').NextConfig} */
const repoName = "boombox-open-board-front"; // 실제 저장소 이름으로 변경

const nextConfig = {
  // 로컬 프로덕션 테스트를 위해 임시 주석 처리
  // basePath: process.env.NODE_ENV === "production" ? `/${repoName}` : "",
  // assetPrefix: process.env.NODE_ENV === "production" ? `/${repoName}/` : "",

  // Docker 배포를 위한 standalone 출력 모드
  output: "standalone",

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

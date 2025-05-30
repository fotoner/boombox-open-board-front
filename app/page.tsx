"use client";

import { useState } from "react";
import {
  Container,
  MainContent,
  SectionTitle,
  EmptyState,
  SectionDescription,
  Button,
} from "./styles/main.styles";
import ThemeSubmitModal from "@/components/theme-submit-modal";
import FinishModal from "@/components/finish-modal";
import HeroSection from "@/components/HeroSection";
import ThemeCard from "@/components/ThemeCard";
import type { Theme } from "@/types/theme";
import { useAuthStore, mockLogin } from "@/store/auth-store";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  trackLogin,
  trackLogout,
  trackThemeShare,
  trackModalOpen,
} from "@/lib/gtag";
import { getTwitterShareUrl } from "@/app/utils/share";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { Plus, Twitter } from "lucide-react";

// 모의 데이터 (닉네임 포함)
const mockThemes: Theme[] = [
  {
    id: "1",
    content: "90년대 애니메이션 OST 특집",
    author: "@anime_lover_90",
    authorNickname: "90년대키드",
    createdAt: new Date("2024-01-15T10:30:00"),
    createdByMe: false,
  },
  {
    id: "2",
    content: "스튜디오 지브리 명곡 모음",
    author: "@ghibli_fan",
    authorNickname: "지브리매니아",
    createdAt: new Date("2024-01-14T15:20:00"),
    createdByMe: false,
  },
  {
    id: "3",
    content: "건담 시리즈 테마곡 메들리",
    author: "@gundam_pilot",
    authorNickname: "건담파일럿",
    createdAt: new Date("2024-01-13T09:45:00"),
    createdByMe: false,
  },
];

// 사용자 목업 데이터
const mockUserTheme: Theme = {
  id: "user1",
  content: "디즈니 클래식 애니메이션 OST 모음",
  author: "@user",
  authorNickname: "디즈니러버",
  createdAt: new Date("2024-01-16T14:20:00"),
  createdByMe: true,
};

export default function HomePage() {
  const { isLoggedIn, user, logout } = useAuthStore();
  const [themes, setThemes] = useState<Theme[]>(mockThemes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [submittedTheme, setSubmittedTheme] = useState<Theme | null>(null);

  // Google Analytics 페이지뷰 추적
  useAnalytics();

  const handleLogin = () => {
    mockLogin();
    trackLogin("twitter");
  };

  const handleLogout = () => {
    logout();
    trackLogout();
  };

  const handleSubmitTheme = (content: string) => {
    if (!user) return;

    const newTheme: Theme = {
      id: Date.now().toString(),
      content,
      author: user.id,
      authorNickname: user.nickname,
      createdAt: new Date(),
      createdByMe: true,
    };
    setThemes([newTheme, ...themes]);
    setSubmittedTheme(newTheme);
    setIsModalOpen(false);
    setIsFinishModalOpen(true);
  };

  const handleShare = (theme: Theme) => {
    const twitterUrl = getTwitterShareUrl(theme);

    // Google Analytics 이벤트 추적
    trackThemeShare(theme.id, "twitter");

    window.open(twitterUrl, "_blank");
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    trackModalOpen("theme_submit");
  };

  return (
    <Container>
      <HeroSection
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenModal={handleOpenModal}
      />

      <MainContent>
        {isLoggedIn && user && (
          <>
            <SectionTitle>이번 2주년에 신청한 테마</SectionTitle>
            <SectionDescription>
              이번에 신청하신 테마 목록이에요!!
            </SectionDescription>
            <div>
              {themes.filter((theme) => theme.author === user.id).length > 0 ? (
                themes
                  .filter((theme) => theme.author === user.id)
                  .map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      isOwn={true}
                      onShare={handleShare}
                    />
                  ))
              ) : (
                <ThemeCard
                  key={mockUserTheme.id}
                  theme={mockUserTheme}
                  isOwn={true}
                  onShare={handleShare}
                />
              )}
            </div>
          </>
        )}

        {/* 특정 트윗 임베드 */}
        <div
          style={{
            width: "100%",
            maxWidth: "555px",
            margin: "0 0",
          }}
        >
          <div style={{}}>
            <TwitterTweetEmbed
              tweetId="1913559222790558092"
              options={{ width: 550 }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "1rem 0",
            gap: "1rem",
          }}
        >
          {isLoggedIn ? (
            <Button variant="secondary" onClick={handleOpenModal}>
              <Plus size={20} style={{ marginRight: "0.5rem" }} />
              테마 신청하기
            </Button>
          ) : (
            <Button variant="primary" onClick={handleLogin}>
              <Twitter size={20} style={{ marginRight: "0.5rem" }} />
              트위터(X)로 로그인
            </Button>
          )}
          <Button
            variant="neutral"
            onClick={() => (window.location.href = "/themes")}
          >
            모든 신청 리스트 보기
          </Button>
        </div>
      </MainContent>

      <ThemeSubmitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTheme}
      />

      <FinishModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        theme={submittedTheme}
      />
    </Container>
  );
}

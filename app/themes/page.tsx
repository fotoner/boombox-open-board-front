"use client";

import { useState } from "react";
import {
  Container,
  MainContent,
  SectionTitle,
  EmptyState,
  SectionDescription,
  Button,
} from "../styles/main.styles";
import ThemeCard from "@/components/ThemeCard";
import type { Theme } from "@/types/theme";
import { useAuthStore, mockLogin } from "@/store/auth-store";
import { getTwitterShareUrl } from "@/app/utils/share";
import {
  trackThemeShare,
  trackLogin,
  trackLogout,
  trackModalOpen,
} from "@/lib/gtag";
import { ArrowLeft, Plus, Twitter } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import ThemeSubmitModal from "@/components/theme-submit-modal";
import FinishModal from "@/components/finish-modal";

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

export default function ThemesPage() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const [themes, setThemes] = useState<Theme[]>(mockThemes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [submittedTheme, setSubmittedTheme] = useState<Theme | null>(null);

  const handleShare = (theme: Theme) => {
    const twitterUrl = getTwitterShareUrl(theme);
    trackThemeShare(theme.id, "twitter");
    window.open(twitterUrl, "_blank");
  };

  const handleLogin = () => {
    mockLogin();
    trackLogin("twitter");
  };

  const handleLogout = () => {
    logout();
    trackLogout();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    trackModalOpen("theme_submit");
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
        <SectionTitle>이번 2주년에 신청된 테마들</SectionTitle>

        <SectionDescription>
          비슷하거나 같은 테마가 많을 수록 <br />
          실제 채택될 확률이 높아져요!!!!
        </SectionDescription>

        <div>
          {themes.map((theme) => {
            const isOwn = Boolean(user && theme.author === user.id);
            return (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isOwn={isOwn}
                onShare={handleShare}
              />
            );
          })}
        </div>

        {themes.length === 0 && (
          <EmptyState>
            아직 신청된 테마가 없습니다. 첫 번째 테마를 신청해보세요!
          </EmptyState>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "2rem 0",
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

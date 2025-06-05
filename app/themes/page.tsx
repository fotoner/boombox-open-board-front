"use client";

import { useState, useEffect } from "react";
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
import { useAuthStore } from "@/store/auth-store";
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
import {
  getActiveEvent,
  createTheme,
  canCreateThemeToday,
} from "@/lib/theme-api";
import type { EventResponse } from "@/lib/theme-api";
import { isAdmin, canCreateThemes } from "@/types/user";

// API 호출 함수
async function getThemes(
  eventId: number,
  page: number = 0,
  size: number = 20
): Promise<{
  themes: Theme[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    // 환경에 따른 API URL 설정
    const getApiBaseUrl = () => {
      // 환경변수가 있으면 우선 사용
      if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
      }

      // 프로덕션이면 실제 도메인 사용
      if (process.env.NODE_ENV === "production") {
        return "https://boombox.fotone.moe";
      }

      // 개발환경에서는 localhost:8080
      return "http://localhost:8080";
    };

    const baseUrl = getApiBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/themes?eventId=${eventId}&page=${page}&size=${size}&sort=createdAt,desc`
    );

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return { themes: [], totalElements: 0, totalPages: 0, currentPage: 0 };
    }

    const { content, totalElements, totalPages, pageable } = result.data;

    // API 응답을 Theme 타입으로 변환
    const themes: Theme[] = content.map((item: any) => ({
      id: item.id.toString(),
      content: item.content,
      author: item.authorUsername || "unknown",
      authorNickname: item.authorName || item.authorUsername || "unknown",
      createdAt: new Date(item.createdAt),
      createdByMe: false, // 이 정보는 별도로 설정해야 함
    }));

    return {
      themes,
      totalElements,
      totalPages,
      currentPage: pageable.pageNumber,
    };
  } catch (error) {
    console.error("테마 목록 조회 실패:", error);
    return { themes: [], totalElements: 0, totalPages: 0, currentPage: 0 };
  }
}

export default function ThemesPage() {
  const { user, isLoggedIn, logout, initializeAuth, isLoading, startLogin } =
    useAuthStore();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [submittedTheme, setSubmittedTheme] = useState<Theme | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventResponse | null>(null);
  const [canCreateToday, setCanCreateToday] = useState(true);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 컴포넌트 마운트 시 인증 상태 초기화
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 활성 이벤트 조회
  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const event = await getActiveEvent();
        setActiveEvent(event);
      } catch (error) {
        console.error("Failed to fetch active event:", error);
      }
    };

    fetchActiveEvent();
  }, []);

  // 활성 이벤트가 있으면 테마 목록 조회
  useEffect(() => {
    if (activeEvent) {
      fetchThemes(0, true); // 첫 페이지부터 시작, 초기화
    }
  }, [activeEvent]);

  // 로그인 상태가 변경되면 생성 가능 여부 확인
  useEffect(() => {
    if (isLoggedIn && user) {
      checkCanCreateToday();
    } else {
      setCanCreateToday(true);
    }
  }, [isLoggedIn, user]);

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 // 하단 1000px 전에 로드
      ) {
        if (!isLoadingMore && hasMore) {
          loadMoreThemes();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, hasMore, currentPage]);

  const fetchThemes = async (page: number = 0, reset: boolean = false) => {
    if (!activeEvent) return;

    if (reset) {
      setIsLoadingThemes(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await getThemes(activeEvent.id, page);

      if (reset) {
        setThemes(result.themes);
        setCurrentPage(0);
      } else {
        setThemes((prev) => [...prev, ...result.themes]);
        setCurrentPage(page);
      }

      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setHasMore(page + 1 < result.totalPages);
    } catch (error) {
      console.error("Failed to fetch themes:", error);
    } finally {
      setIsLoadingThemes(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreThemes = () => {
    if (!isLoadingMore && hasMore) {
      fetchThemes(currentPage + 1, false);
    }
  };

  const checkCanCreateToday = async () => {
    if (!isLoggedIn) return;

    try {
      const canCreate = await canCreateThemeToday();
      setCanCreateToday(canCreate);
    } catch (error) {
      console.error("Failed to check can create today:", error);
    }
  };

  const handleShare = (theme: Theme) => {
    const twitterUrl = getTwitterShareUrl(theme);
    trackThemeShare(theme.id, "twitter");
    window.open(twitterUrl, "_blank");
  };

  const handleLogin = async () => {
    try {
      await startLogin();
      trackLogin("twitter");
    } catch (error) {
      console.error("로그인 시작 실패:", error);
      alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      trackLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleOpenModal = () => {
    // 권한 확인 추가
    if (!canCreateThemes(user)) {
      alert("테마 신청 권한이 없습니다. 관리자에게 문의하세요.");
      return;
    }

    if (!canCreateToday) {
      alert("오늘은 이미 테마를 작성하셨습니다. 내일 다시 시도해주세요!");
      return;
    }

    if (!activeEvent) {
      alert("현재 활성화된 이벤트가 없습니다. 관리자에게 문의하세요.");
      return;
    }

    setIsModalOpen(true);
    trackModalOpen("theme_submit");
  };

  const handleSubmitTheme = async (content: string) => {
    if (!user || !activeEvent) return;

    try {
      const title =
        content.length > 30 ? content.substring(0, 30) + "..." : content;
      const newTheme = await createTheme(title, content, activeEvent.id);

      // 테마 목록 새로고침 (첫 페이지부터)
      await fetchThemes(0, true);

      setSubmittedTheme(newTheme);
      setIsModalOpen(false);
      setIsFinishModalOpen(true);

      // 생성 가능 여부 다시 확인
      checkCanCreateToday();
    } catch (error) {
      console.error("Failed to submit theme:", error);
      alert("테마 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  if (isLoading) {
    return (
      <Container>
        <MainContent>
          <div style={{ textAlign: "center", padding: "2rem" }}>로딩 중...</div>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container>
      <HeroSection
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenModal={handleOpenModal}
        canCreateToday={canCreateToday}
        activeEvent={activeEvent}
      />

      <MainContent>
        <SectionTitle>
          {activeEvent
            ? `이번 ${activeEvent.title}에 신청된 테마들`
            : "신청된 테마들"}
        </SectionTitle>

        <SectionDescription>
          비슷하거나 같은 테마가 많을 수록 <br />
          실제 채택될 확률이 높아져요!!!!
        </SectionDescription>

        <div>
          {isLoadingThemes ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              테마 목록을 불러오는 중...
            </div>
          ) : themes.length > 0 ? (
            themes.map((theme) => {
              const isOwn = Boolean(user && theme.author === user.id);
              return (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isOwn={isOwn}
                  onShare={handleShare}
                />
              );
            })
          ) : (
            <EmptyState>
              아직 신청된 테마가 없습니다. 첫 번째 테마를 신청해보세요!
            </EmptyState>
          )}
        </div>

        {/* 무한 스크롤 로딩 인디케이터 */}
        {isLoadingMore && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "14px", color: "#666" }}>
              더 많은 테마를 불러오는 중...
            </div>
          </div>
        )}

        {/* 더 이상 불러올 데이터가 없을 때 */}
        {!hasMore && themes.length > 0 && !isLoadingThemes && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "14px", color: "#999" }}>
              모든 테마를 불러왔습니다! 총 {totalElements}개의 테마가 있어요.
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "2rem 0",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {isLoggedIn ? (
            <Button
              variant="secondary"
              onClick={handleOpenModal}
              disabled={
                !canCreateThemes(user) ||
                !canCreateToday ||
                !activeEvent?.canSubmitTheme
              }
            >
              <Plus size={20} style={{ marginRight: "0.5rem" }} />
              {!canCreateThemes(user)
                ? "테마 신청 권한 없음"
                : !canCreateToday
                ? "오늘은 이미 작성함"
                : !activeEvent?.canSubmitTheme
                ? "테마 신청 기간 아님"
                : "테마 신청하기"}
            </Button>
          ) : (
            <Button variant="primary" onClick={handleLogin}>
              <Twitter size={20} style={{ marginRight: "0.5rem" }} />
              트위터(X)로 로그인
            </Button>
          )}

          <Button
            variant="neutral"
            onClick={() => (window.location.href = "/")}
          >
            메인 페이지로 돌아가기
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
        user={user}
      />
    </Container>
  );
}

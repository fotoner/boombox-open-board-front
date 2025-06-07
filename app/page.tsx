"use client";

import { useState, useEffect } from "react";
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
import { useAuthStore } from "@/store/auth-store";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  trackLogin,
  trackLogout,
  trackThemeShare,
  trackModalOpen,
} from "@/lib/gtag";
import { getTwitterShareUrl } from "@/app/utils/share";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { Plus, Twitter, Calendar, Users } from "lucide-react";
import {
  getMyThemes,
  createTheme,
  getActiveEvent,
  canCreateThemeToday,
} from "@/lib/theme-api";
import type { EventResponse } from "@/lib/theme-api";
import { isAdmin, canCreateThemes } from "@/types/user";

export default function HomePage() {
  const { isLoggedIn, user, logout, initializeAuth, isLoading, startLogin } =
    useAuthStore();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [submittedTheme, setSubmittedTheme] = useState<Theme | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventResponse | null>(null);
  const [canCreateToday, setCanCreateToday] = useState(true);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  const [twitterEmbedWidth, setTwitterEmbedWidth] = useState(550);

  // Google Analytics 페이지뷰 추적
  useAnalytics();

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

  // 로그인 상태가 변경되면 내 테마 목록과 생성 가능 여부 조회
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchMyThemes();
      checkCanCreateToday();
    } else {
      setThemes([]);
      setCanCreateToday(true);
    }
  }, [isLoggedIn, user]);

  // 트위터 임베드 반응형 너비 계산
  useEffect(() => {
    const calculateTwitterWidth = () => {
      if (typeof window !== "undefined") {
        const screenWidth = window.innerWidth;
        if (screenWidth < 576) {
          // 모바일: 화면 너비에서 여백 40px 제외, 최대 500px
          setTwitterEmbedWidth(Math.min(screenWidth - 40, 500));
        } else {
          // 데스크톱: 고정 550px
          setTwitterEmbedWidth(550);
        }
      }
    };

    calculateTwitterWidth();
    window.addEventListener("resize", calculateTwitterWidth);

    return () => window.removeEventListener("resize", calculateTwitterWidth);
  }, []);

  const fetchMyThemes = async () => {
    if (!isLoggedIn) return;

    setIsLoadingThemes(true);
    try {
      const myThemes = await getMyThemes();
      setThemes(myThemes);
    } catch (error) {
      console.error("Failed to fetch my themes:", error);
    } finally {
      setIsLoadingThemes(false);
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

  const handleLogin = async () => {
    try {
      // 실제 트위터 OAuth 로그인
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

  const handleSubmitTheme = async (content: string) => {
    if (!user || !activeEvent) return;

    try {
      // 제목은 내용의 첫 30자로 설정
      const title =
        content.length > 30 ? content.substring(0, 30) + "..." : content;

      const newTheme = await createTheme(title, content, activeEvent.id);

      // 즉시 추가하지 말고 API를 다시 호출해서 최신 데이터 가져오기
      await fetchMyThemes();

      setSubmittedTheme(newTheme);
      setIsModalOpen(false);
      setIsFinishModalOpen(true);

      // 생성 가능 여부 다시 확인 - await로 완료 보장
      await checkCanCreateToday();
    } catch (error) {
      console.error("Failed to submit theme:", error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  const handleShare = (theme: Theme) => {
    const twitterUrl = getTwitterShareUrl(theme, activeEvent?.title);

    // Google Analytics 이벤트 추적
    trackThemeShare(theme.id, "twitter");

    window.open(twitterUrl, "_blank");
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

  // 관리자용 빠른 이벤트 생성
  const handleQuickCreateEvent = () => {
    const title = prompt("이벤트 제목을 입력하세요:");
    if (!title) return;

    const description = prompt("이벤트 설명을 입력하세요:");
    if (!description) return;

    const startDate = prompt("시작일을 입력하세요 (YYYY-MM-DD):");
    if (!startDate) return;

    const endDate = prompt("종료일을 입력하세요 (YYYY-MM-DD):");
    if (!endDate) return;

    // 간단한 날짜 검증
    if (new Date(startDate) >= new Date(endDate)) {
      alert("종료일은 시작일보다 나중이어야 합니다.");
      return;
    }

    // 관리자 페이지로 이동하면서 데이터 전달 (날짜에 시간 추가)
    const eventData = {
      title,
      description,
      startDate: startDate + "T00:00:00", // 시작일은 00:00:00
      endDate: endDate + "T23:59:59", // 종료일은 23:59:59
      maxThemes: 100,
      isPublic: true,
    };

    // 세션스토리지에 임시 저장
    sessionStorage.setItem("quickCreateEvent", JSON.stringify(eventData));
    window.location.href = "/admin";
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
        {isLoggedIn && user && (
          <>
            <SectionTitle>
              {activeEvent
                ? `이번 ${activeEvent.title}에 신청한 테마`
                : "신청한 테마"}
            </SectionTitle>
            <SectionDescription>
              이번에 신청하신 테마 목록이에요!!
            </SectionDescription>
            <div>
              {isLoadingThemes ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  테마 목록을 불러오는 중...
                </div>
              ) : themes.length > 0 ? (
                themes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isOwn={true}
                    onShare={handleShare}
                  />
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "12px",
                    border: "2px dashed #dee2e6",
                    margin: "2rem 0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "4rem",
                      marginBottom: "1rem",
                      opacity: 0.3,
                    }}
                  >
                    🎵
                  </div>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "600",
                      color: "#495057",
                      marginBottom: "0.5rem",
                    }}
                  >
                    아직 신청한 테마가 없습니다
                  </h3>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "#6c757d",
                      marginBottom: "2rem",
                      lineHeight: "1.6",
                    }}
                  >
                    첫 번째 테마를 신청해서
                    <br />
                    이번 오타쿠 붐박스 테마 신청에 참여해보세요!
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      fontSize: "0.9rem",
                      color: "#868e96",
                    }}
                  >
                    <span>💡 비슷한 테마가 많을수록 채택 확률이 높아져요</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!isLoggedIn && (
          <>
            {/* 1. 붐박스 설명 카드 */}
            <div
              style={{
                padding: "2.5rem 2rem",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                margin: "2rem 0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "1rem",
                }}
              >
                🎵
              </div>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#1f2937",
                  marginBottom: "1.5rem",
                }}
              >
                오타쿠 붐박스란?
              </h2>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "#4b5563",
                  lineHeight: "1.8",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                <strong>홀수달 첫째주 토요일</strong>{" "}
                <a
                  href="https://twitter.com/aroaro_hall"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#dc2626",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                  onMouseOver={(e) =>
                    ((e.target as HTMLAnchorElement).style.textDecoration =
                      "underline")
                  }
                  onMouseOut={(e) =>
                    ((e.target as HTMLAnchorElement).style.textDecoration =
                      "none")
                  }
                >
                  @aroaro_hall
                </a>
                에서 정기 개최중!
                <br />
                다양한 서브컬처 장르의 오타쿠 음악을 함께 즐기는{" "}
                <strong>A-POP 디제잉 파티</strong>입니다.
              </p>
            </div>

            {/* 2. 테마 설명 카드 */}
            <div
              style={{
                padding: "2.5rem 2rem",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                margin: "2rem 0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "1rem",
                }}
              >
                ✨
              </div>
              <h3
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "700",
                  color: "#1f2937",
                  marginBottom: "1.5rem",
                }}
              >
                오타쿠 붐박스 스페셜 테마
              </h3>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#6b7280",
                  marginBottom: "1.5rem",
                  lineHeight: "1.6",
                  textAlign: "center",
                }}
              >
                매 회차마다 붐박스에는 <strong>2개의 스페셜 테마</strong>가
                있습니다!
              </p>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  marginBottom: "2.5rem",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#475569",
                    lineHeight: "1.6",
                    textAlign: "center",
                  }}
                >
                  <div style={{ marginBottom: "0.8rem" }}>
                    <strong style={{ color: "#1e293b" }}>
                      🎵 스페셜 테마란?
                    </strong>
                  </div>
                  <div style={{ marginBottom: "0.5rem" }}>
                    매 회차마다 정해진 2개의 테마를 바탕으로<br></br> DJ들은
                    해당 테마에 맞게 더 비중 있게 선곡하게 됩니다
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      fontStyle: "italic",
                    }}
                  >
                    * DJ 마다 전체 비중의 약 10~33% 정도를 차지합니다
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ flex: "1", minWidth: "200px", maxWidth: "250px" }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#8b5cf6",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                      fontSize: "1.5rem",
                      color: "white",
                      fontWeight: "600",
                    }}
                  >
                    #1
                  </div>
                  <h4
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#8b5cf6",
                      marginBottom: "0.5rem",
                    }}
                  >
                    붐박스 DJ/VJ 선정
                  </h4>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#6b7280",
                      lineHeight: "1.4",
                    }}
                  >
                    스태프가 기획하고 선정한 테마
                  </p>
                </div>

                <div
                  style={{ flex: "1", minWidth: "200px", maxWidth: "250px" }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#059669",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                      fontSize: "1.5rem",
                      color: "white",
                      fontWeight: "600",
                    }}
                  >
                    #2
                  </div>
                  <h4
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#059669",
                      marginBottom: "0.5rem",
                    }}
                  >
                    오픈 테마 보드 선정
                  </h4>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#6b7280",
                      lineHeight: "1.4",
                    }}
                  >
                    오픈 테마 보드를 통해 직접 신청
                  </p>
                </div>
              </div>
            </div>

            {/* 3. 오픈테마 보드 참여 방법 카드 */}
            <div
              style={{
                padding: "2.5rem 2rem",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                margin: "2rem 0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "1rem",
                }}
              >
                🚀
              </div>
              <h3
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "700",
                  color: "#1f2937",
                  marginBottom: "1.5rem",
                }}
              >
                오픈 테마 보드 참여 방법
              </h3>

              <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                <div style={{ marginBottom: "2rem" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#ea580c",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 0.8rem",
                      fontSize: "1.2rem",
                      color: "white",
                      fontWeight: "600",
                    }}
                  >
                    1
                  </div>
                  <h4
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#ea580c",
                      marginBottom: "0.5rem",
                    }}
                  >
                    테마 신청 (하루 1회)
                  </h4>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "#4b5563",
                      lineHeight: "1.5",
                    }}
                  >
                    원하는 애니메이션, 게임, 컨텐츠 등
                    <br />
                    서브컬처 관련 테마를 신청하세요
                    <br />* 매일 한 번씩 신청 가능합니다!
                  </p>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#0284c7",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 0.8rem",
                      fontSize: "1.2rem",
                      color: "white",
                      fontWeight: "600",
                    }}
                  >
                    2
                  </div>
                  <h4
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#0284c7",
                      marginBottom: "0.5rem",
                    }}
                  >
                    커뮤니티 공유
                  </h4>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "#4b5563",
                      lineHeight: "1.5",
                    }}
                  >
                    트위터에 공유해서 더 많은 신청을 받으세요
                    <br />
                    비슷한 테마가 많을수록 채택 확률 UP!
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#059669",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 0.8rem",
                      fontSize: "1.2rem",
                      color: "white",
                      fontWeight: "600",
                    }}
                  >
                    3
                  </div>
                  <h4
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#059669",
                      marginBottom: "0.5rem",
                    }}
                  >
                    당일 행사 반영
                  </h4>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "#4b5563",
                      lineHeight: "1.5",
                    }}
                  >
                    채택된 테마로 당일 이벤트 디제잉!
                    <br />
                    매번 새로운 붐박스를 즐기세요
                  </p>
                </div>
              </div>
            </div>

            {/* 4. 로그인 유도 카드 - 비로그인 시 항상 표시 */}
            <div
              style={{
                padding: "2.5rem 2rem",
                backgroundColor: "#1f2937",
                borderRadius: "16px",
                border: "1px solid #374151",
                margin: "2rem 0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
                background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
              }}
            >
              <div
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "1rem",
                }}
              >
                🎯
              </div>
              <h3
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "700",
                  color: "#ffffff",
                  marginBottom: "1rem",
                }}
              >
                지금 바로 참여하세요!
              </h3>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#d1d5db",
                  marginBottom: "2rem",
                  lineHeight: "1.6",
                }}
              >
                트위터 로그인으로 간편하게 시작하고
                <br />
                <strong style={{ color: "#ffffff" }}>
                  {activeEvent
                    ? `이번 ${activeEvent.title}에 테마를 신청`
                    : "붐박스에 참여"}
                </strong>
                해보세요!
              </p>

              <Button
                variant="primary"
                onClick={handleLogin}
                style={{
                  backgroundColor: "#1d9bf0",
                  borderColor: "#1d9bf0",
                  fontSize: "1.1rem",
                  padding: "0.8rem 2rem",
                  boxShadow: "0 4px 12px rgba(29, 155, 240, 0.3)",
                }}
              >
                <Twitter size={20} style={{ marginRight: "0.5rem" }} />
                트위터(X)로 로그인하고 참여하기
              </Button>

              <div
                style={{
                  marginTop: "1.5rem",
                  fontSize: "0.9rem",
                  color: "#9ca3af",
                }}
              >
                💡 로그인하면 테마 신청, 공유, 내 신청 목록 확인이 가능해요
              </div>
            </div>
          </>
        )}

        {isLoggedIn && !activeEvent && (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              margin: "2rem 0",
            }}
          >
            <div
              style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.5 }}
            >
              🎵
            </div>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: "1rem",
              }}
            >
              현재 진행 중인 이벤트가 없습니다
            </h3>
            <p style={{ fontSize: "1rem", color: "#9ca3af" }}>
              새로운 테마 신청 이벤트를 기다려주세요!
            </p>
          </div>
        )}

        {/* 붐박스 계정 임베드 - 비로그인 시에만 표시 */}
        {!isLoggedIn && (
          <div
            style={{
              width: "100%",
              maxWidth: "550px",
              margin: "2rem auto 0",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "0.5rem",
                }}
              >
                🎵
              </div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "0.3rem",
                }}
              >
                오타쿠 붐박스 공식 계정
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                최신 소식과 이벤트 정보를 확인하세요
              </p>
            </div>
            <TwitterTweetEmbed
              tweetId="1930550203633086657"
              placeholder={
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "0.8rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      border: "3px solid #e3e3e3",
                      borderTop: "3px solid #1da1f2",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.85rem",
                      margin: 0,
                    }}
                  >
                    트윗 로딩 중...
                  </p>
                  <style jsx>{`
                    @keyframes spin {
                      0% {
                        transform: rotate(0deg);
                      }
                      100% {
                        transform: rotate(360deg);
                      }
                    }
                  `}</style>
                </div>
              }
            />
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "1rem 0",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {isLoggedIn && (
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
          )}

          <Button
            variant="neutral"
            onClick={() => (window.location.href = "/themes")}
          >
            모든 신청 리스트 보기
          </Button>

          {/* 관리자 전용 버튼 추가 */}
          {isLoggedIn && isAdmin(user) && (
            <>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/admin")}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "1px solid #dc3545",
                }}
              >
                🔧 관리자 패널
              </Button>
            </>
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
        user={user}
        eventTitle={activeEvent?.title}
      />
    </Container>
  );
}

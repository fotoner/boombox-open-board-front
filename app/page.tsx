"use client"

import { useState } from "react"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Twitter, Plus, Share2, Clock, LogOut } from "lucide-react"
import ThemeSubmitModal from "@/components/theme-submit-modal"
import type { Theme } from "@/types/theme"
import FinishModal from "@/components/finish-modal"
import { useAuthStore, mockLogin } from "@/store/auth-store"
import { useAnalytics } from "@/hooks/use-analytics"
import { trackLogin, trackLogout, trackThemeShare, trackModalOpen } from "@/lib/gtag"

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%);
`

const HeroSection = styled.div`
  background: linear-gradient(90deg, #9333ea 0%, #ec4899 100%);
  color: white;
`

const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1rem;
`

const HeroContent = styled.div`
  text-align: center;
  max-width: 64rem;
  margin: 0 auto;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    font-size: 3.75rem;
  }
`

const Subtitle = styled.span`
  color: #fde047;
`

const Description = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`

const Button = styled.button<{ variant?: "primary" | "secondary" | "outline" | "ghost" }>`
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  ${(props) =>
    props.variant === "primary" &&
    css`
    background-color: #3b82f6;
    color: white;
    &:hover {
      background-color: #2563eb;
    }
  `}
  
  ${(props) =>
    props.variant === "secondary" &&
    css`
    background-color: #eab308;
    color: black;
    font-weight: bold;
    &:hover {
      background-color: #ca8a04;
    }
  `}
  
  ${(props) =>
    props.variant === "outline" &&
    css`
    background-color: transparent;
    color: #3b82f6;
    border: 1px solid #3b82f6;
    &:hover {
      background-color: #eff6ff;
    }
  `}

  ${(props) =>
    props.variant === "ghost" &&
    css`
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const UserSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const Avatar = styled.img`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
`

const UserDetails = styled.div`
  text-align: left;
`

const UserNickname = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
`

const UserId = styled.div`
  font-size: 0.75rem;
  opacity: 0.8;
`

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem;
`

const SectionTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  color: #374151;
`

const ThemeCard = styled.div<{ isOwn?: boolean }>`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  border: ${(props) => (props.isOwn ? "2px solid #9333ea" : "1px solid #e5e7eb")};
  background-color: ${(props) => (props.isOwn ? "#faf5ff" : "white")};
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const AuthorDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`

const AuthorNickname = styled.span`
  font-weight: 600;
  color: #9333ea;
  font-size: 0.875rem;
`

const AuthorId = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`

const Badge = styled.span`
  background-color: #e0e7ff;
  color: #6366f1;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
`

const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
`

const ThemeContent = styled.p`
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: #374151;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;
  font-size: 1.125rem;
`

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
]

export default function HomePage() {
  const { isLoggedIn, user, logout } = useAuthStore()
  const [themes, setThemes] = useState<Theme[]>(mockThemes)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false)
  const [submittedTheme, setSubmittedTheme] = useState<Theme | null>(null)

  // Google Analytics 페이지뷰 추적
  useAnalytics()

  const handleLogin = () => {
    mockLogin()
    trackLogin("twitter")
  }

  const handleLogout = () => {
    logout()
    trackLogout()
  }

  const handleSubmitTheme = (content: string) => {
    if (!user) return

    const newTheme: Theme = {
      id: Date.now().toString(),
      content,
      author: user.id,
      authorNickname: user.nickname,
      createdAt: new Date(),
      createdByMe: true,
    }
    setThemes([newTheme, ...themes])
    setSubmittedTheme(newTheme)
    setIsModalOpen(false)
    setIsFinishModalOpen(true)
  }

  const handleShare = (theme: Theme) => {
    const shareUrl = `${window.location.origin}/share/${theme.id}`
    const tweetText = `오타쿠붐박스 테마 제안: "${theme.content}" - ${theme.authorNickname || theme.author}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`

    // Google Analytics 이벤트 추적
    trackThemeShare(theme.id, "twitter")

    window.open(twitterUrl, "_blank")
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
    trackModalOpen("theme_submit")
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Container>
      {/* Hero Section */}
      <HeroSection>
        <HeroContainer>
          <HeroContent>
            <Title>
              오타쿠붐박스
              <br />
              <Subtitle>오픈 테마 보드</Subtitle>
            </Title>
            <Description>
              오타쿠붐박스 오픈 테마 보드는, 참가자들이 행사 주제를 제안하고 트위터(X)를 통해 확산시키는 커뮤니티
              보드입니다.
            </Description>

            {!isLoggedIn ? (
              <Button variant="primary" onClick={handleLogin}>
                <Twitter size={20} style={{ marginRight: "0.5rem" }} />
                트위터(X)로 로그인
              </Button>
            ) : (
              <>
                <UserSection>
                  <UserInfo>
                    <Avatar src={user?.avatar} alt={user?.nickname} />
                    <UserDetails>
                      <UserNickname>{user?.nickname}</UserNickname>
                      <UserId>{user?.id}</UserId>
                    </UserDetails>
                  </UserInfo>
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut size={16} style={{ marginRight: "0.5rem" }} />
                    로그아웃
                  </Button>
                </UserSection>
                <Button variant="secondary" onClick={handleOpenModal}>
                  <Plus size={20} style={{ marginRight: "0.5rem" }} />
                  테마 제안하기
                </Button>
              </>
            )}
          </HeroContent>
        </HeroContainer>
      </HeroSection>

      {/* Theme List Section */}
      <MainContent>
        <SectionTitle>제안된 테마들</SectionTitle>

        <div>
          {themes.map((theme) => {
            const isOwn = user && theme.author === user.id
            return (
              <ThemeCard key={theme.id} isOwn={isOwn}>
                <CardHeader>
                  <AuthorInfo>
                    <AuthorDetails>
                      <AuthorNickname>{theme.authorNickname || "익명"}</AuthorNickname>
                      <AuthorId>{theme.author}</AuthorId>
                    </AuthorDetails>
                    {isOwn && <Badge>내 제안</Badge>}
                  </AuthorInfo>
                  <TimeInfo>
                    <Clock size={16} style={{ marginRight: "0.25rem" }} />
                    {formatDate(theme.createdAt)}
                  </TimeInfo>
                </CardHeader>

                <ThemeContent>{theme.content}</ThemeContent>

                {isOwn && (
                  <Button variant="outline" onClick={() => handleShare(theme)}>
                    <Share2 size={16} style={{ marginRight: "0.5rem" }} />
                    트위터(X)에 공유하기
                  </Button>
                )}
              </ThemeCard>
            )
          })}
        </div>

        {themes.length === 0 && <EmptyState>아직 제안된 테마가 없습니다. 첫 번째 테마를 제안해보세요!</EmptyState>}
      </MainContent>

      {/* Theme Submit Modal */}
      <ThemeSubmitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmitTheme} />

      {/* Finish Modal */}
      <FinishModal isOpen={isFinishModalOpen} onClose={() => setIsFinishModalOpen(false)} theme={submittedTheme} />
    </Container>
  )
}

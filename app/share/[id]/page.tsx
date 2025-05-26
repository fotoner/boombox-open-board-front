import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Clock, Twitter } from "lucide-react"
import type { Metadata } from "next"
import type { Theme } from "@/types/theme"

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%);
`

const Header = styled.div`
  background: linear-gradient(90deg, #9333ea 0%, #ec4899 100%);
  color: white;
  padding: 2rem 0;
`

const HeaderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
`

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  
  @media (min-width: 768px) {
    font-size: 1.875rem;
  }
`

const HeaderSubtitle = styled.p`
  opacity: 0.9;
`

const MainContent = styled.div`
  max-width: 48rem;
  margin: 0 auto;
  padding: 3rem 1rem;
`

const ThemeCard = styled.div`
  background: white;
  border: 2px solid #e0e7ff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`

const CardHeader = styled.div`
  background-color: #faf5ff;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  color: #7c3aed;
  font-size: 0.875rem;
`

const AuthorId = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`

const Badge = styled.span`
  background-color: #e0e7ff;
  color: #7c3aed;
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

const CardContent = styled.div`
  padding: 2rem;
`

const ThemeQuote = styled.blockquote`
  font-size: 1.25rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.6;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`

const CallToAction = styled.div`
  margin-top: 2rem;
  text-align: center;
`

const CTAText = styled.p`
  color: #6b7280;
  margin-bottom: 1rem;
`

const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: #7c3aed;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #6d28d9;
  }
`

const ErrorCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  max-width: 28rem;
  margin: 0 auto;
`

const ErrorTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #374151;
  margin-bottom: 1rem;
`

const ErrorText = styled.p`
  color: #6b7280;
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

interface SharePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const theme = mockThemes.find((t) => t.id === params.id)

  if (!theme) {
    return {
      title: "테마를 찾을 수 없습니다 - 오타쿠붐박스",
      description: "요청하신 테마를 찾을 수 없습니다.",
    }
  }

  const title = `"${theme.content}" - 오타쿠붐박스 테마 제안`
  const description = `${theme.authorNickname || theme.author}님이 제안한 오타쿠붐박스 테마: ${theme.content}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ["/placeholder.svg?height=630&width=1200"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/placeholder.svg?height=630&width=1200"],
    },
  }
}

export default function SharePage({ params }: SharePageProps) {
  const theme = mockThemes.find((t) => t.id === params.id)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (!theme) {
    return (
      <Container
        css={css`
        display: flex;
        align-items: center;
        justify-content: center;
      `}
      >
        <ErrorCard>
          <ErrorTitle>테마를 찾을 수 없습니다</ErrorTitle>
          <ErrorText>요청하신 테마가 존재하지 않거나 삭제되었습니다.</ErrorText>
        </ErrorCard>
      </Container>
    )
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderContainer>
          <HeaderTitle>오타쿠붐박스 테마 제안</HeaderTitle>
          <HeaderSubtitle>커뮤니티에서 제안된 테마를 확인해보세요</HeaderSubtitle>
        </HeaderContainer>
      </Header>

      {/* Theme Content */}
      <MainContent>
        <ThemeCard>
          <CardHeader>
            <AuthorInfo>
              <Twitter size={20} color="#3b82f6" />
              <AuthorDetails>
                <AuthorNickname>{theme.authorNickname || "익명"}</AuthorNickname>
                <AuthorId>{theme.author}</AuthorId>
              </AuthorDetails>
              <Badge>테마 제안</Badge>
            </AuthorInfo>
            <TimeInfo>
              <Clock size={16} style={{ marginRight: "0.25rem" }} />
              {formatDate(theme.createdAt)}
            </TimeInfo>
          </CardHeader>
          <CardContent>
            <ThemeQuote>"{theme.content}"</ThemeQuote>
          </CardContent>
        </ThemeCard>

        {/* Call to Action */}
        <CallToAction>
          <CTAText>이 테마가 마음에 드시나요? 오타쿠붐박스에서 더 많은 테마를 확인해보세요!</CTAText>
          <CTAButton href="/">오타쿠붐박스 메인으로 가기</CTAButton>
        </CallToAction>
      </MainContent>
    </Container>
  )
}

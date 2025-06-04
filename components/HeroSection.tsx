import { Twitter, Plus, LogOut } from "lucide-react";
import {
  HeroSection as StyledHeroSection,
  HeroContainer,
  HeroContent,
  Title,
  Subtitle,
  Description,
  Button,
  UserSection,
} from "@/app/styles/main.styles";
import { User, canCreateThemes } from "@/types/user";

interface HeroSectionProps {
  isLoggedIn: boolean;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenModal: () => void;
  variant?: "default" | "compact";
  canCreateToday?: boolean;
  activeEvent?: { canSubmitTheme?: boolean } | null;
}

export default function HeroSection({
  isLoggedIn,
  user,
  onLogin,
  onLogout,
  onOpenModal,
  variant = "default",
  canCreateToday = true,
  activeEvent = null,
}: HeroSectionProps) {
  const isButtonDisabled =
    isLoggedIn &&
    (!canCreateThemes(user) || !canCreateToday || !activeEvent?.canSubmitTheme);

  const getButtonText = () => {
    if (!canCreateThemes(user)) return "테마 신청 권한 없음";
    if (!canCreateToday) return "오늘은 이미 작성함";
    if (!activeEvent?.canSubmitTheme) return "테마 신청 기간 아님";
    return "테마 신청하기";
  };

  if (variant === "compact") {
    return (
      <UserSection>
        {!isLoggedIn ? (
          <Button variant="primary" onClick={onLogin}>
            <Twitter size={20} style={{ marginRight: "0.5rem" }} />
            트위터(X)로 로그인
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={onOpenModal}
              disabled={isButtonDisabled}
            >
              <Plus size={20} style={{ marginRight: "0.5rem" }} />
              {getButtonText()}
            </Button>
            <Button variant="neutral" onClick={onLogout}>
              <LogOut size={20} style={{ marginRight: "0.5rem" }} />
              로그아웃
            </Button>
          </>
        )}
      </UserSection>
    );
  }

  return (
    <StyledHeroSection>
      <HeroContainer>
        <HeroContent>
          <Title>
            오타쿠 붐박스
            <br />
            <Subtitle>오픈 테마 보드</Subtitle>
          </Title>
          <Description>
            원하는 테마가 있다면, 지금 바로 신청해보세요!
            <br />
            여러분의 아이디어가 실제 행사 테마로 이어집니다.
          </Description>

          {!isLoggedIn ? (
            <Button variant="primary" onClick={onLogin}>
              <Twitter size={20} style={{ marginRight: "0.5rem" }} />
              트위터(X)로 로그인
            </Button>
          ) : (
            <UserSection>
              <Button
                variant="secondary"
                onClick={onOpenModal}
                disabled={isButtonDisabled}
              >
                <Plus size={20} style={{ marginRight: "0.5rem" }} />
                {getButtonText()}
              </Button>
              <Button variant="neutral" onClick={onLogout}>
                <LogOut size={20} style={{ marginRight: "0.5rem" }} />
                로그아웃
              </Button>
            </UserSection>
          )}
        </HeroContent>
      </HeroContainer>
    </StyledHeroSection>
  );
}

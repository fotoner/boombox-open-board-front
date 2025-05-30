import { Clock, Share2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ThemeCard as StyledThemeCard,
  CardHeader,
  AuthorInfo,
  AuthorDetails,
  AuthorNickname,
  AuthorId,
  Badge,
  TimeInfo,
  ThemeContent,
  Button,
  CardFooter,
} from "@/app/styles/main.styles";
import type { Theme } from "@/types/theme";

interface ThemeCardProps {
  theme: Theme;
  isOwn: boolean;
  onShare: (theme: Theme) => void;
}

export default function ThemeCard({ theme, isOwn, onShare }: ThemeCardProps) {
  const isMobile = useIsMobile();
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <StyledThemeCard isOwn={isOwn}>
      <CardHeader>
        <AuthorInfo>
          <AuthorDetails>
            <AuthorNickname>{theme.authorNickname || "익명"}</AuthorNickname>
            <AuthorId>{theme.author}</AuthorId>
          </AuthorDetails>
          {isOwn && <Badge>내 신청</Badge>}
        </AuthorInfo>
      </CardHeader>

      <ThemeContent>"{theme.content}"</ThemeContent>

      <CardFooter>
        <TimeInfo>
          <Clock size={16} style={{ marginRight: "0.25rem" }} />
          {formatDate(theme.createdAt)}
        </TimeInfo>
        {isOwn && (
          <Button
            variant="outline"
            onClick={() => onShare(theme)}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            <Share2 size={20} style={{ marginRight: "0.5rem" }} />
            트위터(X)에 공유하기
          </Button>
        )}
      </CardFooter>
    </StyledThemeCard>
  );
}

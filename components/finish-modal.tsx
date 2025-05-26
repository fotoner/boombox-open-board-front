"use client";

import type React from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Twitter, X, CheckCircle, Share2 } from "lucide-react";
import type { Theme } from "@/types/theme";
import { trackThemeShare, trackModalClose } from "@/lib/gtag";

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  width: 100%;
  max-width: 32rem;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #6b7280;

  &:hover {
    color: #374151;
  }
`;

const SuccessIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  color: white;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const ThemePreview = styled.div`
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
  border: 2px solid #e0e7ff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const ThemeContent = styled.p`
  font-size: 1.125rem;
  font-weight: 500;
  color: #7c3aed;
  margin-bottom: 0.5rem;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  align-items: center;
`;

const AuthorNickname = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const AuthorId = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.variant === "primary" &&
    css`
      background: linear-gradient(135deg, #1da1f2, #0d8bd9);
      color: white;
      &:hover {
        background: linear-gradient(135deg, #0d8bd9, #0a7bc4);
        transform: translateY(-1px);
      }
    `}

  ${(props) =>
    props.variant === "secondary" &&
    css`
      background-color: #f9fafb;
      color: #374151;
      border: 1px solid #e5e7eb;
      &:hover {
        background-color: #f3f4f6;
      }
    `}
`;

const ShareInfo = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
`;

const ShareInfoTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const ShareInfoText = styled.p`
  font-size: 0.75rem;
  color: #1e40af;
  line-height: 1.4;
`;

interface FinishModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme | null;
}

export default function FinishModal({
  isOpen,
  onClose,
  theme,
}: FinishModalProps) {
  const handleShare = () => {
    if (!theme) return;

    const shareUrl = `${window.location.origin}/share/${theme.id}`;
    const tweetText = `오타쿠붐박스 테마 제안: "${theme.content}" - ${
      theme.authorNickname || theme.author
    }`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&url=${encodeURIComponent(shareUrl)}`;

    // Google Analytics 이벤트 추적
    trackThemeShare(theme.id, "twitter");

    window.open(twitterUrl, "_blank");
  };

  const handleClose = () => {
    trackModalClose("finish");
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!theme) return null;

  return (
    <Overlay isOpen={isOpen} onClick={handleOverlayClick}>
      <Modal>
        <ModalHeader>
          <div /> {/* Spacer */}
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <SuccessIcon>
          <CheckCircle size={32} />
        </SuccessIcon>

        <Title>테마 제안 완료!</Title>
        <Subtitle>
          새로운 테마가 성공적으로 등록되었습니다.
          <br />
          트위터에 공유해서 더 많은 사람들과 함께해보세요!
        </Subtitle>

        <ThemePreview>
          <ThemeContent>"{theme.content}"</ThemeContent>
          <AuthorInfo>
            <AuthorNickname>
              제안자: {theme.authorNickname || "익명"}
            </AuthorNickname>
            <AuthorId>{theme.author}</AuthorId>
          </AuthorInfo>
        </ThemePreview>

        <ShareInfo>
          <ShareInfoTitle>
            <Share2 size={16} style={{ marginRight: "0.5rem" }} />
            공유 혜택
          </ShareInfoTitle>
          <ShareInfoText>
            • 트위터 공유 시 고유한 링크가 생성됩니다
            <br />• 더 많은 사람들이 당신의 테마를 볼 수 있습니다
            <br />• 오타쿠붐박스 커뮤니티 확산에 기여할 수 있습니다
          </ShareInfoText>
        </ShareInfo>

        <ButtonGroup>
          <Button variant="primary" onClick={handleShare}>
            <Twitter size={18} style={{ marginRight: "0.5rem" }} />
            트위터에 공유하기
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            나중에 공유하기
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}

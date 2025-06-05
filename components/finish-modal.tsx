"use client";

import type React from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Twitter, X, CheckCircle, Share2 } from "lucide-react";
import type { Theme } from "@/types/theme";
import { trackThemeShare, trackModalClose } from "@/lib/gtag";
import { getTwitterShareUrl } from "@/app/utils/share";
import { User } from "@/types/user";

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
  font-size: 1.5rem;
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
  user?: User | null;
  eventTitle?: string;
}

export default function FinishModal({
  isOpen,
  onClose,
  theme,
  user,
  eventTitle,
}: FinishModalProps) {
  const handleShare = () => {
    if (!theme) return;

    const twitterUrl = getTwitterShareUrl(theme, eventTitle);

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

  const displayName = user?.nickname || theme?.authorNickname || "익명";
  const username = user?.id || theme?.author || "";

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

        <Title>테마 신청 완료!</Title>
        <Subtitle>
          {displayName}님의 테마가 성공적으로 신청되었습니다.
          <br />
          트위터에 공유해서 더 많은 사람들과 함께해보세요!
        </Subtitle>

        <ThemePreview>
          <ThemeContent>"{theme.content}"</ThemeContent>
          <AuthorInfo>
            <AuthorNickname>{displayName}</AuthorNickname>
            <AuthorId>{username}</AuthorId>
          </AuthorInfo>
        </ThemePreview>

        <ShareInfo>
          <ShareInfoTitle>
            <Share2 size={16} style={{ marginRight: "0.5rem" }} />
            트위터(X) 공유를 하면 좋은 점!
          </ShareInfoTitle>
          <ShareInfoText>
            • 더 많은 사람들이 나만의 테마를 볼 수 있습니다!
            <br />• 테마를 공유해 같은 테마 신청을 독려해보세요!!
            <br />• 공유 이벤트에 당첨될지도...?
          </ShareInfoText>
        </ShareInfo>

        <ButtonGroup>
          <Button variant="primary" onClick={handleShare}>
            <Twitter size={18} style={{ marginRight: "0.5rem" }} />
            트위터(X)에 공유하기
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            나중에 공유하기
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}

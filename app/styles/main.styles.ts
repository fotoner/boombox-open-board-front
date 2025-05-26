import { css } from "@emotion/react";
import styled from "@emotion/styled";

export const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%);
`;

export const HeroSection = styled.div`
  background: linear-gradient(90deg, #9333ea 0%, #ec4899 100%);
  color: white;
`;

export const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1rem;
`;

export const HeroContent = styled.div`
  text-align: center;
  max-width: 64rem;
  margin: 0 auto;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;

  @media (min-width: 550px) {
    font-size: 3.75rem;
  }
`;

export const Subtitle = styled.span`
  color: #fde047;
`;

export const Description = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;

  @media (min-width: 550px) {
    font-size: 1.5rem;
  }
`;

export const Button = styled.button<{
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "neutral";
}>`
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  width: auto;

  @media (max-width: 550px) {
    width: 100%;
  }

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
    props.variant === "danger" &&
    css`
      background-color: #ef4444;
      color: white;
      &:hover {
        background-color: #b91c1c;
      }
    `}

  ${(props) =>
    props.variant === "neutral" &&
    css`
      background-color: #e5e7eb;
      color: #374151;
      &:hover {
        background-color: #d1d5db;
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
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const Avatar = styled.img`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

export const UserDetails = styled.div`
  text-align: left;
`;

export const UserNickname = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
`;

export const UserId = styled.div`
  font-size: 0.75rem;
  opacity: 0.8;
`;

export const MainContent = styled.div`
  max-width: 550px;
  margin: 0 auto;
  padding: 3rem 1rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
  color: #374151;
`;

export const ThemeCard = styled.div<{ isOwn?: boolean }>`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  border: ${(props) =>
    props.isOwn ? "2px solid #9333ea" : "1px solid #e5e7eb"};
  background-color: white;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

export const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const AuthorDetails = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 0.125rem;
`;

export const AuthorNickname = styled.span`
  font-weight: 600;
  color: #9333ea;
  font-size: 1rem;
  margin-right: 0.25rem;
`;

export const AuthorId = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`;

export const Badge = styled.span`
  background-color: #e0e7ff;
  color: #6366f1;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
`;

export const ThemeContent = styled.p`
  font-size: 1.5rem;
  min-height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 1rem;
  color: #374151;
  font-weight: 600;
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 1rem;
  gap: 1rem;
  flex-wrap: wrap;

  align-items: stretch;
  justify-content: space-between;
  flex-direction: column-reverse;
`;

export const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin-left: 0;

  justify-content: flex-end;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;
  font-size: 1.125rem;
`;

export const SectionDescription = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  text-align: center;
`;

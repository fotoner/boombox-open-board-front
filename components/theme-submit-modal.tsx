"use client"

import type React from "react"

import { useState } from "react"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Send, X } from "lucide-react"
import { trackThemeSubmit, trackModalClose } from "@/lib/gtag"

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
`

const Modal = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #7c3aed;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #6b7280;
  
  &:hover {
    color: #374151;
  }
`

const FormGroup = styled.div`
  margin-bottom: 1rem;
`

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
`

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`

const CharCount = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
`

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  ${(props) =>
    props.variant === "primary" &&
    css`
    background-color: #7c3aed;
    color: white;
    &:hover:not(:disabled) {
      background-color: #6d28d9;
    }
  `}
  
  ${(props) =>
    props.variant === "secondary" &&
    css`
    background-color: transparent;
    color: #374151;
    border: 1px solid #d1d5db;
    &:hover {
      background-color: #f9fafb;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

interface ThemeSubmitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (content: string) => void
}

export default function ThemeSubmitModal({ isOpen, onClose, onSubmit }: ThemeSubmitModalProps) {
  const [content, setContent] = useState("")

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim())
      trackThemeSubmit(content.trim())
      setContent("")
    }
  }

  const handleClose = () => {
    setContent("")
    trackModalClose("theme_submit")
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <Overlay isOpen={isOpen} onClick={handleOverlayClick}>
      <Modal>
        <ModalHeader>
          <ModalTitle>새 테마 제안하기</ModalTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <FormGroup>
          <Label htmlFor="theme-content">테마 내용</Label>
          <Textarea
            id="theme-content"
            placeholder="예: 90년대 애니메이션 OST 특집, 스튜디오 지브리 명곡 모음 등..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={200}
          />
          <CharCount>{content.length}/200자</CharCount>
        </FormGroup>

        <ButtonGroup>
          <Button variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!content.trim()}>
            <Send size={16} style={{ marginRight: "0.5rem" }} />
            제안하기
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  )
}

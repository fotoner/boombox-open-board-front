"use client";

import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Clock, Twitter } from "lucide-react";
import type { Theme } from "@/types/theme";

interface SharePageClientProps {
  theme: Theme | undefined;
}

export default function SharePageClient({ theme }: SharePageClientProps) {
  if (!theme) {
    return <div>테마를 찾을 수 없습니다.</div>;
  }

  return (
    <div>
      <h1>{theme.content}</h1>
      <div>
        <p>작성자: {theme.authorNickname || theme.author}</p>
        <p>작성일: {theme.createdAt.toLocaleDateString()}</p>
      </div>
    </div>
  );
}

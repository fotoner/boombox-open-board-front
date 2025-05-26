export interface Theme {
  id: string;
  content: string;
  author: string; // 소셜 아이디
  authorNickname?: string; // 표시용 닉네임
  createdAt: Date;
  createdByMe: boolean;
}

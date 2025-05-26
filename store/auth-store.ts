import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types/user"

interface AuthState {
  isLoggedIn: boolean
  user: User | null
  login: (user: User) => void
  logout: () => void
}

// 목업 유저 데이터
const mockUsers: User[] = [
  {
    id: "@otaku_master",
    nickname: "오타쿠마스터",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "@anime_lover_2024",
    nickname: "애니러버",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "@ghibli_dreamer",
    nickname: "지브리꿈나무",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      login: (user: User) => {
        set({ isLoggedIn: true, user })
      },
      logout: () => {
        set({ isLoggedIn: false, user: null })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

// 목업 로그인 함수 (실제로는 트위터 OAuth 처리)
export const mockLogin = () => {
  const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)]
  useAuthStore.getState().login(randomUser)
}

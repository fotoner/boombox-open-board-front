"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { extractAuthCodeFromUrl, clearOAuthParams } from "@/lib/twitter-oauth";

export default function LoginRedirectPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("로그인 처리 중...");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // URL에서 인증 코드 추출
        const { code, error } = extractAuthCodeFromUrl();

        if (error) {
          throw new Error(`OAuth 오류: ${error}`);
        }

        if (!code) {
          throw new Error("인증 코드가 없습니다.");
        }

        // sessionStorage에서 codeVerifier 가져오기
        const codeVerifier = sessionStorage.getItem("oauth_code_verifier");
        if (!codeVerifier) {
          throw new Error("Code Verifier가 없습니다. PKCE 플로우 오류입니다.");
        }

        console.log("🔐 OAuth 콜백 처리:", {
          code: code.substring(0, 10) + "...",
          codeVerifier: codeVerifier.substring(0, 10) + "...",
        });

        setMessage("백엔드 서버에 로그인 요청 중...");

        // 백엔드로 인증 코드와 codeVerifier 전송 (PKCE 플로우)
        // Authorization Code + PKCE로 충분한 보안 제공
        await login(code, codeVerifier);

        setStatus("success");
        setMessage("로그인 성공! 메인 페이지로 이동합니다...");

        // OAuth 파라미터 정리
        clearOAuthParams();

        // 메인 페이지로 리다이렉트
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (error) {
        console.error("로그인 처리 실패:", error);
        setStatus("error");
        const errorMessage =
          error instanceof Error
            ? error.message
            : "로그인 중 오류가 발생했습니다.";
        setMessage(errorMessage);

        // OAuth 파라미터 정리
        clearOAuthParams();

        // 5초 후 메인 페이지로 리다이렉트
        setTimeout(() => {
          router.push("/");
        }, 5000);
      }
    };

    // URL이 로드된 후 콜백 처리
    if (typeof window !== "undefined") {
      handleOAuthCallback();
    }
  }, [login, router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          padding: "2rem",
          borderRadius: "8px",
          backgroundColor: "#f8f9fa",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        {status === "loading" && (
          <>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #e3e3e3",
                borderTop: "4px solid #1da1f2",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem",
              }}
            />
            <style jsx>{`
              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </>
        )}

        {status === "success" && (
          <div
            style={{ color: "#28a745", fontSize: "2rem", marginBottom: "1rem" }}
          >
            ✅
          </div>
        )}

        {status === "error" && (
          <div
            style={{ color: "#dc3545", fontSize: "2rem", marginBottom: "1rem" }}
          >
            ❌
          </div>
        )}

        <h2
          style={{
            margin: "0 0 1rem 0",
            color:
              status === "error"
                ? "#dc3545"
                : status === "success"
                ? "#28a745"
                : "#333",
          }}
        >
          {status === "loading"
            ? "로그인 처리 중"
            : status === "success"
            ? "로그인 성공"
            : "로그인 실패"}
        </h2>

        <p style={{ margin: "0", color: "#666" }}>{message}</p>

        {status === "error" && (
          <button
            onClick={() => router.push("/")}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#1da1f2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            메인 페이지로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
}

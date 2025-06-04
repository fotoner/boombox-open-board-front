# Boombox Open Board Front

부야부야 테마 신청 게시판 프론트엔드

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# API 설정
NEXT_PUBLIC_API_URL=http://localhost:8080

# 개발 환경에서만 사용 (선택사항)
NODE_ENV=development
```

### 3. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

## 🔐 트위터 OAuth 2.0 PKCE 설정

### PKCE (Proof Key for Code Exchange)란?

OAuth 2.0의 보안 강화를 위한 확장으로, 인증 코드 가로채기 공격을 방지합니다.

### 트위터 개발자 콘솔 설정

1. [Twitter Developer Portal](https://developer.twitter.com/)에서 앱 생성
2. **App settings > User authentication settings**에서 다음 설정:

#### OAuth 2.0 Settings

- **Type of App**: Web App
- **Callback URLs**:
  - 개발 환경: `http://localhost:3000/login-redirect`
  - 프로덕션: `https://event.fotone.moe/login-redirect`
- **Website URL**: 해당 도메인 URL

#### App permissions

- **Read** 권한 필요 (tweet.read, users.read)

### 클라이언트 ID 확인

현재 설정된 클라이언트 ID: `UTFPVGg2TnVJZ1NlS1pjYmhTMV86MTpjaQ`

## 🧪 API 연동 테스트

개발자 도구 콘솔에서 다음 함수들을 사용할 수 있습니다:

### 백엔드 연결 테스트

```javascript
// 종합 백엔드 테스트
comprehensiveBackendTest();

// API 연결 테스트
testApiConnection();

// 헬스체크
checkBackendHealth();
```

### OAuth PKCE 테스트

```javascript
// 종합 OAuth 테스트 (PKCE 포함)
comprehensiveOAuthTest();

// PKCE 플로우 전용 테스트
testPKCEFlow();

// 백엔드 로그인 플로우 시뮬레이션
testBackendLoginFlow();

// 환경 설정 확인
checkEnvironmentSettings();

// OAuth 상태 확인 (PKCE 포함)
checkOAuthState();

// OAuth 세션 정리
clearOAuthSession();
```

## 📁 프로젝트 구조

```
├── app/                    # Next.js 13+ App Router
│   ├── page.tsx           # 메인 페이지
│   ├── login-redirect/    # OAuth 리다이렉트 페이지
│   └── themes/            # 테마 목록 페이지
├── components/            # 재사용 가능한 컴포넌트
├── lib/                   # 유틸리티 및 API 클라이언트
│   ├── api.ts            # API 클라이언트
│   ├── auth-api.ts       # 인증 관련 API (PKCE 지원)
│   ├── theme-api.ts      # 테마 관련 API
│   ├── twitter-oauth.ts  # 트위터 OAuth PKCE 유틸리티
│   ├── health-check.ts   # 백엔드 헬스체크
│   ├── api-test.ts       # API 테스트 유틸리티
│   └── oauth-test.ts     # OAuth PKCE 테스트 유틸리티
├── store/                 # Zustand 상태 관리
│   └── auth-store.ts     # 인증 상태 관리 (PKCE 지원)
├── types/                 # TypeScript 타입 정의
└── hooks/                 # 커스텀 React Hooks
```

## 🔧 개발 가이드

### 로그인 플로우 (PKCE)

1. **로그인 버튼 클릭** → `startTwitterLogin()` 호출
2. **PKCE 파라미터 생성** → Code Verifier, Code Challenge, State 생성
3. **트위터 리다이렉트** → OAuth 승인 페이지 (Code Challenge 포함)
4. **콜백 처리** → `/login-redirect`에서 인증 코드 수신
5. **PKCE 검증** → sessionStorage에서 Code Verifier 가져오기
6. **백엔드 로그인** → 인증 코드 + Code Verifier를 백엔드로 전송
7. **토큰 저장** → JWT 토큰을 localStorage에 저장
8. **메인 페이지** → 로그인 완료 후 메인 페이지로 리다이렉트

### PKCE 파라미터

```typescript
// 프론트엔드에서 생성
const codeVerifier = generateCodeVerifier();        // 랜덤 문자열
const codeChallenge = await generateCodeChallenge(codeVerifier); // SHA256 해시
const state = generateState();                      // CSRF 방지

// 백엔드로 전송
{
  "code": "twitter_auth_code",
  "codeVerifier": "original_code_verifier"
}
```

### 환경별 리다이렉트 URI

- **로컬 개발**: `http://localhost:3000/login-redirect`
- **프로덕션**: `https://event.fotone.moe/login-redirect`

리다이렉트 URI는 현재 도메인을 기반으로 자동 생성됩니다.

### 개발 환경 설정

개발 환경에서는 목업 로그인과 실제 OAuth 로그인을 선택할 수 있습니다:

```typescript
// 개발 환경에서 목업 로그인
mockLogin();

// 실제 OAuth PKCE 로그인
await startLogin();
```

## 📱 주요 기능

- ✅ 트위터 OAuth 2.0 PKCE 로그인
- ✅ 보안 강화된 인증 플로우
- ✅ 테마 제출 및 관리
- ✅ 실시간 테마 목록 조회
- ✅ 일일 테마 제출 제한
- ✅ 반응형 UI
- ✅ Google Analytics 연동

## 🚨 문제 해결

### OAuth 로그인 실패

1. 트위터 개발자 콘솔에서 콜백 URL 확인
2. 클라이언트 ID 확인
3. `checkEnvironmentSettings()` 함수로 현재 설정 확인
4. `checkOAuthState()` 함수로 PKCE 파라미터 상태 확인

### PKCE 플로우 오류

```javascript
// PKCE 상태 확인
checkOAuthState();

// PKCE 플로우 테스트
testPKCEFlow();

// 세션 정리 후 다시 시도
clearOAuthSession();
```

### API 연결 실패

1. 백엔드 서버 실행 상태 확인 (`http://localhost:8080`)
2. `comprehensiveBackendTest()` 함수로 연결 테스트
3. CORS 설정 확인

### 개발자 도구 활용

```javascript
// 현재 인증 상태 확인 (PKCE 포함)
checkOAuthState();

// 백엔드 로그인 플로우 시뮬레이션
testBackendLoginFlow();

// 모든 세션 정리
clearOAuthSession();

// 백엔드 API 전체 테스트
comprehensiveBackendTest();
```

## 🔒 보안 기능

### PKCE (Proof Key for Code Exchange)

- **Code Verifier**: 클라이언트에서 생성한 랜덤 문자열
- **Code Challenge**: Code Verifier의 SHA256 해시값
- **State**: CSRF 공격 방지를 위한 랜덤 값

### 보안 검증

- State 파라미터 검증
- Code Verifier 세션 저장/복원
- JWT 토큰 자동 만료 처리

## 🌐 배포

### Vercel (권장)

```bash
npm run build
npm run start
```

### 환경 변수 (프로덕션)

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## 📄 라이선스

MIT License

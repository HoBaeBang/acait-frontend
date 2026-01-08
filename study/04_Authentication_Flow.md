# 4. 인증 흐름과 상태 관리 (Auth & State)

프론트엔드 개발에서 가장 중요하고 복잡한 부분인 **로그인 인증 흐름**과 **전역 상태 관리**를 다룹니다.

## 1. OAuth2 로그인 흐름 (Frontend 관점)

백엔드와 연동하여 소셜 로그인을 처리하는 과정입니다.

1.  **로그인 요청**: 사용자가 "Google로 로그인" 버튼 클릭 -> 백엔드 주소(`http://localhost:8080/oauth2/...`)로 이동.
2.  **인증 및 리다이렉트**: 구글 로그인 완료 후, 백엔드가 프론트엔드 주소로 리다이렉트 시킴.
    *   URL: `http://localhost:5173/login-success?token=ACCESS_TOKEN`
3.  **토큰 추출**: 프론트엔드(`LoginSuccessPage`)가 URL에서 `token` 파라미터를 낚아챔.
4.  **토큰 저장**: 추출한 토큰을 브라우저 저장소(LocalStorage)와 전역 상태(Zustand)에 저장.
5.  **메인 이동**: 로그인이 완료되었으므로 메인 페이지(`/`)로 이동.

---

## 2. 전역 상태 관리 (Zustand)

로그인 정보(토큰, 사용자 이름 등)는 앱의 **모든 곳**에서 필요합니다. 따라서 `props`로 일일이 넘겨주는 대신 **전역 저장소(Store)**에 보관합니다.

### 2.1. Zustand 선정 이유
*   Redux보다 코드가 훨씬 간결하고 직관적입니다.
*   `persist` 미들웨어를 쓰면 **새로고침 해도 데이터가 날아가지 않게(LocalStorage 자동 저장)** 쉽게 구현할 수 있습니다.

### 2.2. 코드 구조 (`authStore.ts`)
```typescript
const useAuthStore = create(persist((set) => ({
  token: null, // 상태 변수
  isAuthenticated: false,
  setToken: (token) => set({ token, isAuthenticated: true }), // 상태 변경 함수
  logout: () => set({ token: null, isAuthenticated: false }),
}), { name: 'auth-storage' }));
```

---

## 3. API 요청 자동화 (Axios Interceptor)

로그인 후에는 모든 API 요청 헤더에 `Authorization: Bearer {토큰}`을 붙여줘야 합니다. 이걸 매번 수동으로 하는 건 비효율적입니다.

### 3.1. Interceptor (가로채기)
**Axios Interceptor**를 사용하면 요청이 날아가기 직전에 **자동으로 토큰을 헤더에 심어줄 수 있습니다.**

```typescript
// client.ts
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token; // 스토어에서 토큰 꺼냄
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // 헤더에 장착
  }
  return config;
});
```

### 3.2. 백엔드 개발자를 위한 비유
*   **Interceptor**: Spring의 `Filter`나 `HandlerInterceptor`와 정확히 같은 역할입니다. 요청 전/후에 공통 로직을 수행합니다.

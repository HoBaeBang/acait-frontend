# 7. 개발 일지 - Day 1 (기반 구축 및 회원가입 UI)

**작성일:** 2026-01-12
**작업 목표:** 프론트엔드 프로젝트 초기 설정 및 회원가입 페이지 UI 구현

---

## 1. 주요 작업 내용

### 1.1. 프로젝트 셋업 (Project Setup)
*   **Tech Stack:** Vite + React + TypeScript + Tailwind CSS.
*   **이유:** 빠른 빌드 속도(Vite)와 타입 안정성(TS), 생산성 높은 스타일링(Tailwind)을 위해 선정.
*   **폴더 구조:** `features/` (기능별), `pages/` (라우팅), `components/` (공통 UI) 등으로 구조화.

### 1.2. 라우팅 및 레이아웃 (Routing)
*   `react-router-dom` 설치 및 설정.
*   **MainLayout**: 상단 헤더(로고, 네비게이션)를 포함한 공통 레이아웃 구현.
*   **Outlet**: 자식 페이지가 렌더링될 위치 지정.

### 1.3. 인증 시스템 (Authentication - Phase 1)
*   **OAuth2 연동**: 구글 로그인 버튼 -> 백엔드 리다이렉트 -> 토큰 수신.
*   **Zustand**: 전역 상태 관리 라이브러리로 `authStore` 구현 (LocalStorage 자동 저장).
*   **Axios Interceptor**: 모든 API 요청 헤더에 `Authorization: Bearer {token}` 자동 첨부.
*   **조건부 렌더링**: 로그인 여부(`isAuthenticated`)에 따라 **랜딩 페이지** vs **캘린더 뷰** 분기 처리.

### 1.4. 회원가입 페이지 UI (Signup Page)
*   **라이브러리**: `react-hook-form` + `zod` + `@hookform/resolvers`.
*   **구현 내용**:
    *   이름, 전화번호(정규식 검사), 이메일, 역할(강사/원장) 입력 폼.
    *   **조건부 필드**: 강사 선택 시 은행 정보 입력란이 나타나도록 했다가, **기획 변경(v3.1)으로 삭제함.**
    *   **유효성 검사**: 필수값 누락 시 에러 메시지 실시간 표시.

---

## 2. 트러블 슈팅 (Troubleshooting)

### 2.1. 패키지 누락 에러
*   **문제**: `Failed to resolve import "@hookform/resolvers/zod"` 에러 발생.
*   **원인**: `react-hook-form`만 설치하고, Zod와 연결해주는 리졸버 패키지를 설치하지 않음.
*   **해결**: `npm install @hookform/resolvers` 명령어로 추가 설치.

### 2.2. 로그인 리다이렉트 문제
*   **문제**: 로그인 후 프론트엔드(`localhost:5173`)가 아닌 백엔드(`localhost:8080`) 주소로 이동함.
*   **원인**: 백엔드 `OAuth2SuccessHandler`의 리다이렉트 URL이 상대 경로(`/login-success`)로 설정됨.
*   **해결**: 백엔드 코드를 절대 경로(`http://localhost:5173/login-success`)로 수정 요청.

### 2.3. API 호출 에러 (401/Network Error)
*   **문제**: 메인 페이지 접속 시 "일정을 불러오는 중 오류가 발생했습니다" 메시지 노출.
*   **원인**: 개발 중 남은 유효하지 않은 토큰이 LocalStorage에 남아있어, 잘못된 인증 정보로 API를 호출함.
*   **해결**: 개발자 도구 -> Application -> Local Storage 삭제 후 재로그인.

---

## 3. 기획 변경 사항 (Requirements Change)

### v3.0 -> v3.1
*   **은행 정보 삭제**: 개인정보 보호를 위해 강사 계좌 정보 수집을 시스템에서 제외함.
*   **이메일 추가**: 시스템 알림 수신용 `contactEmail` 필드 필수화.

---

## 4. 내일의 할 일 (Next Step)
*   [ ] `SignupPage`와 백엔드 API 연동 (`POST /signup`).
*   [ ] 로그인 에러 핸들링 (404 미가입 -> 회원가입 이동).
*   [ ] 승인 대기 페이지(`PendingPage`) 구현.

# ACAIT Frontend

**ACAIT (Academy AI Teacher)**는 학원 운영을 효율적으로 관리하기 위한 **SaaS 기반 학원 관리 플랫폼**입니다.
이 프로젝트는 ACAIT의 프론트엔드 레포지토리로, React와 TypeScript를 기반으로 구축되었습니다.

## 🚀 주요 기능 (Key Features)

### 1. 멀티 테넌시 & 인증 (Multi-Tenancy Auth)
*   **학원 생성 및 초대**: 원장님은 학원을 생성하고, 강사는 초대 코드를 통해 가입합니다.
*   **권한 관리**: `ROLE_OWNER`(원장)와 `ROLE_INSTRUCTOR`(강사)에 따른 메뉴 및 기능 접근 제어.
*   **OAuth2 로그인**: 구글 소셜 로그인을 통한 간편한 인증.

### 2. 캘린더 기반 일정 관리 (Schedule & Calendar)
*   **통합 뷰 (Grouped View)**: 겹치는 시간대의 수업을 하나로 묶어서 깔끔하게 표시.
*   **드래그 앤 드롭**: 직관적인 일정 수정 (이번 주만 변경 vs 앞으로 쭉 변경).
*   **보강 잡기**: 빈 시간을 클릭하여 결석생 보강 일정을 손쉽게 생성.

### 3. 수업 및 출결 관리 (LMS)
*   **수업 기록**: 출석, 지각, 결석, **보강 필요** 상태 기록 및 일지 작성.
*   **강의 개설**: 판서식(고정 시간표) 및 개별 진도(유동 시간표) 강의 지원.

### 4. 수강생 관리 (Student Management)
*   **체계적인 데이터**: 학년(초/중/고), 학교, 학부모 연락처 관리.
*   **상태 관리**: 재원/퇴원 상태 및 퇴원일 관리.

### 5. 정산 및 매출 관리 (Settlement)
*   **대시보드**: 월별 총 매출, 공제액(3.3%), 실지급액 요약 표시.
*   **상세 내역**: 강사별 수업 횟수 및 정산 상세 내역 조회.
*   **엑셀 다운로드**: 정산 내역을 엑셀 파일로 추출.

### 6. 교재 관리 (Material - Hybrid)
*   **하이브리드 검색**: 공용 도서 DB 검색 및 학원 전용 교재 직접 등록.

---

## 🛠️ 기술 스택 (Tech Stack)

| 분류 | 기술 | 비고 |
| :--- | :--- | :--- |
| **Core** | React 18, TypeScript | Vite 기반 빌드 |
| **State Management** | Zustand | 전역 상태 (Auth 등) |
| **Data Fetching** | TanStack Query (React Query) | 서버 상태 관리 및 캐싱 |
| **Styling** | Tailwind CSS | 유틸리티 퍼스트 CSS |
| **Form** | React Hook Form, Zod | 폼 유효성 검사 |
| **Calendar** | FullCalendar | 일정 시각화 및 인터랙션 |
| **HTTP Client** | Axios | API 통신 및 인터셉터 |

---

## 📂 폴더 구조 (Directory Structure)

```
src/
├── api/            # API 호출 함수 및 타입 정의 (Axios)
├── assets/         # 이미지, 로고 등 정적 파일
├── components/     # 재사용 가능한 UI 컴포넌트 (모달 등)
├── constants/      # 상수 데이터 (학년 코드 등)
├── hooks/          # 커스텀 훅 (useGroupedEvents 등)
├── layouts/        # 페이지 레이아웃 (MainLayout)
├── pages/          # 라우트별 페이지 컴포넌트
│   ├── admin/      # 관리자 전용 페이지
│   ├── students/   # 수강생 관리 페이지
│   └── ...
├── stores/         # Zustand 전역 스토어 (authStore)
├── App.tsx         # 라우팅 설정
└── main.tsx        # 진입점
```

---

## 💻 설치 및 실행 (Getting Started)

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd acait-project/frontend
```

### 2. 패키지 설치
```bash
npm install
# 또는
yarn install
```

### 3. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```
브라우저에서 `http://localhost:5173`으로 접속합니다.

---

## 🔗 백엔드 연동 (Backend Integration)

*   기본 API URL: `http://localhost:8080/api/v1`
*   `src/api/client.ts`에서 `baseURL`을 변경할 수 있습니다.
*   **CORS 설정**: 백엔드 서버에서 `http://localhost:5173` 오리진을 허용해야 합니다.

---

## 📝 라이선스 (License)

This project is licensed under the MIT License.

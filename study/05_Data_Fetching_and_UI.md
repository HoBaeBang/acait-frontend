# 5. 데이터 패칭과 UI 구현 (Data Fetching & UI)

서버에서 데이터를 가져와 화면에 보여주는 방법과 사용자 경험(UX)을 고려한 UI 구현을 다룹니다.

## 1. 서버 상태 관리 (TanStack Query)

`useEffect`와 `useState`로 직접 API를 호출하고 로딩 상태를 관리하는 것은 구식 방법입니다. **TanStack Query(React Query)**를 사용하면 훨씬 우아하게 처리할 수 있습니다.

### 1.1. 주요 기능
*   **자동 캐싱**: 한 번 가져온 데이터는 메모리에 저장해두고 재사용합니다.
*   **상태 관리**: `isLoading`(로딩중), `isError`(에러), `data`(성공 데이터) 상태를 자동으로 제공합니다.
*   **선언적 코드**: "어떻게(How)" 가져올지가 아니라 "무엇(What)"이 필요한지 선언하는 방식입니다.

### 1.2. 코드 예시
```tsx
// HomePage.tsx
const { data, isLoading, isError } = useQuery({
  queryKey: ['lectures'], // 이 키로 데이터를 캐싱함
  queryFn: getLectures,   // 실제 API 호출 함수
});

if (isLoading) return <Spinner />;
if (isError) return <ErrorPage />;
return <Calendar events={data} />;
```

---

## 2. 조건부 렌더링 (Conditional Rendering)

사용자의 상태(로그인 여부 등)에 따라 다른 화면을 보여주는 기법입니다.

### 2.1. 구현 방식 (`HomePage.tsx`)
```tsx
const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  // 1. 로그인을 안 했다면 -> 랜딩 페이지 (서비스 소개)
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // 2. 로그인을 했다면 -> 캘린더 뷰 (기능 화면)
  return <CalendarView />;
};
```
이 방식을 통해 불필요한 API 호출을 막고, 사용자에게 상황에 맞는 적절한 화면을 제공할 수 있습니다.

---

## 3. FullCalendar 라이브러리

달력 기능은 직접 구현하기 매우 복잡하므로 검증된 라이브러리를 사용합니다.

*   **플러그인 시스템**: `dayGrid`(월간), `timeGrid`(주간/일간), `interaction`(클릭 이벤트) 등 필요한 기능만 골라서 쓸 수 있습니다.
*   **이벤트 연결**: 백엔드에서 받아온 데이터(`events`)를 props로 넘겨주기만 하면 달력에 표시됩니다.

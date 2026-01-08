# 3. 라우팅과 레이아웃 (Routing & Layout)

웹 애플리케이션의 뼈대를 만드는 과정입니다. 사용자가 URL을 입력했을 때 어떤 화면을 보여줄지 결정하고, 모든 페이지에 공통적으로 들어가는 UI(헤더, 푸터 등)를 관리하는 방법을 다룹니다.

## 1. 라우팅 (Routing)

**라우팅**이란 사용자가 요청한 URL에 따라 알맞은 페이지(컴포넌트)를 보여주는 것을 말합니다. React에서는 `react-router-dom` 라이브러리를 표준처럼 사용합니다.

### 1.1. 핵심 컴포넌트
*   **`BrowserRouter`**: 라우팅 기능을 사용할 수 있게 앱 전체를 감싸주는 컴포넌트입니다.
*   **`Routes`**: 여러 `Route`들을 묶어주는 컨테이너입니다.
*   **`Route`**: URL 경로(`path`)와 보여줄 컴포넌트(`element`)를 연결합니다.

### 1.2. 코드 예시 (`App.tsx`)
```tsx
<BrowserRouter>
  <Routes>
    {/* 1. 레이아웃이 적용되는 페이지들 */}
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/lectures" element={<LectureListPage />} />
    </Route>

    {/* 2. 레이아웃이 없는 페이지들 (로그인 등) */}
    <Route path="/login" element={<LoginPage />} />
  </Routes>
</BrowserRouter>
```

---

## 2. 레이아웃 (Layout)

웹사이트를 보면 페이지가 바뀌어도 상단 메뉴바(Header)나 하단 정보(Footer)는 그대로 유지되는 경우가 많습니다. 이를 효율적으로 처리하기 위해 **레이아웃 컴포넌트**를 사용합니다.

### 2.1. Outlet (중요!)
`react-router-dom`에서 제공하는 `<Outlet />` 컴포넌트는 **"자식 라우트가 렌더링될 구멍"** 역할을 합니다.

### 2.2. 동작 원리 (`MainLayout.tsx`)
```tsx
const MainLayout = () => {
  return (
    <div>
      <Header /> {/* 모든 페이지에 고정됨 */}
      
      <main>
        <Outlet /> {/* 여기에 HomePage나 LectureListPage가 갈아끼워짐 */}
      </main>
    </div>
  );
};
```

### 2.3. 백엔드 개발자를 위한 비유
*   **Layout**: JSP나 Thymeleaf의 `layout.html` 또는 `include` 기능과 같습니다.
*   **Outlet**: `layout:fragment="content"` 처럼 실제 페이지 내용이 들어가는 자리입니다.

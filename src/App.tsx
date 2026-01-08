import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import LectureListPage from './pages/LectureListPage';
import LectureCreatePage from './pages/LectureCreatePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* MainLayout을 감싸는 라우트 */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/lectures" element={<LectureListPage />} />
          <Route path="/lectures/new" element={<LectureCreatePage />} />
        </Route>

        {/* 레이아웃 없이 보여줄 페이지들 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-success" element={<LoginSuccessPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

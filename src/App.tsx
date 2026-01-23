import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import RegisterPage from './pages/RegisterPage';
import PendingPage from './pages/PendingPage';
import RejectedPage from './pages/RejectedPage';
import LectureListPage from './pages/LectureListPage';
import LectureCreatePage from './pages/LectureCreatePage';
import InstructorPage from './pages/admin/InstructorPage';
import StudentListPage from './pages/students/StudentListPage';
import StudentFormPage from './pages/students/StudentFormPage';
import SettlementPage from './pages/SettlementPage';
import MaterialPage from './pages/MaterialPage';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* MainLayout을 감싸는 라우트 */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          
          {/* 강의 관리 */}
          <Route path="/lectures" element={<LectureListPage />} />
          <Route path="/lectures/new" element={<LectureCreatePage />} />
          
          {/* 수강생 관리 */}
          <Route path="/students" element={<StudentListPage />} />
          <Route path="/students/new" element={<StudentFormPage />} />
          <Route path="/students/:id/edit" element={<StudentFormPage />} />
          
          {/* 교재 관리 */}
          <Route path="/materials" element={<MaterialPage />} />

          {/* 정산 관리 */}
          <Route path="/settlements" element={<SettlementPage />} />
          
          {/* 관리자 전용 라우트 */}
          <Route path="/admin/instructors" element={<InstructorPage />} />
        </Route>

        {/* 레이아웃 없이 보여줄 페이지들 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-success" element={<LoginSuccessPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending" element={<PendingPage />} />
        <Route path="/rejected" element={<RejectedPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

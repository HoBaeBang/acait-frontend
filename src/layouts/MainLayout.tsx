import { Link, Outlet } from 'react-router-dom';
import logo from '../assets/acait_logo.png';
import { useAuthStore } from '../stores/authStore';

const MainLayout = () => {
  const { user, logout } = useAuthStore();

  // 역할 표시 헬퍼 함수
  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'ROLE_OWNER': return '원장';
      case 'ROLE_INSTRUCTOR': return '강사';
      case 'ROLE_SUPER_ADMIN': return '관리자';
      default: return '사용자';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 바 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center gap-2">
                  <img src={logo} alt="ACAIT Logo" className="h-8 w-auto" />
                  <span className="text-xl font-bold text-gray-900 hidden sm:block">ACAIT</span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  캘린더
                </Link>
                <Link
                  to="/lectures"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  강의 관리
                </Link>
                <Link
                  to="/students"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  수강생 관리
                </Link>
                <Link
                  to="/settlements"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  정산 관리
                </Link>
                
                {/* 원장님(OWNER)에게만 보이는 메뉴 */}
                {user?.role === 'ROLE_OWNER' && (
                  <Link
                    to="/admin/instructors"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    강사 관리
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">
                    {user.email} ({getRoleLabel(user.role)})
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

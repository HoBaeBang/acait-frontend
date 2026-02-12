import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import logo from '../assets/acait_logo.png';

const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <img src={logo} alt="ACAIT Logo" className="h-32 mx-auto mb-8 drop-shadow-md" />
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            학원 관리를 <span className="text-blue-600">더 스마트하게</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            복잡한 강의 일정부터 강사 관리, 수강료 정산까지.<br />
            ACAIT 하나로 학원 운영의 모든 것을 해결하세요.
          </p>
          
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/schedule"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                강의 일정 보러가기
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                시작하기
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section (간단 예시) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">스마트한 일정 관리</h3>
              <p className="text-gray-600">드래그 앤 드롭으로 간편하게 수업 일정을 조정하고 관리하세요.</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">투명한 정산 시스템</h3>
              <p className="text-gray-600">수업 횟수 기반의 정확한 강사료 정산과 공제 항목 관리를 지원합니다.</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">체계적인 학생 관리</h3>
              <p className="text-gray-600">수강 이력부터 수납 내역까지 학생의 모든 정보를 한눈에 파악하세요.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

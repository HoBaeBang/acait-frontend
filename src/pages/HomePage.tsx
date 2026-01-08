import { useQuery } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getLectureEvents } from '../api/lectureApi';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';
import logo from '../assets/acait_logo.png'; // 로고 이미지 import

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  // 1. 비로그인 상태: 랜딩 페이지 표시
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-4xl mx-auto">
            <img 
              src={logo} 
              alt="ACAIT Logo" 
              className="h-32 mx-auto mb-8 drop-shadow-md" 
            />
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              학원 관리를 <span className="text-blue-600">더 스마트하게</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              복잡한 강의 일정부터 강사 관리까지, ACAIT 하나로 해결하세요.<br />
              효율적인 학원 운영의 시작, 지금 바로 경험해보세요.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              로그인하여 시작하기
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                  📅
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">스마트한 일정 관리</h3>
                <p className="text-gray-500 leading-relaxed">
                  직관적인 캘린더 뷰로 강의 스케줄을 한눈에 파악하고 관리할 수 있습니다.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                  👥
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">강사 및 학생 관리</h3>
                <p className="text-gray-500 leading-relaxed">
                  강사진과 수강생 정보를 체계적으로 관리하여 업무 효율을 높입니다.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                  📊
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">데이터 분석</h3>
                <p className="text-gray-500 leading-relaxed">
                  학원 운영 데이터를 시각화하여 더 나은 의사결정을 돕습니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // 2. 로그인 상태: 캘린더 컴포넌트 표시 (기존 코드 분리)
  return <CalendarView />;
};

// 캘린더 뷰 컴포넌트 (로그인 시에만 렌더링됨)
const CalendarView = () => {
  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['lectureEvents'],
    queryFn: getLectureEvents,
    // 로그인 상태일 때만 쿼리 실행 (enabled 옵션은 상위에서 처리했으므로 생략 가능하지만 안전장치로 둠)
    enabled: true, 
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg border border-red-100 m-4">
        <p className="font-bold">일정을 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm mt-2">잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 m-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-blue-500">📅</span> 강의 일정
        </h1>
        <Link 
          to="/lectures/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
        >
          + 일정 등록
        </Link>
      </div>
      
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale="ko"
          events={events}
          eventClick={(info) => {
            alert(`강의: ${info.event.title}\n시간: ${info.event.start?.toLocaleString()} ~ ${info.event.end?.toLocaleString()}`);
          }}
          height="auto"
          contentHeight="70vh"
          eventColor="#3B82F6" // 기본 이벤트 색상 (Blue-500)
        />
      </div>
    </div>
  );
}

export default HomePage;

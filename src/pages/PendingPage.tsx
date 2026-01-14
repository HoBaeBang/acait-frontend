import { Link } from 'react-router-dom';

const PendingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            가입 승인 대기 중
          </h2>
          
          <p className="text-gray-600 mb-6">
            회원가입 신청이 완료되었습니다.<br />
            원장님의 승인 후 서비스를 이용하실 수 있습니다.
          </p>

          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              홈으로 돌아가기
            </Link>
            
            <Link
              to="/login"
              className="block w-full justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              로그인 화면으로
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingPage;

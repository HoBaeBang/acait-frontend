import { Link } from 'react-router-dom';

const RejectedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            가입 승인 거절
          </h2>
          
          <p className="text-gray-600 mb-6">
            죄송합니다. 회원가입 승인이 거절되었습니다.<br />
            자세한 내용은 학원 관리자에게 문의해주세요.
          </p>

          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectedPage;

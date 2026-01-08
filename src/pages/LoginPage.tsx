const LoginPage = () => {
  // 백엔드 OAuth2 로그인 엔드포인트
  // 개발 환경(localhost) 기준입니다. 배포 시 환경변수로 분리해야 합니다.
  const GOOGLE_LOGIN_URL = 'http://localhost:8080/oauth2/authorization/google';

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-8">로그인</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <p className="mb-6 text-gray-600">서비스 이용을 위해 로그인해주세요.</p>
        
        <a 
          href={GOOGLE_LOGIN_URL}
          className="block w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google Logo" 
            className="w-5 h-5"
          />
          Google로 로그인
        </a>
      </div>
    </div>
  );
};

export default LoginPage;

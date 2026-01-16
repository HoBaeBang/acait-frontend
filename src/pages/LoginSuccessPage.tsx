import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const LoginSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('LoginSuccessPage mounted. Token from URL:', token);

    if (token) {
      try {
        // 1. Zustand 스토어에 토큰 저장 (자동으로 localStorage에도 저장됨)
        console.log('Attempting to set token...');
        setToken(token);
        
        // 저장 후 상태 확인 (비동기라 바로 반영 안 될 수도 있지만 로그용)
        const storedToken = useAuthStore.getState().token;
        console.log('Token stored in store:', storedToken ? 'Success' : 'Failed');

        if (storedToken) {
          console.log('Redirecting to home...');
          // 2. 메인 페이지로 이동
          navigate('/', { replace: true });
        } else {
          console.error('Token setting failed inside store.');
          alert('로그인 처리 중 오류가 발생했습니다. (Token Error)');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error during token processing:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
        navigate('/login', { replace: true });
      }
    } else {
      console.warn('No token found in URL.');
      // 토큰이 없으면 로그인 페이지로 이동 (alert는 사용자 경험을 위해 생략 가능)
      // alert('로그인에 실패했습니다.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setToken]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">로그인 처리 중...</h2>
        <p className="text-gray-500">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default LoginSuccessPage;

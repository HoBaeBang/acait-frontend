import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const LoginSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      console.log('Login Success! Token:', token);
      
      // 1. Zustand 스토어에 토큰 저장 (자동으로 localStorage에도 저장됨)
      setToken(token);
      
      // 2. 메인 페이지로 이동
      // replace: true 옵션을 주어 뒤로가기 시 다시 이 페이지로 오지 않도록 함
      navigate('/', { replace: true });
    } else {
      alert('로그인에 실패했습니다.');
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

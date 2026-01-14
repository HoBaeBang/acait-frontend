import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { client } from '../api/client';

// 1. Zod 스키마 정의
const registerSchema = z.object({
  googleEmail: z.string().email(), // hidden field
  name: z.string().min(2, '이름은 2글자 이상이어야 합니다.'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '010-0000-0000 형식으로 입력해주세요.'),
  contactEmail: z.string().email('올바른 이메일 형식을 입력해주세요.'),
  role: z.enum(['ROLE_ADMIN', 'ROLE_INSTRUCTOR'], {
    errorMap: () => ({ message: '역할을 선택해주세요.' }),
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // URL 파라미터에서 구글 정보 가져오기
  const googleEmail = searchParams.get('googleEmail') || '';
  const googleName = searchParams.get('name') || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'ROLE_INSTRUCTOR',
      googleEmail: googleEmail,
      name: googleName,
    },
  });

  // URL 파라미터가 늦게 로드될 경우를 대비해 useEffect로 값 설정
  useEffect(() => {
    if (googleEmail) setValue('googleEmail', googleEmail);
    if (googleName) setValue('name', googleName);
  }, [googleEmail, googleName, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log('가입 신청 데이터:', data);
      
      // 백엔드 API 호출
      await client.post('/auth/signup', data);

      // 성공 시 승인 대기 페이지로 이동
      navigate('/pending');
    } catch (error) {
      console.error('가입 신청 실패:', error);
      alert('가입 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입 신청
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          구글 계정 인증이 완료되었습니다.<br />
          추가 정보를 입력하여 가입을 신청해주세요.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* 구글 이메일 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                구글 계정
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  value={googleEmail}
                  disabled
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
                />
                <input type="hidden" {...register('googleEmail')} />
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>

            {/* 전화번호 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                휴대전화 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  type="text"
                  {...register('phone')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="010-1234-5678"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* 이메일 (알림용) */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                이메일 (알림 수신용) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="contactEmail"
                  type="email"
                  {...register('contactEmail')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>
            </div>

            {/* 역할 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가입 유형 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ROLE_INSTRUCTOR"
                    {...register('role')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">강사</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ROLE_ADMIN"
                    {...register('role')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">원장 (관리자)</span>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* 제출 버튼 */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {isSubmitting ? '가입 신청하기' : '가입 신청하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

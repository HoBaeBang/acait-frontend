import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// 1. Zod 스키마 정의 (유효성 검사 규칙)
const signupSchema = z.object({
  name: z.string().min(2, '이름은 2글자 이상이어야 합니다.'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '010-0000-0000 형식으로 입력해주세요.'),
  role: z.enum(['ROLE_ADMIN', 'ROLE_INSTRUCTOR'], {
    errorMap: () => ({ message: '역할을 선택해주세요.' }),
  }),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
});

// 타입 추론
type SignupFormData = z.infer<typeof signupSchema>;

const SignupPage = () => {
  const navigate = useNavigate();
  
  // 2. React Hook Form 설정
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'ROLE_INSTRUCTOR', // 기본값: 강사
    },
  });

  // 역할 선택 값 감시 (강사일 때만 은행 정보 보여주기 위해)
  const selectedRole = watch('role');

  // 3. 폼 제출 핸들러
  const onSubmit = async (data: SignupFormData) => {
    console.log('제출된 데이터:', data);
    
    // TODO: 백엔드 API 호출 (POST /api/v1/auth/signup)
    // await client.post('/auth/signup', data);

    alert('가입 신청이 완료되었습니다. 원장님 승인 후 이용 가능합니다.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입 (추가 정보)
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          서비스 이용을 위해 필수 정보를 입력해주세요.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
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
                  placeholder="홍길동"
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

            {/* 은행 정보 (강사 선택 시에만 표시) */}
            {selectedRole === 'ROLE_INSTRUCTOR' && (
              <div className="bg-gray-50 p-4 rounded-md space-y-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">정산 계좌 정보 (선택)</h4>
                
                <div>
                  <label htmlFor="bankName" className="block text-xs font-medium text-gray-500">
                    은행명
                  </label>
                  <input
                    id="bankName"
                    type="text"
                    {...register('bankName')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="예: 국민은행"
                  />
                </div>

                <div>
                  <label htmlFor="accountNumber" className="block text-xs font-medium text-gray-500">
                    계좌번호
                  </label>
                  <input
                    id="accountNumber"
                    type="text"
                    {...register('accountNumber')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="- 없이 입력"
                  />
                </div>
              </div>
            )}

            {/* 제출 버튼 */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {isSubmitting ? '처리 중...' : '가입 신청하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

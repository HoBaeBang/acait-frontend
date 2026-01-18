import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { signup } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';

// 공통 스키마
const commonSchema = {
  name: z.string().min(2, '이름은 2글자 이상이어야 합니다.'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '010-0000-0000 형식으로 입력해주세요.'),
  contactEmail: z.string().email('올바른 이메일 형식을 입력해주세요.'),
};

// 1. 학원 생성 (Owner) 스키마
const ownerSchema = z.object({
  ...commonSchema,
  academyName: z.string().min(2, '학원명은 2글자 이상이어야 합니다.'),
  googleEmail: z.string().email(),
  role: z.literal('ROLE_OWNER'),
});

// 2. 초대 가입 (Instructor) 스키마
const instructorSchema = z.object({
  ...commonSchema,
  inviteCode: z.string().min(1, '초대 코드를 입력해주세요.'),
  googleEmail: z.string().email(),
  role: z.literal('ROLE_INSTRUCTOR'),
});

type OwnerFormData = z.infer<typeof ownerSchema>;
type InstructorFormData = z.infer<typeof instructorSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'OWNER' | 'INSTRUCTOR'>('OWNER');
  const { setToken } = useAuthStore();
  
  const googleEmail = searchParams.get('googleEmail') || '';
  const googleName = searchParams.get('name') || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OwnerFormData & InstructorFormData>({
    resolver: zodResolver(activeTab === 'OWNER' ? ownerSchema : instructorSchema),
    defaultValues: {
      role: 'ROLE_OWNER',
      googleEmail: googleEmail,
      name: googleName,
      contactEmail: googleEmail, // 알림용 이메일 기본값 설정
    },
  });

  useEffect(() => {
    setValue('role', activeTab === 'OWNER' ? 'ROLE_OWNER' : 'ROLE_INSTRUCTOR');
  }, [activeTab, setValue]);

  useEffect(() => {
    if (googleEmail) {
      setValue('googleEmail', googleEmail);
      setValue('contactEmail', googleEmail); // URL 파라미터 로드 시에도 설정
    }
    if (googleName) setValue('name', googleName);
  }, [googleEmail, googleName, setValue]);

  // 전화번호 자동 포맷팅 핸들러
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    let formattedValue = rawValue;

    if (rawValue.length > 3 && rawValue.length <= 7) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    } else if (rawValue.length > 7) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
    }

    setValue('phone', formattedValue, { shouldValidate: true });
  };

  const onSubmit = async (data: any) => {
    try {
      console.log('가입 요청 데이터:', data);
      
      const response = await signup({
        googleEmail: data.googleEmail,
        role: data.role,
        name: data.name,
        phone: data.phone,
        contactEmail: data.contactEmail,
        academyName: activeTab === 'OWNER' ? data.academyName : undefined,
        inviteCode: activeTab === 'INSTRUCTOR' ? data.inviteCode : undefined,
      });

      if (activeTab === 'OWNER') {
        if (response.accessToken) {
          setToken(response.accessToken);
          alert('학원이 생성되었습니다! 환영합니다.');
          navigate('/', { replace: true });
        } else {
          alert('가입이 완료되었습니다. 로그인해주세요.');
          navigate('/login');
        }
      } else {
        navigate('/pending');
      }

    } catch (error: any) {
      console.error('요청 실패:', error);
      const message = error.response?.data?.message || '처리 중 오류가 발생했습니다.';
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ACAIT 서비스 이용을 위해 정보를 입력해주세요.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              className={clsx(
                "flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'OWNER' 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setActiveTab('OWNER')}
            >
              새 학원 만들기 (원장)
            </button>
            <button
              type="button"
              className={clsx(
                "flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'INSTRUCTOR' 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setActiveTab('INSTRUCTOR')}
            >
              초대 코드로 가입 (강사)
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">구글 계정</label>
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

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                휴대전화 <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="text"
                {...register('phone')}
                onChange={handlePhoneChange} // 커스텀 핸들러 연결
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="010-1234-5678"
                maxLength={13}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                이메일 (알림용) <span className="text-red-500">*</span>
              </label>
              <input
                id="contactEmail"
                type="email"
                {...register('contactEmail')}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.contactEmail && <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>}
            </div>

            {activeTab === 'OWNER' ? (
              <div>
                <label htmlFor="academyName" className="block text-sm font-medium text-gray-700">
                  학원명 <span className="text-red-500">*</span>
                </label>
                <input
                  id="academyName"
                  type="text"
                  {...register('academyName')}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="예: 스카이 수학학원"
                />
                {errors.academyName && <p className="mt-1 text-sm text-red-600">{errors.academyName.message}</p>}
              </div>
            ) : (
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
                  초대 코드 <span className="text-red-500">*</span>
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  {...register('inviteCode')}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="원장님께 받은 코드를 입력하세요"
                />
                {errors.inviteCode && <p className="mt-1 text-sm text-red-600">{errors.inviteCode.message}</p>}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {isSubmitting ? '처리 중...' : (activeTab === 'OWNER' ? '학원 생성 및 가입' : '가입 신청하기')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

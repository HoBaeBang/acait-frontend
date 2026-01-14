import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { client } from '../api/client';
import clsx from 'clsx';

// 공통 스키마 (이름, 전화번호, 이메일)
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
  
  const googleEmail = searchParams.get('googleEmail') || '';
  const googleName = searchParams.get('name') || '';

  // 폼 설정 (탭에 따라 다른 스키마 적용은 복잡하므로, 각각의 폼을 렌더링하거나 하나의 폼에서 분기 처리)
  // 여기서는 편의상 하나의 폼 상태를 공유하되, 제출 시 검증을 분리합니다.
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OwnerFormData & InstructorFormData>({
    resolver: zodResolver(activeTab === 'OWNER' ? ownerSchema : instructorSchema),
    defaultValues: {
      role: 'ROLE_OWNER',
      googleEmail: googleEmail,
      name: googleName,
    },
  });

  // 탭 변경 시 role 값 업데이트 및 에러 초기화
  useEffect(() => {
    setValue('role', activeTab === 'OWNER' ? 'ROLE_OWNER' : 'ROLE_INSTRUCTOR');
    // 에러 초기화를 위해 reset을 하되, 입력된 값은 유지하고 싶다면 getValues() 사용 가능
    // 여기서는 간단히 role만 변경
  }, [activeTab, setValue]);

  useEffect(() => {
    if (googleEmail) setValue('googleEmail', googleEmail);
    if (googleName) setValue('name', googleName);
  }, [googleEmail, googleName, setValue]);

  const onSubmit = async (data: any) => {
    try {
      console.log('가입 신청 데이터:', data);
      
      // API 엔드포인트 분기 (학원 생성 vs 일반 가입)
      // v5.0 명세에 따라 엔드포인트가 다를 수 있음. 일단 /auth/signup으로 통일하고 role로 구분한다고 가정.
      // 만약 학원 생성 API가 따로 있다면 (/academies) 여기서 분기 처리.
      
      await client.post('/auth/signup', data);

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
          회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ACAIT 서비스 이용을 위해 정보를 입력해주세요.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {/* 탭 메뉴 */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
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
            
            {/* 공통: 구글 이메일 */}
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

            {/* 공통: 이름 */}
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

            {/* 공통: 전화번호 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                휴대전화 <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="text"
                {...register('phone')}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="010-1234-5678"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            {/* 공통: 이메일 */}
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

            {/* 탭별 전용 필드 */}
            {activeTab === 'OWNER' ? (
              // 원장님: 학원명 입력
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
              // 강사님: 초대 코드 입력
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

            {/* 제출 버튼 */}
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

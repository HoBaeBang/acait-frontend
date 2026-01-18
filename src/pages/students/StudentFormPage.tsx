import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStudent, updateStudent, getStudent, StudentRequest } from '../../api/studentApi';
import { GRADE_OPTIONS } from '../../constants/grade';

// 유효성 검사 스키마
const studentSchema = z.object({
  name: z.string().min(2, '이름은 2글자 이상이어야 합니다.'),
  school: z.string().optional(),
  grade: z.string().min(1, '학년을 선택해주세요.'), // 필수 선택
  birthDate: z.string().length(4, '생일은 4자리여야 합니다. (예: 0101)').optional().or(z.literal('')),
  parentPhone: z.string().regex(/^010-\d{4}-\d{4}$/, '010-0000-0000 형식으로 입력해주세요.'),
  parentEmail: z.string().email('올바른 이메일 형식을 입력해주세요.').optional().or(z.literal('')),
  memo: z.string().optional(),
  status: z.enum(['ATTENDING', 'DISCHARGED']).optional(),
  dischargeDate: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

const StudentFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      grade: 'N', // 기본값: 기타
      status: 'ATTENDING',
    },
  });

  // 상태값 감시 (퇴원일 입력창 표시용)
  const status = watch('status');

  const { data: studentData } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (studentData) {
      reset(studentData);
    }
  }, [studentData, reset]);

  const mutation = useMutation({
    mutationFn: (data: StudentRequest) => 
      isEditMode ? updateStudent(id!, data) : createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      alert(isEditMode ? '수정되었습니다.' : '등록되었습니다.');
      navigate('/students');
    },
    onError: () => {
      alert('처리 중 오류가 발생했습니다.');
    },
  });

  const onSubmit = (data: StudentFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditMode ? '수강생 정보 수정' : '수강생 등록'}
      </h1>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* 학번 (수정 모드일 때만 표시, Read-Only) */}
          {isEditMode && studentData && (
            <div>
              <label className="block text-sm font-medium text-gray-700">학번</label>
              <input
                type="text"
                value={studentData.studentNumber}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
              />
            </div>
          )}

          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="홍길동"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* 학교 & 학년 (드롭다운 적용) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">학교</label>
              <input
                type="text"
                {...register('school')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="OO중학교"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                학년 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('grade')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {GRADE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.grade && <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>}
            </div>
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              생일 (4자리) <span className="text-gray-400 text-xs ml-1">*학부모 조회 인증용</span>
            </label>
            <input
              type="text"
              {...register('birthDate')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="0101"
              maxLength={4}
            />
            {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">학부모 정보</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('parentPhone')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="010-1234-5678"
              />
              {errors.parentPhone && <p className="mt-1 text-sm text-red-600">{errors.parentPhone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <input
                type="email"
                {...register('parentEmail')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="parent@example.com"
              />
              {errors.parentEmail && <p className="mt-1 text-sm text-red-600">{errors.parentEmail.message}</p>}
            </div>
          </div>

          {/* 퇴원 관리 (수정 모드일 때만 표시) */}
          {isEditMode && (
            <div className="border-t border-gray-200 pt-4 bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">상태 관리</h3>
              
              <div className="flex gap-6 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="ATTENDING"
                    {...register('status')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">재원</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="DISCHARGED"
                    {...register('status')}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">퇴원</span>
                </label>
              </div>

              {/* 퇴원 선택 시 퇴원일 입력창 표시 */}
              {status === 'DISCHARGED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    퇴원일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('dischargeDate')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">메모</label>
            <textarea
              {...register('memo')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="특이사항 입력"
            />
          </div>

          {/* 버튼 그룹 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isSubmitting ? '저장 중...' : (isEditMode ? '수정하기' : '등록하기')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormPage;

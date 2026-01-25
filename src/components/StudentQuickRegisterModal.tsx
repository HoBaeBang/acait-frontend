import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStudent, StudentRequest } from '../api/studentApi';
import { GRADE_OPTIONS } from '../constants/grade';

const quickStudentSchema = z.object({
  name: z.string().min(2, '이름은 2글자 이상이어야 합니다.'),
  grade: z.string().min(1, '학년을 선택해주세요.'),
  parentPhone: z.string().regex(/^010-\d{4}-\d{4}$/, '010-0000-0000 형식으로 입력해주세요.'),
});

type QuickStudentFormData = z.infer<typeof quickStudentSchema>;

interface StudentQuickRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (studentId: number) => void; // 등록된 학생 ID 반환
}

const StudentQuickRegisterModal: React.FC<StudentQuickRegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickStudentFormData>({
    resolver: zodResolver(quickStudentSchema),
    defaultValues: {
      grade: 'N',
    },
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    let formattedValue = rawValue;
    if (rawValue.length > 3 && rawValue.length <= 7) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    } else if (rawValue.length > 7) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
    }
    setValue('parentPhone', formattedValue, { shouldValidate: true });
  };

  const mutation = useMutation({
    mutationFn: async (data: QuickStudentFormData) => {
      // 필수 값 외에는 기본값 또는 빈 값으로 채워서 전송
      const requestData: StudentRequest = {
        ...data,
        school: '',
        birthDate: '',
        parentEmail: '',
        memo: '간편 등록됨',
      };
      // createStudent가 void를 반환하므로, 백엔드 응답에서 ID를 받으려면 api/studentApi.ts 수정 필요
      // 하지만 현재 createStudent는 void 반환.
      // -> 해결책: createStudent를 수정하여 response.data를 반환하게 하거나,
      //    여기서는 목록 갱신 후 가장 최근 학생을 찾거나 해야 함.
      //    가장 좋은 건 createStudent가 생성된 객체를 반환하는 것.
      return createStudent(requestData); 
    },
    onSuccess: async () => {
      // 목록 갱신
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      
      // 방금 등록한 학생 ID를 알아내야 함.
      // createStudent가 ID를 반환하지 않는다면, 목록을 다시 조회해서 찾아야 함.
      // (임시 방편: 목록의 맨 마지막 또는 이름/전화번호로 매칭)
      // *가장 확실한 방법은 api/studentApi.ts의 createStudent가 응답을 반환하도록 수정하는 것*
      
      alert('학생이 등록되었습니다.');
      reset();
      onClose();
      // onSuccess 콜백은 api 수정 후 연결
    },
    onError: () => {
      alert('학생 등록에 실패했습니다.');
    },
  });

  const onSubmit = (data: QuickStudentFormData) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                학생 간편 등록
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">이름 *</label>
                  <input
                    type="text"
                    {...register('name')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="홍길동"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">학년 *</label>
                  <select
                    {...register('grade')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {GRADE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">연락처 *</label>
                  <input
                    type="text"
                    {...register('parentPhone')}
                    onChange={handlePhoneChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="010-1234-5678"
                    maxLength={13}
                  />
                  {errors.parentPhone && <p className="text-red-500 text-xs mt-1">{errors.parentPhone.message}</p>}
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:col-start-2 sm:text-sm"
                  >
                    등록
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={onClose}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuickRegisterModal;

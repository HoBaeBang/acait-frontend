import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLecture, CreateLectureRequest } from '../api/lectureApi';
import { getInstructors } from '../api/adminApi';
import { getStudents } from '../api/studentApi';
import { useAuthStore } from '../stores/authStore';
import { useState } from 'react';
import clsx from 'clsx';
import StudentQuickRegisterModal from '../components/StudentQuickRegisterModal';

// 요일 옵션
const DAY_OPTIONS = [
  { value: 'MONDAY', label: '월요일' },
  { value: 'TUESDAY', label: '화요일' },
  { value: 'WEDNESDAY', label: '수요일' },
  { value: 'THURSDAY', label: '목요일' },
  { value: 'FRIDAY', label: '금요일' },
  { value: 'SATURDAY', label: '토요일' },
  { value: 'SUNDAY', label: '일요일' },
];

// 유효성 검사 스키마
const lectureSchema = z.object({
  name: z.string().min(2, '강의명은 2글자 이상이어야 합니다.'),
  type: z.enum(['BOARD', 'INDIV'], {
    errorMap: () => ({ message: '강의 유형을 선택해주세요.' }),
  }),
  defaultPrice: z.number().min(0, '가격은 0원 이상이어야 합니다.'),
  defaultDuration: z.number().min(10, '수업 시간은 최소 10분 이상이어야 합니다.'),
  instructorId: z.union([z.number(), z.string()]).optional(),
  schedules: z.array(z.object({
    dayOfWeek: z.string().min(1, '요일을 선택해주세요.'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식이 올바르지 않습니다.'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식이 올바르지 않습니다.'),
  })).min(1, '최소 1개 이상의 시간표를 등록해야 합니다.'),
  studentIds: z.array(z.number()).optional(),
});

type LectureFormData = z.infer<typeof lectureSchema>;

const LectureCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isOwner = user?.role === 'ROLE_OWNER';

  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [isQuickRegisterModalOpen, setIsQuickRegisterModalOpen] = useState(false);

  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: getInstructors,
    enabled: isOwner,
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LectureFormData>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      type: 'BOARD',
      defaultPrice: 50000,
      defaultDuration: 60,
      schedules: [{ dayOfWeek: 'MONDAY', startTime: '14:00', endTime: '16:00' }],
      studentIds: [],
    },
  });

  const lectureType = watch('type');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'schedules',
  });

  const mutation = useMutation({
    mutationFn: createLecture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
      alert('강의가 개설되었습니다.');
      navigate('/lectures');
    },
    onError: (error) => {
      console.error('API Error:', error);
      alert('강의 개설에 실패했습니다.');
    },
  });

  const onSubmit = (data: LectureFormData) => {
    const formattedSchedules = data.schedules.map(s => ({
      ...s,
      startTime: s.startTime.length === 5 ? `${s.startTime}:00` : s.startTime,
      endTime: s.endTime.length === 5 ? `${s.endTime}:00` : s.endTime,
    }));

    let finalInstructorId: number | undefined = undefined;
    if (isOwner && data.instructorId) {
      const parsedId = Number(data.instructorId);
      if (!isNaN(parsedId) && parsedId > 0) {
        finalInstructorId = parsedId;
      }
    }

    const requestData: CreateLectureRequest = {
      name: data.name,
      type: data.type,
      defaultPrice: data.defaultPrice,
      defaultDuration: data.defaultDuration,
      instructorId: finalInstructorId,
      schedules: formattedSchedules,
      studentIds: selectedStudentIds,
    };
    
    mutation.mutate(requestData);
  };

  const onError = (errors: any) => {
    console.error('Validation Errors:', errors);
    alert('입력 정보를 확인해주세요.');
  };

  const adjustPrice = (amount: number) => {
    const current = getValues('defaultPrice');
    setValue('defaultPrice', Math.max(0, current + amount));
  };

  const adjustDuration = (amount: number) => {
    const current = getValues('defaultDuration');
    setValue('defaultDuration', Math.max(10, current + amount));
  };

  const toggleStudent = (studentId: number) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleQuickRegisterSuccess = async (studentId: number) => {
    await queryClient.invalidateQueries({ queryKey: ['students'] });
    setSelectedStudentIds(prev => [...prev, studentId]);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">강의 개설</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">기본 정보</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                강의명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 중등 수학 A반"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강의 유형 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="BOARD"
                    {...register('type')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">판서 수업 (고정 시간표)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="INDIV"
                    {...register('type')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">개별 진도 (유동 시간표)</span>
                </label>
              </div>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
            </div>

            {lectureType === 'INDIV' && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-blue-800">
                    수강생 배정 (선택)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickRegisterModalOpen(true)}
                    className="text-xs bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded hover:bg-blue-50"
                  >
                    + 학생 간편 등록
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-md p-2 space-y-1">
                  {students?.map((student) => (
                    <label key={student.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {student.name} ({student.school} {student.grade})
                      </span>
                    </label>
                  ))}
                  {students?.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">등록된 학생이 없습니다.</p>
                  )}
                </div>
                <p className="mt-1 text-xs text-blue-600">
                  * 선택한 학생들은 강의 생성과 동시에 수강생으로 등록됩니다.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                회차당 기본 단가 (원)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustPrice(-10000)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600"
                >
                  -1만
                </button>
                <input
                  type="number"
                  {...register('defaultPrice', { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-center"
                />
                <button
                  type="button"
                  onClick={() => adjustPrice(10000)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600"
                >
                  +1만
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                기본 수업 시간 (분)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustDuration(-30)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600"
                >
                  -30분
                </button>
                <input
                  type="number"
                  {...register('defaultDuration', { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-center"
                />
                <button
                  type="button"
                  onClick={() => adjustDuration(30)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600"
                >
                  +30분
                </button>
              </div>
            </div>

            {isOwner && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  담당 강사
                </label>
                <select
                  {...register('instructorId')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">본인 (원장)</option>
                  {instructors?.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name} ({instructor.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-medium text-gray-900">정규 시간표</h3>
              <button
                type="button"
                onClick={() => append({ dayOfWeek: 'MONDAY', startTime: '14:00', endTime: '16:00' })}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + 시간표 추가
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-md">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">요일</label>
                  <select
                    {...register(`schedules.${index}.dayOfWeek`)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {DAY_OPTIONS.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">시작 시간</label>
                  <input
                    type="time"
                    {...register(`schedules.${index}.startTime`)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">종료 시간</label>
                  <input
                    type="time"
                    {...register(`schedules.${index}.endTime`)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="삭제"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            {errors.schedules && <p className="text-sm text-red-600">{errors.schedules.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/lectures')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isSubmitting ? '개설 중...' : '강의 개설하기'}
            </button>
          </div>
        </form>
      </div>

      {/* 간편 등록 모달 */}
      <StudentQuickRegisterModal
        isOpen={isQuickRegisterModalOpen}
        onClose={() => setIsQuickRegisterModalOpen(false)}
        onSuccess={handleQuickRegisterSuccess}
      />
    </div>
  );
};

export default LectureCreatePage;

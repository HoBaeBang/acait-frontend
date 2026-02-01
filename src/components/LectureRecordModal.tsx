import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRecord, LectureRecordRequest } from '../api/recordApi';

interface LectureRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectureId: number;
  lectureName?: string; // 추가됨
  studentId: number;
  studentName: string;
  date: string;
  startTime: string;
  endTime: string;
  onEditSchedule?: () => void;
}

const LectureRecordModal: React.FC<LectureRecordModalProps> = ({
  isOpen,
  onClose,
  lectureId,
  lectureName,
  studentId,
  studentName,
  date,
  startTime,
  endTime,
  onEditSchedule,
}) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<LectureRecordRequest>({
    defaultValues: {
      attendanceStatus: 'ATTENDED',
      actualStartTime: startTime,
      actualEndTime: endTime,
    }
  });

  const mutation = useMutation({
    mutationFn: createRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectureEvents'] });
      alert('수업 기록이 저장되었습니다.');
      onClose();
      reset();
    },
    onError: () => {
      alert('저장에 실패했습니다.');
    },
  });

  const onSubmit = (data: LectureRecordRequest) => {
    mutation.mutate({
      ...data,
      lectureId,
      studentId,
      date,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  수업 기록 ({lectureName || '강의'} - {studentName})
                </h3>
                {onEditSchedule && (
                  <button
                    type="button"
                    onClick={onEditSchedule}
                    className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
                  >
                    📅 일정 변경
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-4">{date} {startTime} ~ {endTime}</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* 출결 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">출결 상태</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center">
                      <input type="radio" value="ATTENDED" {...register('attendanceStatus')} className="h-4 w-4 text-blue-600" />
                      <span className="ml-2 text-sm text-gray-700">출석</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" value="LATE" {...register('attendanceStatus')} className="h-4 w-4 text-yellow-600" />
                      <span className="ml-2 text-sm text-gray-700">지각</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" value="ABSENT" {...register('attendanceStatus')} className="h-4 w-4 text-red-600" />
                      <span className="ml-2 text-sm text-gray-700">결석</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" value="REQ_MAKEUP" {...register('attendanceStatus')} className="h-4 w-4 text-purple-600" />
                      <span className="ml-2 text-sm text-gray-700 font-bold text-purple-700">보강 필요</span>
                    </label>
                  </div>
                </div>

                {/* 실제 시간 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">시작 시간</label>
                    <input type="time" {...register('actualStartTime')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">종료 시간</label>
                    <input type="time" {...register('actualEndTime')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                </div>

                {/* 수업 일지 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">수업 일지</label>
                  <textarea
                    {...register('dailyLog')}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="진도 내용, 특이사항 등"
                  />
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:col-start-2 sm:text-sm"
                  >
                    저장
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

export default LectureRecordModal;

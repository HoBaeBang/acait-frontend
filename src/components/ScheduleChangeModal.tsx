import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSchedule, UpdateScheduleRequest } from '../api/lectureApi';

interface ScheduleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string; // 스케줄 ID (또는 이벤트 ID)
  currentDate: string; // 현재 날짜 (YYYY-MM-DD)
  currentStartTime: string; // 현재 시작 시간 (HH:mm)
  currentEndTime: string; // 현재 종료 시간 (HH:mm)
  originalStart: string; // 원래 시작 날짜 (YYYY-MM-DD) - INSTANCE 변경 시 targetDate로 사용
}

interface ChangeFormData {
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  scope: 'INSTANCE' | 'SERIES';
}

const ScheduleChangeModal: React.FC<ScheduleChangeModalProps> = ({
  isOpen,
  onClose,
  scheduleId,
  currentDate,
  currentStartTime,
  currentEndTime,
  originalStart,
}) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, setValue } = useForm<ChangeFormData>({
    defaultValues: {
      newDate: currentDate,
      newStartTime: currentStartTime,
      newEndTime: currentEndTime,
      scope: 'INSTANCE',
    }
  });

  // 모달이 열릴 때마다 초기값 재설정
  useEffect(() => {
    if (isOpen) {
      reset({
        newDate: currentDate,
        newStartTime: currentStartTime,
        newEndTime: currentEndTime,
        scope: 'INSTANCE',
      });
    }
  }, [isOpen, currentDate, currentStartTime, currentEndTime, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ChangeFormData) => {
      const requestData: UpdateScheduleRequest = {
        startTime: data.newStartTime,
        endTime: data.newEndTime,
        // INSTANCE 변경 시에는 원래 날짜(originalStart)를 targetDate로 보냄
        // SERIES 변경 시에는 변경하려는 날짜(newDate)를 targetDate로 보냄 (사실 SERIES는 targetDate가 크게 중요하지 않지만)
        targetDate: data.scope === 'INSTANCE' ? originalStart : data.newDate,
        scope: data.scope,
        // 날짜 변경이 포함된 경우, 백엔드 API가 newDate 필드를 지원해야 함.
        // 현재 UpdateScheduleRequest에는 newDate 필드가 없음.
        // -> 백엔드 ScheduleException에 newDate 필드가 있으므로, API 요청에도 newDate를 추가해야 함.
        // (api/lectureApi.ts 수정 필요)
        newDate: data.newDate, 
      };
      return updateSchedule(scheduleId, requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectureEvents'] });
      alert('일정이 변경되었습니다.');
      onClose();
    },
    onError: () => {
      alert('일정 변경에 실패했습니다.');
    },
  });

  const onSubmit = (data: ChangeFormData) => {
    mutation.mutate(data);
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
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                일정 변경
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">날짜</label>
                  <input
                    type="date"
                    {...register('newDate')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">시작 시간</label>
                    <input
                      type="time"
                      {...register('newStartTime')}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">종료 시간</label>
                    <input
                      type="time"
                      {...register('newEndTime')}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">변경 범위</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="INSTANCE"
                        {...register('scope')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">이 일정만 변경</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="SERIES"
                        {...register('scope')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">앞으로의 모든 일정 변경</span>
                    </label>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:col-start-2 sm:text-sm"
                  >
                    변경 저장
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

export default ScheduleChangeModal;

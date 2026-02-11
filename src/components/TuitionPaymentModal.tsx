import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTuitionPayment, TuitionPaymentRequest } from '../api/tuitionApi';

interface TuitionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
}

const TuitionPaymentModal: React.FC<TuitionPaymentModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
}) => {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const currentYearMonth = today.substring(0, 7);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TuitionPaymentRequest>({
    defaultValues: {
      amount: 0,
      paymentDate: today,
      yearMonth: currentYearMonth,
      memo: '',
    }
  });

  const mutation = useMutation({
    mutationFn: (data: TuitionPaymentRequest) => createTuitionPayment(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentBalance', studentId] });
      alert('수납이 완료되었습니다.');
      onClose();
      reset();
    },
    onError: () => {
      alert('수납 처리에 실패했습니다.');
    },
  });

  const onSubmit = (data: TuitionPaymentRequest) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              수강료 납부 ({studentName})
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">납부 금액</label>
                <input
                  type="number"
                  {...register('amount', { required: '금액을 입력해주세요.', min: 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">납부일</label>
                <input
                  type="date"
                  {...register('paymentDate', { required: '납부일을 선택해주세요.' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.paymentDate && <p className="mt-1 text-sm text-red-600">{errors.paymentDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">대상 월</label>
                <input
                  type="month"
                  {...register('yearMonth', { required: '대상 월을 선택해주세요.' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">어떤 달의 수강료로 처리할지 선택하세요.</p>
                {errors.yearMonth && <p className="mt-1 text-sm text-red-600">{errors.yearMonth.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">메모</label>
                <input
                  type="text"
                  {...register('memo')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="특이사항 (선택)"
                />
              </div>
            </div>

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:col-start-2 sm:text-sm"
              >
                납부하기
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TuitionPaymentModal;

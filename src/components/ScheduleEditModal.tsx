import React from 'react';

interface ScheduleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: 'INSTANCE' | 'SERIES') => void;
}

const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* 배경 오버레이 */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* 모달 컨텐츠 */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              {/* 아이콘 (질문/선택) */}
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                반복 일정 수정
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  이 일정은 반복되는 정규 수업입니다.<br />
                  어떻게 변경하시겠습니까?
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-4 flex flex-col gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              onClick={() => onConfirm('INSTANCE')}
            >
              <div className="text-left w-full">
                <span className="block font-bold text-gray-900">이 일정만 변경</span>
                <span className="block text-xs text-gray-500">이번 주만 시간이 변경된 경우 (예외 처리)</span>
              </div>
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              onClick={() => onConfirm('SERIES')}
            >
              <div className="text-left w-full">
                <span className="block font-bold text-gray-900">앞으로의 모든 일정 변경</span>
                <span className="block text-xs text-gray-500">시간표 자체가 바뀐 경우 (마스터 스케줄 수정)</span>
              </div>
            </button>
            
            <button
              type="button"
              className="mt-2 w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-gray-100 text-base font-medium text-gray-700 hover:bg-gray-200 focus:outline-none sm:text-sm"
              onClick={onClose}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditModal;

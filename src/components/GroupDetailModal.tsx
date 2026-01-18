import React from 'react';
import { LectureEvent } from '../api/lectureApi';

interface GroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subEvents: LectureEvent[];
  onEdit: (event: LectureEvent) => void; // 개별 수정 핸들러
}

const GroupDetailModal: React.FC<GroupDetailModalProps> = ({ isOpen, onClose, subEvents, onEdit }) => {
  if (!isOpen) return null;

  // 시간 포맷팅 (HH:mm)
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toTimeString().slice(0, 5);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                통합 일정 상세 ({subEvents.length}개)
              </h3>
              
              <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {subEvents.map((event) => (
                  <li key={event.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {formatTime(event.start)} ~ {formatTime(event.end)}
                      </p>
                      <p className="text-xs text-gray-400">{event.extendedProps?.instructor}</p>
                    </div>
                    <button
                      onClick={() => onEdit(event)}
                      className="ml-4 bg-white border border-gray-300 rounded-md shadow-sm px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                      수정
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailModal;

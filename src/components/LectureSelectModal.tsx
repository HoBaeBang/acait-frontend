import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLectures, Lecture } from '../api/lectureApi';
import clsx from 'clsx';

interface LectureSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lectureId: number) => void;
  enrolledLectureIds: number[]; // 이미 수강 중인 강의 ID 목록 (중복 선택 방지)
}

const LectureSelectModal: React.FC<LectureSelectModalProps> = ({ isOpen, onClose, onSelect, enrolledLectureIds }) => {
  const { data: lectures, isLoading } = useQuery({
    queryKey: ['lectures'],
    queryFn: getLectures,
    enabled: isOpen, // 모달이 열릴 때만 조회
  });

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
                강의 추가
              </h3>
              
              {isLoading ? (
                <div className="text-center py-8">로딩 중...</div>
              ) : (
                <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                  {lectures?.map((lecture, index) => {
                    const isEnrolled = enrolledLectureIds.includes(lecture.lectureId);
                    // key 중복 방지를 위해 index 조합 (데이터 무결성 이슈 대비)
                    const uniqueKey = lecture.lectureId ? `${lecture.lectureId}-${index}` : `lecture-${index}`;
                    
                    return (
                      <li key={uniqueKey} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lecture.name}</p>
                          <p className="text-xs text-gray-500">
                            {lecture.type === 'BOARD' ? '판서' : '개별'} | {lecture.instructorName}
                          </p>
                        </div>
                        <button
                          onClick={() => !isEnrolled && onSelect(lecture.lectureId)}
                          disabled={isEnrolled}
                          className={clsx(
                            "ml-4 px-3 py-1 text-xs font-medium rounded-md focus:outline-none",
                            isEnrolled 
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          )}
                        >
                          {isEnrolled ? '수강 중' : '선택'}
                        </button>
                      </li>
                    );
                  })}
                  {lectures?.length === 0 && (
                    <li className="py-4 text-center text-gray-500 text-sm">개설된 강의가 없습니다.</li>
                  )}
                </ul>
              )}

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

export default LectureSelectModal;

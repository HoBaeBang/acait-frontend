import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMakeupRequiredStudents, createRecord } from '../api/recordApi';
import { createLecture } from '../api/lectureApi'; // 정규 수업 생성용 (가정)

interface MakeupScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string; // 선택한 날짜 (YYYY-MM-DD)
  startTime: string; // 선택한 시간 (HH:mm)
}

const MakeupScheduleModal: React.FC<MakeupScheduleModalProps> = ({ isOpen, onClose, date, startTime }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'REGULAR' | 'MAKEUP'>('REGULAR');
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  // 보강 필요 학생 목록 조회
  const { data: makeupStudents } = useQuery({
    queryKey: ['makeupRequired'],
    queryFn: getMakeupRequiredStudents,
    enabled: isOpen && activeTab === 'MAKEUP', // 모달이 열리고 보강 탭일 때만 조회
  });

  // 보강 생성 뮤테이션 (실제로는 createRecord를 사용하여 MAKEUP 상태로 저장)
  // 주의: 보강은 '수업(Lecture)'을 만드는 게 아니라 '기록(Record)'을 미리 만드는 개념일 수도 있고,
  // 별도의 '보강용 일회성 수업'을 만들고 거기에 기록을 연결하는 방식일 수도 있음.
  // 여기서는 v5.1 명세에 따라 "보강 수업(MAKEUP) 생성 시 원본 결석 레코드와 Link"라고 했으므로,
  // 1. 일회성 보강 수업 생성 -> 2. 해당 수업에 대한 Record 생성 (Link 포함) 순서가 될 수 있음.
  // 하지만 간소화를 위해 바로 Record를 생성하는 API를 호출한다고 가정.
  
  const makeupMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRecordId) return;
      const student = makeupStudents?.find(s => s.recordId === selectedRecordId);
      if (!student) return;

      // 보강 기록 생성 요청
      await createRecord({
        lectureId: 0, // 보강용 가상 강의 ID (백엔드 처리 필요) 또는 실제 강의 ID
        studentId: student.studentId,
        date: date,
        attendanceStatus: 'MAKEUP',
        actualStartTime: startTime,
        actualEndTime: startTime, // 종료 시간은 일단 시작 시간과 동일하게 (수정 필요)
        linkedRecordId: selectedRecordId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectureEvents'] });
      alert('보강 일정이 잡혔습니다.');
      onClose();
    },
    onError: () => {
      alert('보강 일정 생성에 실패했습니다.');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          
          {/* 탭 메뉴 */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`flex-1 py-2 text-sm font-medium text-center border-b-2 ${activeTab === 'REGULAR' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
              onClick={() => setActiveTab('REGULAR')}
            >
              정규 수업 생성
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium text-center border-b-2 ${activeTab === 'MAKEUP' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
              onClick={() => setActiveTab('MAKEUP')}
            >
              보강 잡기
            </button>
          </div>

          {activeTab === 'REGULAR' ? (
            <div className="text-center py-8 text-gray-500">
              <p>정규 수업 생성 기능은<br/>[강의 관리] 메뉴를 이용해주세요.</p>
              <button onClick={onClose} className="mt-4 text-blue-600 hover:underline">닫기</button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">보강 대상 선택</h3>
              <p className="text-sm text-gray-500">선택한 시간: {date} {startTime}</p>

              {makeupStudents?.length === 0 ? (
                <p className="text-center py-4 text-gray-500">보강이 필요한 학생이 없습니다.</p>
              ) : (
                <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                  {makeupStudents?.map((student) => (
                    <li 
                      key={student.recordId} 
                      className={`py-3 px-2 cursor-pointer hover:bg-gray-50 ${selectedRecordId === student.recordId ? 'bg-blue-50 ring-1 ring-blue-500' : ''}`}
                      onClick={() => setSelectedRecordId(student.recordId)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">{student.studentName}</span>
                        <span className="text-sm text-gray-500">{student.absentDate} 결석</span>
                      </div>
                      <p className="text-xs text-gray-400">{student.lectureName}</p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  disabled={!selectedRecordId}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none disabled:bg-gray-300 sm:col-start-2 sm:text-sm"
                  onClick={() => makeupMutation.mutate()}
                >
                  보강 확정
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={onClose}
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakeupScheduleModal;

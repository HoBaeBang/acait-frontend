import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLectureStudents } from '../api/lectureApi';
import { removeStudent, enrollStudent } from '../api/enrollmentApi';
import { getStudents } from '../api/studentApi';
import clsx from 'clsx';

interface LectureStudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectureId: number;
  lectureName: string;
}

const LectureStudentManagementModal: React.FC<LectureStudentManagementModalProps> = ({
  isOpen,
  onClose,
  lectureId,
  lectureName,
}) => {
  const queryClient = useQueryClient();
  const [isAddMode, setIsAddMode] = useState(false);

  // 강의 수강생 목록 조회
  const { data: enrolledStudents, isLoading } = useQuery({
    queryKey: ['lectureStudents', lectureId],
    queryFn: () => getLectureStudents(lectureId),
    enabled: isOpen,
  });

  // 전체 학생 목록 조회 (추가용)
  const { data: allStudents } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
    enabled: isAddMode,
  });

  // 수강생 삭제 뮤테이션
  const removeMutation = useMutation({
    mutationFn: (studentNumber: string) => removeStudent(lectureId, studentNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectureStudents', lectureId] });
      alert('수강 취소되었습니다.');
    },
    onError: () => {
      alert('수강 취소에 실패했습니다.');
    },
  });

  // 수강생 추가 뮤테이션
  const addMutation = useMutation({
    mutationFn: (studentNumber: string) => enrollStudent(lectureId, studentNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectureStudents', lectureId] });
      alert('수강생이 추가되었습니다.');
      setIsAddMode(false);
    },
    onError: () => {
      alert('수강생 추가에 실패했습니다.');
    },
  });

  const handleRemove = (studentNumber: string) => {
    if (window.confirm('정말 수강을 취소하시겠습니까?')) {
      removeMutation.mutate(studentNumber);
    }
  };

  const handleAdd = (studentNumber: string) => {
    addMutation.mutate(studentNumber);
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
                  수강생 관리 ({lectureName})
                </h3>
                <button
                  onClick={() => setIsAddMode(!isAddMode)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {isAddMode ? '목록 보기' : '+ 수강생 추가'}
                </button>
              </div>

              {isAddMode ? (
                // 학생 추가 모드
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {allStudents?.map((student) => {
                      const isEnrolled = enrolledStudents?.some(s => s.studentNumber === student.studentNumber);
                      return (
                        <li key={student.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.school} {student.grade}</p>
                          </div>
                          <button
                            onClick={() => !isEnrolled && handleAdd(student.studentNumber)}
                            disabled={isEnrolled}
                            className={clsx(
                              "px-3 py-1 text-xs font-medium rounded-md focus:outline-none",
                              isEnrolled 
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            )}
                          >
                            {isEnrolled ? '수강 중' : '추가'}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                // 수강생 목록 모드
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  {isLoading ? (
                    <div className="text-center py-8">로딩 중...</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {enrolledStudents?.map((student) => (
                        <li key={student.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.parentPhone}</p>
                          </div>
                          <button
                            onClick={() => handleRemove(student.studentNumber)}
                            className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                          >
                            삭제
                          </button>
                        </li>
                      ))}
                      {enrolledStudents?.length === 0 && (
                        <li className="py-4 text-center text-gray-500 text-sm">수강생이 없습니다.</li>
                      )}
                    </ul>
                  )}
                </div>
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

export default LectureStudentManagementModal;

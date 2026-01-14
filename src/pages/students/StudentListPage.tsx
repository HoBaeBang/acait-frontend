import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getStudents, deleteStudent } from '../../api/studentApi';

const StudentListPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // 학생 목록 조회
  const { data: students, isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  });

  // 학생 삭제
  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      alert('삭제되었습니다.');
    },
    onError: () => {
      alert('삭제에 실패했습니다.');
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  // 검색 필터링
  const filteredStudents = students?.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.school?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="p-8 text-center">로딩 중...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">데이터를 불러오는데 실패했습니다.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">수강생 관리</h1>
        <Link
          to="/students/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 수강생 등록
        </Link>
      </div>

      {/* 검색창 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="이름 또는 학교로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 테이블 */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학교/학년</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학부모 연락처</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생일(인증용)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents?.map((student) => (
              <tr key={student.studentId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.school} {student.grade && `(${student.grade})`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.parentPhone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.birthDate || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    to={`/students/${student.studentId}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(student.studentId)}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? '검색 결과가 없습니다.' : '등록된 수강생이 없습니다.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentListPage;

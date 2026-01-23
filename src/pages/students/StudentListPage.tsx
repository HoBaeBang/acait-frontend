import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getStudents } from '../../api/studentApi';
import { GRADE_LABEL } from '../../constants/grade';
import clsx from 'clsx';

const StudentListPage = () => {
  const navigate = useNavigate();
  const { data: students, isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents,
  });

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

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학번</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학교/학년</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students?.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.studentNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.school} / {GRADE_LABEL[student.grade] || student.grade}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.parentPhone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={clsx(
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                    student.status === 'ATTENDING' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  )}>
                    {student.status === 'ATTENDING' ? '재원' : '퇴원'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => navigate(`/students/${student.studentNumber}/edit`)} // id -> studentNumber 수정
                    className="text-blue-600 hover:text-blue-900"
                  >
                    상세/수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students?.length === 0 && (
          <div className="text-center py-12 text-gray-500">등록된 수강생이 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default StudentListPage;

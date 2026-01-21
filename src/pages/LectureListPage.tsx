import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getLectures } from '../api/lectureApi';
import { useAuthStore } from '../stores/authStore';
import clsx from 'clsx';

const LectureListPage = () => {
  const { user } = useAuthStore();
  
  const { data: lectures, isLoading, isError } = useQuery({
    queryKey: ['lectures', user?.role],
    queryFn: () => getLectures(user?.role),
  });

  if (isLoading) return <div className="p-8 text-center">로딩 중...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">데이터를 불러오는데 실패했습니다.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">강의 관리</h1>
        <Link
          to="/lectures/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 강의 개설
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강의명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담당 강사</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기본 정보</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lectures?.map((lecture) => (
              <tr key={lecture.lectureId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{lecture.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lecture.instructorName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={clsx(
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                    lecture.type === 'BOARD' ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                  )}>
                    {lecture.type === 'BOARD' ? '판서 수업' : '개별 진도'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lecture.defaultDuration}분 / {lecture.defaultPrice.toLocaleString()}원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">수정</button>
                  <button className="text-gray-600 hover:text-gray-900">수강생 관리</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lectures?.length === 0 && (
          <div className="text-center py-12 text-gray-500">개설된 강의가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default LectureListPage;

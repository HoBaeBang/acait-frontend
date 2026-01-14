import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInstructors, approveInstructor, Instructor } from '../../api/adminApi';
import clsx from 'clsx';

const InstructorPage = () => {
  const queryClient = useQueryClient();

  // 강사 목록 조회 쿼리
  const { data: instructors, isLoading, isError } = useQuery({
    queryKey: ['instructors'],
    queryFn: getInstructors,
  });

  // 승인 처리 뮤테이션
  const approveMutation = useMutation({
    mutationFn: approveInstructor,
    onSuccess: () => {
      // 성공 시 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      alert('승인 처리되었습니다.');
    },
    onError: () => {
      alert('승인 처리에 실패했습니다.');
    },
  });

  const handleApprove = (id: number) => {
    if (window.confirm('해당 강사를 승인하시겠습니까?')) {
      approveMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center">로딩 중...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">데이터를 불러오는데 실패했습니다.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">강사 관리 (승인)</h1>

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {instructors?.map((instructor) => (
              <tr key={instructor.memberId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                  <div className="text-xs text-gray-500">{instructor.role === 'ROLE_ADMIN' ? '원장' : '강사'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {instructor.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {instructor.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={clsx(
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                    instructor.status === 'ACTIVE' ? "bg-green-100 text-green-800" : 
                    instructor.status === 'PENDING' ? "bg-yellow-100 text-yellow-800" : 
                    "bg-red-100 text-red-800"
                  )}>
                    {instructor.status === 'ACTIVE' ? '승인됨' : 
                     instructor.status === 'PENDING' ? '승인 대기' : '거절됨'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(instructor.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {instructor.status === 'PENDING' && (
                    <button
                      onClick={() => handleApprove(instructor.memberId)}
                      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-xs transition-colors"
                    >
                      승인하기
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {instructors?.length === 0 && (
          <div className="text-center py-8 text-gray-500">등록된 강사가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default InstructorPage;

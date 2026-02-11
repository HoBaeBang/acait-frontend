import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInstructors, approveInstructor, updateMemberRole } from '../../api/adminApi';
import clsx from 'clsx';
import PlanLimitModal from '../../components/PlanLimitModal';

const InstructorPage = () => {
  const queryClient = useQueryClient();
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  const { data: instructors, isLoading, isError } = useQuery({
    queryKey: ['instructors'],
    queryFn: getInstructors,
  });

  const approveMutation = useMutation({
    mutationFn: approveInstructor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      alert('승인 처리되었습니다.');
    },
    onError: (error: any) => {
      if (error.response?.status === 403 && error.response?.data?.code === 'PLAN_LIMIT') {
        setIsLimitModalOpen(true);
      } else {
        alert('승인 처리에 실패했습니다.');
      }
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number, role: string }) => updateMemberRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      // alert('역할이 변경되었습니다.'); // 드롭다운 변경 시 알림은 생략하거나 토스트로 대체 가능
    },
    onError: () => {
      alert('역할 변경에 실패했습니다.');
    },
  });

  const handleApprove = (id: number) => {
    if (window.confirm('해당 강사를 승인하시겠습니까?')) {
      approveMutation.mutate(id);
    }
  };

  const handleRoleChange = (id: number, newRole: string) => {
    roleMutation.mutate({ id, role: newRole });
  };

  if (isLoading) return <div className="p-8 text-center">로딩 중...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">데이터를 불러오는데 실패했습니다.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">강사/실장 관리</h1>

      <PlanLimitModal 
        isOpen={isLimitModalOpen} 
        onClose={() => setIsLimitModalOpen(false)} 
      />

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {instructors?.map((instructor) => (
              <tr key={instructor.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {instructor.role === 'ROLE_OWNER' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      원장
                    </span>
                  ) : (
                    <select
                      value={instructor.role}
                      onChange={(e) => handleRoleChange(instructor.id, e.target.value)}
                      className={clsx(
                        "block w-full pl-3 pr-10 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md",
                        instructor.role === 'ROLE_MANAGER' ? "bg-purple-50 text-purple-900" : "bg-white text-gray-900"
                      )}
                    >
                      <option value="ROLE_INSTRUCTOR">강사</option>
                      <option value="ROLE_MANAGER">실장</option>
                    </select>
                  )}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {instructor.status === 'PENDING' && (
                    <button
                      onClick={() => handleApprove(instructor.id)}
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

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  getDeductionItems, 
  createDeductionItem, 
  updateDeductionItem, 
  deleteDeductionItem,
  DeductionItem,
  DeductionItemRequest
} from '../api/settlementApi';
import { getMyAcademy } from '../api/adminApi';
import clsx from 'clsx';

const AcademySettingsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DeductionItem | null>(null);

  // 학원 정보 조회
  const { data: academyInfo } = useQuery({
    queryKey: ['myAcademy'],
    queryFn: getMyAcademy,
  });

  // 공제 항목 목록 조회
  const { data: deductionItems, isLoading, isError } = useQuery({
    queryKey: ['deductionItems'],
    queryFn: getDeductionItems,
  });

  // 생성 Mutation
  const createMutation = useMutation({
    mutationFn: createDeductionItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductionItems'] });
      closeModal();
      alert('공제 항목이 추가되었습니다.');
    },
    onError: () => alert('추가에 실패했습니다.'),
  });

  // 수정 Mutation
  const updateMutation = useMutation({
    mutationFn: updateDeductionItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductionItems'] });
      closeModal();
      alert('공제 항목이 수정되었습니다.');
    },
    onError: () => alert('수정에 실패했습니다.'),
  });

  // 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDeductionItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductionItems'] });
      alert('공제 항목이 삭제되었습니다.');
    },
    onError: () => alert('삭제에 실패했습니다.'),
  });

  const handleDelete = (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: DeductionItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const copyInviteCode = () => {
    if (academyInfo?.inviteCode) {
      navigator.clipboard.writeText(academyInfo.inviteCode);
      alert('초대 코드가 복사되었습니다.');
    }
  };

  if (isLoading) return <div className="p-8 text-center">로딩 중...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">데이터를 불러오는데 실패했습니다.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">학원 설정</h1>
      </div>

      {/* 학원 정보 섹션 */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">기본 정보</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            학원 이름 및 강사 초대 코드를 확인합니다.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">학원명</dt>
              <dd className="mt-1 text-sm text-gray-900">{academyInfo?.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">최대 인원</dt>
              <dd className="mt-1 text-sm text-gray-900">{academyInfo?.maxMembers}명</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">강사 초대 코드</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                <span className="bg-gray-100 px-3 py-1 rounded font-mono text-lg tracking-wider">
                  {academyInfo?.inviteCode}
                </span>
                <button
                  onClick={copyInviteCode}
                  className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
                >
                  복사하기
                </button>
              </dd>
              <p className="mt-2 text-xs text-gray-500">
                * 강사 회원가입 시 이 코드를 입력해야 가입 신청이 가능합니다.
              </p>
            </div>
          </dl>
        </div>
      </div>

      {/* 공제 항목 관리 섹션 */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">정산 공제 항목 관리</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              강사 정산 시 차감될 항목(세금, 운영비 등)을 설정합니다.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            + 항목 추가
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">항목명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">값</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deductionItems?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 text-sm">
                  등록된 공제 항목이 없습니다. (기본 3.3% 적용됨)
                </td>
              </tr>
            ) : (
              deductionItems?.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={clsx(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      item.type === 'PERCENT' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    )}>
                      {item.type === 'PERCENT' ? '비율(%)' : '고정 금액(원)'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.type === 'PERCENT' ? `${item.value}%` : `${item.value.toLocaleString()}원`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <DeductionItemModal
          isOpen={isModalOpen}
          onClose={closeModal}
          initialData={editingItem}
          onSubmit={(data) => {
            if (editingItem) {
              updateMutation.mutate({ id: editingItem.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
};

interface DeductionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: DeductionItem | null;
  onSubmit: (data: DeductionItemRequest) => void;
}

const DeductionItemModal: React.FC<DeductionItemModalProps> = ({ isOpen, onClose, initialData, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<DeductionItemRequest>({
    defaultValues: initialData || {
      name: '',
      type: 'PERCENT',
      value: 0,
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {initialData ? '공제 항목 수정' : '공제 항목 추가'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">항목명</label>
                <input
                  type="text"
                  {...register('name', { required: '항목명을 입력해주세요.' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="예: 소득세, 식대"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">유형</label>
                <select
                  {...register('type')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="PERCENT">비율 (%)</option>
                  <option value="FIXED_AMOUNT">고정 금액 (원)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">값</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('value', { required: '값을 입력해주세요.', min: 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>}
              </div>
            </div>

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:col-start-2 sm:text-sm"
              >
                저장
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcademySettingsPage;

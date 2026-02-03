import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchMaterials, createMaterial, CreateMaterialRequest } from '../api/materialApi';
import { useAuthStore } from '../stores/authStore';
import clsx from 'clsx';

const MaterialPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials', keyword],
    queryFn: () => searchMaterials(keyword),
    enabled: true, // 초기 로딩 시 전체 목록 조회 (keyword가 없으면 전체 조회하도록 API가 되어 있다면)
  });

  const createMutation = useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      alert('교재가 등록되었습니다.');
      setIsModalOpen(false);
    },
    onError: () => {
      alert('교재 등록에 실패했습니다.');
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    queryClient.invalidateQueries({ queryKey: ['materials'] });
  };

  // 배경색 배열 (파스텔 톤)
  const bgColors = [
    'bg-red-100 text-red-600',
    'bg-orange-100 text-orange-600',
    'bg-amber-100 text-amber-600',
    'bg-yellow-100 text-yellow-600',
    'bg-lime-100 text-lime-600',
    'bg-green-100 text-green-600',
    'bg-emerald-100 text-emerald-600',
    'bg-teal-100 text-teal-600',
    'bg-cyan-100 text-cyan-600',
    'bg-sky-100 text-sky-600',
    'bg-blue-100 text-blue-600',
    'bg-indigo-100 text-indigo-600',
    'bg-violet-100 text-violet-600',
    'bg-purple-100 text-purple-600',
    'bg-fuchsia-100 text-fuchsia-600',
    'bg-pink-100 text-pink-600',
    'bg-rose-100 text-rose-600',
  ];

  // 문자열로부터 색상 인덱스 추출 (일관된 색상 부여)
  const getColorClass = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % bgColors.length;
    return bgColors[index];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">교재 관리</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          + 교재 직접 등록
        </button>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="교재명, 저자, 출판사 검색"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <button
            type="submit"
            className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium"
          >
            검색
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">교재 정보를 불러오는 중...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {materials?.map((material) => (
            <div 
              key={material.materialId} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group"
            >
              <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
                {material.thumbnailUrl ? (
                  <img
                    src={material.thumbnailUrl}
                    alt={material.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // 이미지 로드 실패 시 기본 이미지로 대체 (DOM 조작)
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className={clsx(
                    "w-full h-full flex flex-col items-center justify-center p-4 text-center",
                    getColorClass(material.title)
                  )}>
                    <span className="text-4xl font-bold mb-2 opacity-80">
                      {material.title.charAt(0)}
                    </span>
                    <span className="text-xs font-medium opacity-60 px-2 truncate w-full">
                      {material.publisher || '출판사 미상'}
                    </span>
                  </div>
                )}
                {/* 이미지 로드 실패 시 보여줄 백업 요소 (초기엔 hidden) */}
                <div className={clsx(
                  "hidden w-full h-full absolute inset-0 flex flex-col items-center justify-center p-4 text-center",
                  getColorClass(material.title)
                )}>
                  <span className="text-4xl font-bold mb-2 opacity-80">
                    {material.title.charAt(0)}
                  </span>
                </div>

                {material.isAcademyExclusive && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                    학원 전용
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 h-12 leading-tight">
                  {material.title}
                </h3>
                <div className="text-sm text-gray-500 mb-2 truncate">
                  {material.author || '저자 미상'} | {material.publisher || '출판사 미상'}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-600">
                    {material.price ? `${material.price.toLocaleString()}원` : '가격 정보 없음'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {materials?.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 교재 등록 모달 */}
      {isModalOpen && (
        <CreateMaterialModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={(data) => createMutation.mutate(data)} 
        />
      )}
    </div>
  );
};

// 교재 등록 모달 컴포넌트 (내부 정의)
const CreateMaterialModal = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: CreateMaterialRequest) => void }) => {
  const [formData, setFormData] = useState<CreateMaterialRequest>({
    title: '',
    author: '',
    publisher: '',
    price: 0,
    isbn: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">교재 직접 등록</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">교재명 *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">저자</label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">출판사</label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">가격</label>
                <input
                  type="number"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ISBN</label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:col-start-2 sm:text-sm"
              >
                등록
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                onClick={onClose}
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

export default MaterialPage;

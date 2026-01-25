import { client } from './client';

export interface Material {
  materialId: number | string; // 외부 API 결과는 ID가 없을 수 있으므로 string 허용 (ISBN 등)
  title: string;
  author?: string;
  publisher?: string;
  price?: number;
  isbn?: string;
  thumbnailUrl?: string;
  isAcademyExclusive: boolean; // 학원 전용 여부
}

export interface CreateMaterialRequest {
  title: string;
  author?: string;
  publisher?: string;
  price?: number;
  isbn?: string;
  thumbnailUrl?: string;
}

// 교재 검색 (공용 + 전용)
export const searchMaterials = async (keyword: string): Promise<Material[]> => {
  const response = await client.get<any[]>('/materials/search', {
    params: { keyword },
  });
  
  // 백엔드 응답 매핑
  return response.data.map((item, index) => ({
    // ID가 없으면 ISBN 사용, 그것도 없으면 index 사용 (key 중복 방지)
    materialId: item.id || item.isbn || `temp-${index}`,
    title: item.title,
    author: item.author,
    publisher: item.publisher,
    price: item.price,
    isbn: item.isbn,
    thumbnailUrl: item.thumbnailUrl,
    isAcademyExclusive: item.isAcademyExclusive || false,
  }));
};

// 교재 등록 (학원 전용)
export const createMaterial = async (data: CreateMaterialRequest): Promise<Material> => {
  const response = await client.post<any>('/materials', data);
  const item = response.data;
  return {
    materialId: item.id,
    title: item.title,
    author: item.author,
    publisher: item.publisher,
    price: item.price,
    isbn: item.isbn,
    thumbnailUrl: item.thumbnailUrl,
    isAcademyExclusive: true,
  };
};

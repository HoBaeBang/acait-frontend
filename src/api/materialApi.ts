import { client } from './client';

export interface Material {
  materialId: number;
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
  const response = await client.get<Material[]>('/materials/search', {
    params: { keyword },
  });
  return response.data;
};

// 교재 등록 (학원 전용)
export const createMaterial = async (data: CreateMaterialRequest): Promise<Material> => {
  const response = await client.post<Material>('/materials', data);
  return response.data;
};

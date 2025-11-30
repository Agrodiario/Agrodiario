import { apiClient } from '../config/api.client';
import {
  Culture,
  CreateCultureDto,
  UpdateCultureDto,
  CulturesListResponse,
  CropSearchResult,
} from '../types/culture.types';

class CultureService {
  async create(data: CreateCultureDto): Promise<{ message: string; data: Culture }> {
    const response = await apiClient.post<{ message: string; data: Culture }>('/cultures', data);
    return response.data;
  }

  async findAll(
    page: number = 1,
    limit: number = 100,
    search?: string,
    sortBy?: string,
    order?: 'ASC' | 'DESC'
  ): Promise<CulturesListResponse> {
    const response = await apiClient.get<CulturesListResponse>('/cultures', {
      params: { page, limit, search, sortBy, order },
    });
    return response.data;
  }

  async findOne(id: string): Promise<Culture> {
    const response = await apiClient.get<Culture>(`/cultures/${id}`);
    return response.data;
  }

  async update(
    id: string,
    data: UpdateCultureDto
  ): Promise<{ message: string; data: Culture }> {
    const response = await apiClient.patch<{ message: string; data: Culture }>(
      `/cultures/${id}`,
      data
    );
    return response.data;
  }

  async remove(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/cultures/${id}`);
    return response.data;
  }

  async searchCultureNames(query: string, limit: number = 10): Promise<CropSearchResult[]> {
    const response = await apiClient.get<CropSearchResult[]>('/cultures/search/culture-names', {
      params: { q: query, limit },
    });
    return response.data;
  }
}

export const cultureService = new CultureService();

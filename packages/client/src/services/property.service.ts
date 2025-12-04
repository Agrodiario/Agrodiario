// src/services/property.service.ts
import { apiClient } from '../config/api.client';
import {
  Property,
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertiesListResponse,
} from '../types/property.types';

class PropertyService {
  async create(data: CreatePropertyDto): Promise<Property> {
    const response = await apiClient.post<Property>('/properties', data);
    return response.data;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    order: 'ASC' | 'DESC' = 'DESC',
    search: string = ''
  ): Promise<PropertiesListResponse> {

    const response = await apiClient.get<PropertiesListResponse>('/properties', {
      params: {
        page,
        limit,
        order,
        search: encodeURIComponent(search),
      },
    });
    return response.data;
  }

  async findOne(id: string): Promise<Property> {
    const response = await apiClient.get<Property>(`/properties/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdatePropertyDto): Promise<Property> {
    const response = await apiClient.patch<Property>(`/properties/${id}`, data);
    return response.data;
  }

  async remove(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/properties/${id}`);
    return response.data;
  }

  async hardRemove(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/properties/${id}/hard`);
    return response.data;
  }
}

export const propertyService = new PropertyService();
import {
  CreateProductApplicationDto,
  ProductApplication,
  ProductApplicationFormData,
  ProductApplicationsListResponse
} from "../types/productApplication.types.ts";
import { apiClient } from "@/config/api.client.ts";

class ProductApplicationService {
  async create(data: ProductApplicationFormData): Promise<CreateProductApplicationDto> {
    const response = await apiClient.post<ProductApplication>('/product-applications', data);
    return response.data
  }
  async findAll(page: number = 1, limit: number = 10): Promise<ProductApplicationsListResponse> {
    const response = await apiClient.get<ProductApplicationsListResponse>('/product-applications', {
      params: { page, limit },
    });
    return response.data
  }

  async findOne(id: string): Promise<ProductApplication> {
    const response = await apiClient.get<ProductApplication>(`/product-applications/${id}`);
    return response.data;
  }

  async update(id: string, data: ProductApplicationFormData): Promise<ProductApplication> {
    const response = await apiClient.patch<ProductApplication>(`/product-applications/${id}`, data);
    return response.data;
  }

  async remove(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/product-applications/${id}`);
    return response.data
  }
}

export const productApplicationService = new ProductApplicationService();

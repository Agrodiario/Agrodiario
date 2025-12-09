import {
  ProductApplication,
  ProductApplicationFormData,
  ProductApplicationsListResponse
} from "../types/productApplication.types.ts";
import { apiClient } from "@/config/api.client.ts";
import { Property } from "@/types/property.types";
import { Culture } from "@/types/culture.types";

// Interface estendida
interface ProductApplicationWithDetails extends ProductApplication {
  propertyName?: string;
  cultureName?: string;
}

class ProductApplicationService {
  async create(data: ProductApplicationFormData): Promise<ProductApplicationFormData> {
    const response = await apiClient.post<ProductApplication>('/product-applications', data);
    return response.data
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    order: 'ASC' | 'DESC' = 'DESC',
    search: string = ''
  ): Promise<ProductApplicationsListResponse> {
    const response = await apiClient.get<ProductApplicationsListResponse>('/product-applications', {
      params: { page, limit, order, search },
    });
    
    // Se o backend não retornar nomes, buscar separadamente
    if (response.data.data.length > 0 && !response.data.data[0].propertyName) {
      const applicationsWithDetails = await this.enrichApplications(response.data.data);
      return {
        ...response.data,
        data: applicationsWithDetails
      };
    }
    
    return response.data;
  }

  private async enrichApplications(applications: ProductApplication[]): Promise<ProductApplicationWithDetails[]> {
    try {
      // Buscar propriedades
      const propertiesResponse = await apiClient.get<{ data: Property[] }>('/properties', {
        params: { limit: 1000 } // Buscar todas
      });
      const propertiesMap = new Map(propertiesResponse.data.data.map(p => [p.id, p.name]));
      
      // Buscar culturas
      const culturesResponse = await apiClient.get<{ data: Culture[] }>('/cultures', {
        params: { limit: 1000 } // Buscar todas
      });
      const culturesMap = new Map(culturesResponse.data.data.map(c => [c.id, c.cultureName]));
      
      // Enriquecer aplicações com nomes
      return applications.map(app => ({
        ...app,
        propertyName: propertiesMap.get(app.propertyId) || 'N/A',
        cultureName: culturesMap.get(app.cultureId) || 'N/A',
      }));
    } catch (error) {
      console.error('Erro ao buscar dados relacionados:', error);
      // Retornar sem nomes em caso de erro
      return applications.map(app => ({
        ...app,
        propertyName: 'Erro ao buscar',
        cultureName: 'Erro ao buscar',
      }));
    }
  }

  async findOne(id: string): Promise<ProductApplicationWithDetails> {
    const response = await apiClient.get<ProductApplication>(`/product-applications/${id}`);
    const app = response.data;
    
    // Buscar nomes para esta aplicação específica
    const [propertyResponse, cultureResponse] = await Promise.all([
      apiClient.get<Property>(`/properties/${app.propertyId}`).catch(() => null),
      apiClient.get<Culture>(`/cultures/${app.cultureId}`).catch(() => null),
    ]);
    
    return {
      ...app,
      propertyName: propertyResponse?.data?.name || 'N/A',
      cultureName: cultureResponse?.data?.cultureName || 'N/A',
    };
  }

  async update(id: string, data: ProductApplicationFormData): Promise<ProductApplicationFormData> {
    const response = await apiClient.patch<ProductApplication>(`/product-applications/${id}`, data);
    return response.data;
  }

  async remove(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/product-applications/${id}`);
    return response.data
  }
}

export const productApplicationService = new ProductApplicationService();
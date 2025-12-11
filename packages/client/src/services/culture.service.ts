import { apiClient } from "../config/api.client";
import {
  Culture,
  CreateCultureDto,
  UpdateCultureDto,
  CulturesListResponse,
  CropSearchResult,
} from "../types/culture.types";

class CultureService {
  async create(
    data: CreateCultureDto,
  ): Promise<{ message: string; data: Culture }> {
    const response = await apiClient.post<{ message: string; data: Culture }>(
      "/cultures",
      data,
    );
    return response.data;
  }

  async findAll(
    page: number = 1,
    limit: number = 100,
    search?: string,
    sortBy?: string,
    order?: "ASC" | "DESC",
  ): Promise<CulturesListResponse> {
    const response = await apiClient.get<CulturesListResponse>("/cultures", {
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
    data: UpdateCultureDto,
  ): Promise<{ message: string; data: Culture }> {
    const response = await apiClient.patch<{ message: string; data: Culture }>(
      `/cultures/${id}`,
      data,
    );
    return response.data;
  }

  async remove(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/cultures/${id}`,
    );
    return response.data;
  }

  async searchCultureNames(
    query: string,
    limit: number = 10,
  ): Promise<CropSearchResult[]> {
    const response = await apiClient.get<CropSearchResult[]>(
      "/cultures/search/culture-names",
      {
        params: { q: query, limit },
      },
    );
    return response.data;
  }

  async findByProperty(propertyId: string): Promise<Culture[]> {
    try {
      // Tenta o endpoint específico primeiro
      console.log(
        `[CultureService] Buscando culturas para propertyId: ${propertyId}`,
      );

      const response = await apiClient.get(
        `/cultures/by-property/${propertyId}`,
      );
      console.log("[CultureService] Resposta do endpoint:", response.data);

      // O endpoint retorna array DIRETO (sem wrapper {data: [...]})
      if (Array.isArray(response.data)) {
        console.log(
          `[CultureService] Encontrou ${response.data.length} culturas`,
        );
        return response.data;
      }

      // Se por algum motivo tiver wrapper (para compatibilidade futura)
      if (response.data && Array.isArray(response.data.data)) {
        console.log(
          `[CultureService] Encontrou ${response.data.data.length} culturas em data wrapper`,
        );
        return response.data.data;
      }

      console.warn("[CultureService] Estrutura inesperada, usando fallback");

      // Fallback: busca todas e filtra
      return await this.findAllAndFilter(propertyId);
    } catch (error) {
      console.error("[CultureService] Erro no endpoint específico:", error);

      // Fallback: busca todas e filtra
      return await this.findAllAndFilter(propertyId);
    }
  }

  private async findAllAndFilter(propertyId: string): Promise<Culture[]> {
    try {
      const allResponse = await this.findAll(1, 1000);
      const filtered = allResponse.data.filter(
        (culture: Culture) => culture.propertyId === propertyId,
      );
      console.log(
        `[CultureService] Fallback: ${filtered.length} culturas filtradas`,
      );
      return filtered;
    } catch (fallbackError) {
      console.error("[CultureService] Fallback também falhou:", fallbackError);
      return [];
    }
  }
}

export const cultureService = new CultureService();

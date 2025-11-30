// src/services/activityService.ts
import { apiClient } from '../config/api.client';

export interface ActivityDTO {
  id?: number;
  titulo: string;   
  date: string;
  propriedade: string;
  tipo: string;
  descricao: string;
  operacao: string;
  responsavel: string;
  files?: File[];
  removedFiles?: string[];

  insumoNome?: string;
  insumoQuantidade?: number;
  insumoUnidade?: string;
}

export interface PaginatedActivities {
  data: ActivityDTO[]; 
  total: number;
}

const createFormData = (data: ActivityDTO) => {
  const formData = new FormData();

  formData.append('titulo', data.titulo);
  formData.append('date', data.date);
  formData.append('propriedade', data.propriedade);
  formData.append('tipo', data.tipo);
  formData.append('descricao', data.descricao);
  formData.append('responsavel', data.responsavel);
  formData.append('operacao', data.operacao);

  if (data.insumoNome) formData.append('insumoNome', data.insumoNome);
  
  if (data.insumoQuantidade !== undefined && data.insumoQuantidade !== undefined) {
    formData.append('insumoQuantidade', String(data.insumoQuantidade));
  }
  
  if (data.insumoUnidade) formData.append('insumoUnidade', data.insumoUnidade);

  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => {
      formData.append('files', file); 
    });
  }

  if (data.removedFiles && data.removedFiles.length > 0) {
    formData.append('removedFiles', JSON.stringify(data.removedFiles));
  }

  return formData;
};

export const activityService = {
  getAll: async (
    page: number = 1, 
    limit: number = 6, 
    order: 'ASC' | 'DESC' = 'DESC',
    search: string = ''
  ): Promise<PaginatedActivities> => {
    
    const response = await apiClient.get(`/activities?page=${page}&limit=${limit}&order=${order}&search=${encodeURIComponent(search)}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/activities/${id}`);
    return response.data;
  },

  create: async (data: ActivityDTO) => {
    const formData = createFormData(data);
    
    const response = await apiClient.post('/activities', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
    return response.data;
  },

  update: async (id: string, data: ActivityDTO) => {
    const formData = createFormData(data);
    
    const response = await apiClient.patch(`/activities/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/activities/${id}`);
  },
};
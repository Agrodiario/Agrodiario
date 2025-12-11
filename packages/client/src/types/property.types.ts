export interface Plot {
  name: string;
  area: number;
  culture: string;
  situacao: "producao" | "preparo" | "pousio";
  polygon?: any;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  totalArea: number;
  productionArea: number;
  mainCrop: string;
  certifications?: string;
  isActive: boolean;
  userId: string;
  plots?: Plot[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyDto {
  name: string;
  address: string;
  totalArea: number;
  productionArea: number;
  mainCrop: string;
  certifications?: string;
  plots?: Plot[];
}

export interface UpdatePropertyDto {
  name?: string;
  address?: string;
  totalArea?: number;
  productionArea?: number;
  mainCrop?: string;
  certifications?: string;
  plots?: Plot[];
}

export interface PropertiesListResponse {
  data: Property[];
  total: number;
  page: number;
  lastPage: number;
}

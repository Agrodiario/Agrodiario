export interface Culture {
  id: string;
  cultureName: string;
  cultivar?: string;
  cycle: number;
  origin?: string;
  supplier?: string;
  plantingDate: string;
  plantingArea: number;
  plotName?: string;
  observations?: string;
  isActive: boolean;
  userId: string;
  propertyId: string;
  property?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  // Campos calculados
  daysElapsed?: number;
  daysRemaining?: number;
  isCycleComplete?: boolean;
  expectedHarvestDate?: string;
  activitiesCount?: number;
  activities?: Array<{
    id: number;
    titulo: string;
    data: string;
    tipo?: string;
    descricao?: string;
  }>;
}

export interface CreateCultureDto {
  propertyId: string;
  cultureName: string;
  cultivar?: string;
  cycle: number;
  origin?: string;
  supplier?: string;
  plantingDate: string;
  plantingArea: number;
  plotName?: string;
  observations?: string;
}

export interface UpdateCultureDto {
  cultureName?: string;
  cultivar?: string;
  cycle?: number;
  origin?: string;
  supplier?: string;
  plantingDate?: string;
  plantingArea?: number;
  plotName?: string | null;
  observations?: string;
}

export interface CulturesListResponse {
  data: Culture[];
  total: number;
  page: number;
  lastPage: number;
}

export interface CropSearchResult {
  value: string;
  label: string;
}

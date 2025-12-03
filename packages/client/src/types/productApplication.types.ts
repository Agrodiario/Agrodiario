export interface ProductApplication {
  id: string;
  propertyId: string;
  property?: {
    id: string;
    name: string;
  };
  cultureId: string;
  culture?: {
    id: string;
    name: string;
  };
  area: string;
  productId: string;
  product?: {
    id: string;
    commercialNames: string[];
    activeIngredients: string[];
    categories: string[];
    organicFarmingProduct: boolean;
  };
  productName: string;
  applicationDate: string;
}

export interface CreateProductApplicationDto {
  propertyId: string;
  cultureId: string;
  area: string;
  productId: string;
  productName: string;
  applicationDate: string;
}

export interface UpdateProductApplicationDto {
  propertyId?: string;
  cultureId?: string;
  area?: string;
  productId?: string;
  productName?: string;
  applicationDate?: string;
}

export interface ProductApplicationsListResponse {
  data: ProductApplication[];
  total: number;
  page: number;
  lastPage: number;
}

export interface ProductSearchResult {
  registrationNumber: string;
  commercialNames: string[];
  registrationHolder: string;
  categories: string[];
  activeIngredients: string[];
  organicFarmingProduct: boolean;
}

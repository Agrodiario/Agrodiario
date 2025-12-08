export interface ProductApplication {
  id: string;
  propertyId: string;
  cultureId: string;
  area: string;
  productId: string;
  product: {
    id: string;
    commercialNames: string[];
    activeIngredients: string[];
    categories: string[];
    organicFarmingProduct: boolean;
  };
  productName: string;
  applicationDate: string;
}

export interface ProductApplicationFormData {
  propertyId: string;
  cultureId: string;
  area: string;
  productId: string;
  productName: string;
  applicationDate: string;
}

export interface ProductApplicationsListResponse {
  data: ProductApplication[];
  total: number;
  page: number;
  lastPage: number;
}

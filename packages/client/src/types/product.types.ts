export interface Product {
  id?: string;
  registrationNumber: string;
  commercialNames: string[];
  registrationHolder: string;
  categories: string[];
  activeIngredients: string[];
  organicFarmingProduct: boolean;
}

export interface ProductFormData {
  id?: string;
  registrationNumber: string;
  commercialNames: string[];
  registrationHolder: string;
  categories: string[];
  activeIngredients: string[];
  organicFarmingProduct: boolean;
}

export interface CreateProductDto {
  registrationNumber: string;
  commercialNames: string[];
  registrationHolder: string;
  categories: string[];
  activeIngredients: string[];
  organicFarmingProduct: boolean;
}
import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @Expose()
  id?: string;

  @Expose()
  registrationNumber: string;

  @Expose()
  commercialNames: string[];

  @Expose()
  registrationHolder: string;

  @Expose()
  categories: string[];

  @Expose()
  activeIngredients: string[];

  @Expose()
  organicFarmingProduct: boolean;

  constructor(partial: Partial<ProductResponseDto>) {
    Object.assign(this, partial);
  }
}

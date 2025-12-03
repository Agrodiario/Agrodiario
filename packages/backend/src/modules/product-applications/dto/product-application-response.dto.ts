import { Expose } from 'class-transformer';

export class ProductApplicationResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  propertyId: string;

  @Expose()
  cultureId: string;

  @Expose()
  area: string;

  @Expose()
  productId: string;

  @Expose()
  productName: string;

  @Expose()
  applicationDate: Date;

  constructor(partial: Partial<ProductApplicationResponseDto>) {
    Object.assign(this, partial);
  }
}

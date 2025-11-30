import { Exclude, Expose } from 'class-transformer';

export class PropertyResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  totalArea: number;

  @Expose()
  productionArea: number;

  @Expose()
  mainCrop: string;

  @Expose()
  certifications: string;

  @Expose()
  isActive: boolean;

  @Expose()
  plots?: { name: string; area: number }[];

  @Expose()
  userId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  user: any;

  constructor(partial: Partial<PropertyResponseDto>) {
    Object.assign(this, partial);
  }
}

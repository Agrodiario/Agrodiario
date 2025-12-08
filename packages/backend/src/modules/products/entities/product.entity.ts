import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

/**
 * Products ready for field application.
 */
@Entity('products')
export class Product extends BaseEntity {
  // Product registration number
  @Column({ type: 'varchar', length: 50 })
  registrationNumber: string;

  // Commercial names / trade names used for the product
  @Column('varchar', { array: true })
  commercialNames: string[];

  // Company or individual that holds the product registration
  @Column({ type: 'varchar', length: 255 })
  registrationHolder: string;

  // Agronomic categories or classes (may be multiple)
  @Column('varchar', { array: true })
  categories: string[];

  // Active ingredients of the product
  @Column('varchar', { array: true })
  activeIngredients: string[];

  // Product approved for use in organic agriculture.
  // Product status (permitted, prohibited)
  @Column({ type: 'boolean', default: false })
  organicFarmingProduct: boolean;
}

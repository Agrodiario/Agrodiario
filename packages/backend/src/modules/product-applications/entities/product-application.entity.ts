import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Property } from '../../properties/entities/property.entity';
import { Product } from '../../products/entities/product.entity';
import { Culture } from '../../cultures/entities/culture.entity';
import { User } from '../../users/entities/user.entity';

@Entity('product_applications')
export class ProductApplication extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({ type: 'uuid' })
  propertyId: string;

  @ManyToOne(() => Culture, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cultureId' })
  culture: Culture;

  @Column({ type: 'uuid' })
  cultureId: string;

  @Column({ type: 'varchar', length: 255 })
  area: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid' })
  productId: string;

  // Which name from the list of commercial names does the user use
  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column({ type: 'date' })
  applicationDate: Date;
}

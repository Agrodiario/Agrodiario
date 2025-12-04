import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('properties')
export class Property extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalArea: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  productionArea: number;

  @Column({ type: 'varchar', length: 100 })
  mainCrop: string;

  @Column({ type: 'text', nullable: true })
  certifications: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  plots: { name: string; area: number }[];

  // Relationship to User (owner)
  @ManyToOne(() => User, (user) => user.properties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;
}

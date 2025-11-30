import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { CultureOrigin } from '../enums/culture-origin.enum';

@Entity('cultures')
export class Culture extends BaseEntity {
  // Relationship to Property
  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({ type: 'uuid' })
  propertyId: string;

  // Relationship to User (owner)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  // Relationship to Activities
  @OneToMany(() => Activity, (activity) => activity.culture)
  activities: Activity[];

  // Culture name (free text given by owner)
  @Column({ type: 'varchar', length: 255 })
  cultureName: string;

  // Cultivar/variety name (will be populated from Wikidata API)
  @Column({ type: 'varchar', length: 255 })
  cultivar: string;

  // Culture cycle in days
  @Column({ type: 'integer' })
  cycle: number;

  // Culture origin (organic, conventional, transgenic)
  @Column({
    type: 'enum',
    enum: CultureOrigin,
  })
  origin: CultureOrigin;

  // Seed supplier/company name
  @Column({ type: 'varchar', length: 255 })
  supplier: string;

  // Planting date (planned or actual)
  @Column({ type: 'date' })
  plantingDate: Date;

  // Planting area in hectares
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  plantingArea: number;

  // Additional observations (optional)
  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}

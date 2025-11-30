// src/activities/entities/activity.entity.ts
import { User } from '../../users/entities/user.entity';
import { Culture } from '../../cultures/entities/culture.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum ActivityType {
  PREPARO = 'preparo',
  APLICACAO = 'aplicacao',
  COLHEITA = 'colheita',
  MANEJO = 'manejo',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Culture, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cultureId' })
  culture: Culture;

  @Column({ type: 'uuid', nullable: true })
  cultureId: string;

  @Column({ nullable: true })
  titulo: string;

  @Column({ type: 'date' })
  date: Date; 

  @Column()
  propriedade: string; 

  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.PREPARO,
  })
  tipo: ActivityType;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ nullable: true })
  operacao: string;

  @Column()
  responsavel: string;

  @Column({ nullable: true })
  insumoNome: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  insumoQuantidade: number;

  @Column({ nullable: true })
  insumoUnidade: string;

  @Column('simple-array', { nullable: true })
  anexos: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
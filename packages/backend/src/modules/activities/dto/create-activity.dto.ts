// src/activities/dto/create-activity.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { ActivityType } from '../entities/activity.entity';
import { Type } from 'class-transformer';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty() 
  titulo: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  propriedade: string;

  @IsEnum(ActivityType)
  @IsNotEmpty()
  tipo: ActivityType;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  operacao: string;

  @IsString()
  @IsNotEmpty()
  responsavel: string;

  // Insumos
  @IsString()
  @IsOptional()
  insumoNome?: string;

  @IsOptional()
  @Type(() => Number) 
  @IsNumber()
  insumoQuantidade?: number;

  @IsString()
  @IsOptional()
  insumoUnidade?: string;

  @IsOptional()
  files?: any;
}
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Optional } from '@nestjs/common';

export class CreateProductDto {
  @Optional()
  @IsString({ message: 'Número do registro deve ser um texto' })
  registrationNumber: string;

  @Optional()
  @IsArray({ message: 'Nome(S) deve(m) ser um vetor de textos' })
  @IsString({ each: true, message: 'Cada nome deve ser um texto' })
  commercialNames: string[];

  @Optional()
  @IsString({ message: 'Titular do registro deve ser um texto' })
  registrationHolder: string;

  @Optional()
  @IsArray({ message: 'Categoria(s)/classe(s) deve ser um vetor de textos' })
  @IsString({ each: true, message: 'Cada categoria/classe deve ser um texto' })
  categories: string[];

  @Optional()
  @IsArray({ message: 'Ingradiente(s) ativo(s) deve ser um vetor de textos' })
  @IsString({ each: true, message: 'Cada ingrediente ativo deve ser um texto' })
  activeIngredients: string[];

  organicFarmingProduct: boolean;
}

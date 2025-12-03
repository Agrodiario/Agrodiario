import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Número do registro do produto é obrigatório' })
  @IsString({ message: 'Número do registro deve ser um texto' })
  registrationNumber: string;

  @IsNotEmpty({ message: 'Nome(S) do produto é obrigatório' })
  @IsArray({ message: 'Nome(S) deve(m) ser um vetor de textos' })
  @IsString({ each: true, message: 'Cada nome deve ser um texto' })
  commercialNames: string[];

  @IsNotEmpty({ message: 'Titular do registro do produto é obrigatório' })
  @IsString({ message: 'Titular do registro deve ser um texto' })
  registrationHolder: string;

  @IsNotEmpty({ message: 'Categoria(s)/classe(s) agronômica é obrigatória' })
  @IsArray({ message: 'Categoria(s)/classe(s) deve ser um vetor de textos' })
  @IsString({ each: true, message: 'Cada categoria/classe deve ser um texto' })
  categories: string[];

  @IsNotEmpty({ message: 'Ingradiente(s) ativo(s) é obrigatório' })
  @IsArray({ message: 'Ingradiente(s) ativo(s) deve ser um vetor de textos' })
  @IsString({ each: true, message: 'Cada ingrediente ativo deve ser um texto' })
  activeIngredients: string[];

  organicFarmingProduct: boolean;
}

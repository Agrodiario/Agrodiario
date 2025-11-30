import { IsString, IsInt, IsEnum, IsDateString, IsDecimal, IsOptional, Min, MaxLength } from 'class-validator';
import { CultureOrigin } from '../enums/culture-origin.enum';

export class UpdateCultureDto {
  @IsOptional()
  @IsString({ message: 'Nome da cultura deve ser um texto' })
  @MaxLength(255, { message: 'Nome da cultura deve ter no máximo 255 caracteres' })
  cultureName?: string;

  @IsOptional()
  @IsString({ message: 'Cultivar deve ser um texto' })
  @MaxLength(255, { message: 'Cultivar deve ter no máximo 255 caracteres' })
  cultivar?: string;

  @IsOptional()
  @IsInt({ message: 'Ciclo deve ser um número inteiro' })
  @Min(1, { message: 'Ciclo deve ser no mínimo 1 dia' })
  cycle?: number;

  @IsOptional()
  @IsEnum(CultureOrigin, { message: 'Origem deve ser organic, conventional ou transgenic' })
  origin?: CultureOrigin;

  @IsOptional()
  @IsString({ message: 'Fornecedor deve ser um texto' })
  @MaxLength(255, { message: 'Fornecedor deve ter no máximo 255 caracteres' })
  supplier?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data de plantio deve estar no formato YYYY-MM-DD' })
  plantingDate?: string;

  @IsOptional()
  plantingArea?: number;

  @IsOptional()
  @IsString({ message: 'Observações devem ser um texto' })
  observations?: string;
}

import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  IsEnum,
  IsString,
  MaxLength,
  IsDateString,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { CultureOrigin } from '../enums/culture-origin.enum';

export class CreateCultureDto {
  @IsNotEmpty({ message: 'Propriedade associada é obrigatória' })
  @IsUUID('4', { message: 'ID da propriedade inválido' })
  propertyId: string;

  @IsNotEmpty({ message: 'Nome da cultura é obrigatório' })
  @IsString({ message: 'Nome da cultura deve ser um texto' })
  @MaxLength(255, { message: 'Nome da cultura deve ter no máximo 255 caracteres' })
  cultureName: string;

  @IsOptional()
  @IsString({ message: 'Cultivar/Variedade deve ser um texto' })
  @MaxLength(255, { message: 'Cultivar/Variedade deve ter no máximo 255 caracteres' })
  cultivar?: string;

  @IsNotEmpty({ message: 'Ciclo da cultura é obrigatório' })
  @IsInt({ message: 'Ciclo deve ser um número inteiro' })
  @Min(1, { message: 'Ciclo deve ser maior que zero' })
  cycle: number;

  @IsNotEmpty({ message: 'Origem da cultura é obrigatória' })
  @IsEnum(CultureOrigin, { message: 'Origem deve ser organic, conventional ou transgenic' })
  origin: CultureOrigin;

  @IsOptional()
  @IsString({ message: 'Fornecedor deve ser um texto' })
  @MaxLength(255, { message: 'Fornecedor deve ter no máximo 255 caracteres' })
  supplier?: string;

  @IsNotEmpty({ message: 'Data de plantio é obrigatória' })
  @IsString({ message: 'Data de plantio deve ser uma string' })
  plantingDate: string;

  @IsNotEmpty({ message: 'Área de plantio é obrigatória' })
  @IsNumber({}, { message: 'Área de plantio deve ser um número' })
  @IsPositive({ message: 'Área de plantio deve ser maior que zero' })
  plantingArea: number;

  @IsOptional()
  @IsString({ message: 'Nome do talhão deve ser um texto' })
  @MaxLength(255, { message: 'Nome do talhão deve ter no máximo 255 caracteres' })
  plotName?: string;

  @IsOptional()
  @IsString({ message: 'Observações devem ser um texto' })
  observations?: string;
}

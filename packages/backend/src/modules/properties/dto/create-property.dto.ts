import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PlotDto {
  @IsNotEmpty({ message: 'Nome do talhão é obrigatório' })
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty({ message: 'Área do talhão é obrigatória' })
  @IsNumber()
  @Min(0, { message: 'Área do talhão deve ser maior ou igual a zero' })
  area: number;

  @IsNotEmpty({ message: 'Cultura do talhão é obrigatória' })
  @IsString()
  @MaxLength(100)
  culture: string;

  @IsNotEmpty({ message: 'Situação do talhão é obrigatória' })
  @IsString()
  @IsIn(['producao', 'preparo', 'pousio'], {
    message: 'Situação deve ser: producao, preparo ou pousio',
  })
  situacao: 'producao' | 'preparo' | 'pousio';

  @IsOptional()
  polygon?: any;
}

export class CreatePropertyDto {
  @IsNotEmpty({ message: 'Nome da propriedade é obrigatório' })
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty({ message: 'Endereço é obrigatório' })
  @IsString()
  @MaxLength(500)
  address: string;

  @IsNotEmpty({ message: 'Área total é obrigatória' })
  @IsNumber()
  @Min(0, { message: 'Área total deve ser maior que zero' })
  totalArea: number;

  @IsNotEmpty({ message: 'Área de produção é obrigatória' })
  @IsNumber()
  @Min(0, { message: 'Área de produção deve ser maior que zero' })
  productionArea: number;

  @IsNotEmpty({ message: 'Cultivo principal é obrigatório' })
  @IsString()
  @MaxLength(100)
  mainCrop: string;

  @IsOptional()
  @IsString()
  certifications?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlotDto)
  plots?: PlotDto[];
}

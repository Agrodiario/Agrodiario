import { IsNotEmpty, IsString, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';

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
  certificates?: any;
}

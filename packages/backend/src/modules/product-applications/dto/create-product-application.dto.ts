import { IsDateString, IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductApplicationDto {
  @IsNotEmpty({ message: 'Propriedade associada é obrigatória' })
  @IsUUID('4', { message: 'ID da propriedade inválido' })
  propertyId: string;

  @IsNotEmpty({ message: 'Cultura associada é obrigatória' })
  @IsUUID('4', { message: 'ID da cultura inválido' })
  cultureId: string;

  @IsNotEmpty({ message: 'Declarar a área/talhão é pbrigatório' })
  @IsString({ message: 'Área ou talhão deve estar no formato de texto' })
  area: string;

  @IsNotEmpty({ message: 'Produto associado é obrigatório' })
  @IsUUID('4', { message: 'ID do produto inválido' })
  productId: string;

  @IsNotEmpty({ message: 'Nome do produto é obrigatório' })
  @IsString({ message: 'Nome do produto deve ser um texto' })
  productName: string;

  @IsNotEmpty({ message: 'Data de aplicação é obrigatória' })
  @IsDateString({}, { message: 'Data de aplicação deve estar no formato válido (YYYY-MM-DD)' })
  applicationDate: string;
}

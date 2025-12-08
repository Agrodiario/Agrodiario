import { PartialType } from '@nestjs/mapped-types';
import { CreateProductApplicationDto } from '@modules/product-applications/dto/create-product-application.dto';

export class UpdateProductApplicationDto extends PartialType(CreateProductApplicationDto) {}

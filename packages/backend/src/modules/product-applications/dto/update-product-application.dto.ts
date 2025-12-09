import { PartialType } from '@nestjs/mapped-types';
import { CreateProductApplicationDto } from './create-product-application.dto';

export class UpdateProductApplicationDto extends PartialType(CreateProductApplicationDto) {}

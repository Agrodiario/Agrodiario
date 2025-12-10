import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { IsOptional } from 'class-validator';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
    @IsOptional()
    removedFiles?: string[];
}

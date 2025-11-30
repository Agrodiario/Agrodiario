// src/activities/dto/update-activity.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityDto } from './create-activity.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
    @IsOptional()
    @IsString()
    removedFiles?: string;
}
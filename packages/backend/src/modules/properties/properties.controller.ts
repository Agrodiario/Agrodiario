import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { diskStorage } from 'multer';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { FilesInterceptor } from '@nestjs/platform-express';

const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = resolve(process.cwd(), 'uploads');
      if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Correção de encoding para caracteres especiais
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const sanitizedName = originalName.replace(/\s+/g, '-');
      cb(null, `${Date.now()}-${sanitizedName}`);
    },
  }),
};

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ) {
    // Agora passa os files para o service
    return this.propertiesService.create(createPropertyDto, req.user.id, files);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    return this.propertiesService.findAll(user.id, pageNumber, limitNumber);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.propertiesService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  update(
    @Param('id', ParseUUIDPipe) id: string, // Mudei de ParseIntPipe para UUID para manter consistência
    @Body() updatePropertyDto: UpdatePropertyDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ) {
    // Agora passa os files para o service
    return this.propertiesService.update(id, updatePropertyDto, req.user.id, files);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.propertiesService.remove(id, user.id);
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.OK)
  hardRemove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.propertiesService.hardRemove(id, user.id);
  }
}
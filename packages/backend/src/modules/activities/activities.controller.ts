import { 
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, 
  UseInterceptors, UploadedFiles, 
  Query,
  DefaultValuePipe,
  UseGuards,
  Req
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { FilesInterceptor } from '@nestjs/platform-express';
import { ActivityService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = resolve(process.cwd(), 'uploads');
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

      const sanitizedName = originalName.replace(/\s+/g, '-');

      const finalName = `${Date.now()}-${sanitizedName}`;

      cb(null, finalName);
    },
  }),
};

@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions)) 
  create(
    @Body() createActivityDto: CreateActivityDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.activityService.create(createActivityDto, userId, files);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('order') order: string, 
    @Req() req: any,
    @Query('search') search?: string,
  ) {
    const sortOrder = order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const userId = req.user.id;
    return this.activityService.findAll(page, limit, sortOrder, search, userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.activityService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateActivityDto: UpdateActivityDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ) {
    return this.activityService.update(id, updateActivityDto, req.user.id, files);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.activityService.remove(id, req.user.id);
  }
}
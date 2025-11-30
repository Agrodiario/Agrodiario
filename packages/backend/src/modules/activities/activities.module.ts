// src/activities/activity.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path'; 
import { existsSync, mkdirSync } from 'fs'; 
import { ActivityService } from './activities.service';
import { ActivityController } from './activities.controller';
import { Activity } from './entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity]),
    MulterModule.registerAsync({ 
      useFactory: () => {
        const uploadPath = resolve(__dirname, '..', '..', 'uploads');
        
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }

        return {
          storage: diskStorage({
            destination: uploadPath,
            filename: (req, file, callback) => {
              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
              const ext = extname(file.originalname);
              callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
          }),
        };
      },
    }),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
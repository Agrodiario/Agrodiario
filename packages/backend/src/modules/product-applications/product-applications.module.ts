import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductApplication } from '../product-applications/entities/product-application.entity';
import { AuthModule } from '../auth/auth.module';
import { ProductApplicationsController } from '../product-applications/product-applications.controller';
import { ProductApplicationsService } from '../product-applications/product-applications.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductApplication]), AuthModule],
  controllers: [ProductApplicationsController],
  providers: [ProductApplicationsService],
  exports: [ProductApplicationsService],
})
export class ProductApplicationsModule {}

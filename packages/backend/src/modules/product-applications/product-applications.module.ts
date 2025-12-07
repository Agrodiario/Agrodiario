import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductApplication } from '../product-applications/entities/product-application.entity';
import { AuthModule } from '../auth/auth.module';
import { ProductApplicationsController } from '../product-applications/product-applications.controller';
import { ProductApplicationsService } from '../product-applications/product-applications.service';
import { Property } from '../properties/entities/property.entity';
import { Culture } from '../cultures/entities/culture.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductApplication, Property, Culture, Product]), AuthModule],
  controllers: [ProductApplicationsController],
  providers: [ProductApplicationsService],
  exports: [ProductApplicationsService],
})
export class ProductApplicationsModule {}

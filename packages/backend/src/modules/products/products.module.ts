import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { AuthModule } from '../auth/auth.module';
import { ProductsController } from '../products/products.controller';
import { ProductsService } from '../products/products.service';
import { EmbrapaService } from '../../embrapa/embrapa.service';
import { HttpService } from '@nestjs/axios';
import { EmbrapaModule } from '../../embrapa/embrapa.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), AuthModule, EmbrapaModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

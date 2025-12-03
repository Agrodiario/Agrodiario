import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from '../products/products.service';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService
  ) {}

  @Get('search/commercial-name')
  @HttpCode(HttpStatus.OK)
  async searchByCommercialName(@Query('name') name?: string) {
    return this.productsService.searchByCommercialName(name);
  }

  @Get()
  async ola() {
    return 'Olá';
  }
}

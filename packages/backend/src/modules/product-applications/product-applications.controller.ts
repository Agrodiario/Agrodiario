import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductApplicationsService } from '../product-applications/product-applications.service';
import { CreateProductApplicationDto } from '../product-applications/dto/create-product-application.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UpdateProductApplicationDto } from '../product-applications/dto/update-product-application.dto';

@Controller('product-applications')
@UseGuards(JwtAuthGuard)
export class ProductApplicationsController {
  constructor(private readonly productApplicationsService: ProductApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createProductApplicationDto: CreateProductApplicationDto,
    @CurrentUser() user: User,
  ) {
    return this.productApplicationsService.create(createProductApplicationDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNumer = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    return this.productApplicationsService.findAll(user.id, pageNumer, limitNumber);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.productApplicationsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductApplicationDto: UpdateProductApplicationDto,
    @CurrentUser() user: User,
  ) {
    return this.productApplicationsService.update(id, updateProductApplicationDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.productApplicationsService.remove(id, user.id);
  }
}

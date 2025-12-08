import {
  Body,
  Controller, DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param, ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query, Req,
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
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('order') order: string,
    @Req() req: any,
    @Query('search') search?: string,
  ) {
    const sortOrder = order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const userId = req.user.id;
    return this.productApplicationsService.findAll(page, limit, sortOrder, search, userId);
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
    console.log("Chegou aqui");
    return this.productApplicationsService.update(id, updateProductApplicationDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.productApplicationsService.remove(id, user.id);
  }
}

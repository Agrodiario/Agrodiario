import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductApplication } from '../product-applications/entities/product-application.entity';
import { Repository } from 'typeorm';
import { CreateProductApplicationDto } from '../product-applications/dto/create-product-application.dto';
import { UpdateProductApplicationDto } from '../product-applications/dto/update-product-application.dto';
import { ProductApplicationResponseDto } from '../product-applications/dto/product-application-response.dto';
import { Property } from '../properties/entities/property.entity';
import { Culture } from '../cultures/entities/culture.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ProductApplicationsService {
  constructor(
    @InjectRepository(ProductApplication)
    private productApplicationsRepository: Repository<ProductApplication>,
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @InjectRepository(Culture)
    private culturesRepository: Repository<Culture>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(
    createProductApplicationDto: CreateProductApplicationDto,
    userId: string,
  ): Promise<ProductApplicationResponseDto> {
    // Verify that the property exists and belongs to the user
    const property = await this.propertiesRepository.findOne({
      where: { id: createProductApplicationDto.propertyId, isActive: true },
    });

    if (!property) {
      throw new NotFoundException(`Propriedade não encontrada`);
    }

    if (property.userId !== userId) {
      throw new ForbiddenException(
        `Você não tem permissão para aplicar produtos nesta propriedade`,
      );
    }

    // Verify that the culture exists and has been registered by the user
    const culture = await this.culturesRepository.findOne({
      where: { id: createProductApplicationDto.cultureId, isActive: true },
    });

    if (!culture) {
      throw new NotFoundException('Cultura não encontrada');
    }

    if (culture.userId !== userId) {
      throw new ForbiddenException('Você não possui esse tipo de cultura registrado');
    }

    // Verify that the product exists
    const product = await this.productsRepository.findOne({
      where: { id: createProductApplicationDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const productApplication = this.productApplicationsRepository.create({
      ...createProductApplicationDto,
      userId,
    });

    const savedProductApplication =
      await this.productApplicationsRepository.save(productApplication);
    return new ProductApplicationResponseDto(savedProductApplication);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    order: 'ASC' | 'DESC' = 'DESC',
    search?: string,
    userId?: string,
  ): Promise<{
    data: ProductApplicationResponseDto[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const skip = (page - 1) * limit;

    const [productApplications, total] = await this.productApplicationsRepository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { createdAt: order },
      relations: ['product', 'property', 'culture'],
    });

    const data = productApplications.map(
      (productApplications) => new ProductApplicationResponseDto(productApplications),
    );

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<ProductApplicationResponseDto> {
    const productApplication = await this.productApplicationsRepository.findOne({
      where: { id },
      relations: ['product', 'property', 'culture'],
    });

    if (!productApplication) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    if (productApplication.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar esse registro');
    }

    return new ProductApplicationResponseDto(productApplication);
  }

  async update(
    id: string,
    updateProductApplicationDto: UpdateProductApplicationDto,
    userId: string,
  ): Promise<ProductApplicationResponseDto> {
    if (!id) {
      throw new BadRequestException('Application ID is required');
    }

    const productApplication = await this.productApplicationsRepository.findOneBy({ id });

    if (!productApplication) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    if (productApplication.userId !== userId) {
      throw new ForbiddenException('Você não tem acesso a essa registro');
    }

    // Date formatting treatment
    if (updateProductApplicationDto.applicationDate) {
      productApplication.applicationDate = new Date(updateProductApplicationDto.applicationDate);
    }

    this.productApplicationsRepository.merge(productApplication, updateProductApplicationDto);
    const savedProductApplication =
      await this.productApplicationsRepository.save(productApplication);
    return new ProductApplicationResponseDto(savedProductApplication);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const productApplication = await this.productApplicationsRepository.findOne({
      where: { id: id },
    });

    if (!productApplication) {
      throw new NotFoundException('Aplicação de produto não encontrada.');
    }

    if (productApplication.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para deletar este registro.');
    }

    await this.productApplicationsRepository.remove(productApplication);
    return { message: 'Aplicação de produto excluída com sucesso.' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { EmbrapaService } from '../../embrapa/embrapa.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private readonly embrapaService: EmbrapaService,
  ) {}

  private isSameProduct(entity: Product, dto: CreateProductDto): boolean {
    return (
      JSON.stringify(entity.commercialNames.sort()) ===
        JSON.stringify(dto.commercialNames.sort()) &&
      entity.registrationHolder === dto.registrationHolder &&
      JSON.stringify(entity.categories.sort()) === JSON.stringify(dto.categories.sort()) &&
      JSON.stringify(entity.activeIngredients.sort()) ===
        JSON.stringify(dto.activeIngredients.sort()) &&
      entity.organicFarmingProduct === dto.organicFarmingProduct
    );
  }

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    // Verify if the product alredy exist
    const products = await this.productsRepository.find({
      where: { registrationNumber: createProductDto.registrationNumber },
    });

    for (const product of products) {
      if (this.isSameProduct(product, createProductDto)) {
        return new ProductResponseDto(product);
      }
    }

    // if not, save
    const product = this.productsRepository.create({
      ...createProductDto,
    });
    const savedProduct = await this.productsRepository.save(product);
    return new ProductResponseDto(savedProduct);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    return product;
  }

  // Organize the vector by order of similarity to the search string
  private reorderBySimilarity(names: string[], search: string): string[] {
    if (!names) return [];
    if (!search || names.length <= 1) return names;

    const term = search.toLowerCase();

    return names.slice().sort((a, b) => {
      const A = a.toLowerCase();
      const B = b.toLowerCase();

      const aStarts = A.startsWith(term);
      const bStarts = B.startsWith(term);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const aIncludes = A.includes(term);
      const bIncludes = B.includes(term);
      if (aIncludes && !bIncludes) return -1;
      if (!aIncludes && bIncludes) return 1;

      // fallback: menor diferença de tamanho
      return Math.abs(A.length - term.length) - Math.abs(B.length - term.length);
    });
  }

  async searchByCommercialName(search?: string) {
    try {
      const apiResponse = await this.embrapaService.getAllProdutoFormuladoByMarcaComercial(search);
      const result: ProductResponseDto[] = [];

      for (const item of apiResponse.data) {
        const orderedNames = this.reorderBySimilarity(item.marca_comercial, search);
        let ingredienteAtivo: string[];

        if (
          Array.isArray(item?.ingrediente_ativo_detalhado) &&
          item.ingrediente_ativo_detalhado.length > 0
        ) {
          ingredienteAtivo = item.ingrediente_ativo_detalhado.map((det) => det.ingrediente_ativo);
        } else if (Array.isArray(item?.ingrediente_ativo) && item.ingrediente_ativo.length > 0) {
          ingredienteAtivo = item.ingrediente_ativo.map((det) => det?.split('(')[0].trim() || '');
        } else {
          ingredienteAtivo = [];
        }

        result.push({
          registrationNumber: item.numero_registro ? item.numero_registro.toString() : '',
          commercialNames: orderedNames,
          registrationHolder: item.titular_registro ? item.titular_registro.toString() : '',
          categories: item.classe_categoria_agronomica ? item.classe_categoria_agronomica : [],
          activeIngredients: ingredienteAtivo,
          organicFarmingProduct: item.produto_agricultura_organica,
        });
      }

      return result;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}

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
      JSON.stringify(entity.categories.sort()) ===
        JSON.stringify(dto.categories.sort()) &&
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
    return [
      {
        registrationNumber: '17621',
        commercialNames: ['Flexstar GT'],
        registrationHolder: 'Syngenta Proteção de Cultivos Ltda.',
        categories: ['Herbicida'],
        activeIngredients: [
          'fomesafem',
          'glifosato',
        ],
        organicFarmingProduct: false,
      },
      {
        registrationNumber: '8008',
        commercialNames: ['Gamit Star'],
        registrationHolder: 'FMC Química do Brasil Ltda.',
        categories: ['Herbicida'],
        activeIngredients: [
          'clomazona',
        ],
        organicFarmingProduct: false,
      },
      {
        registrationNumber: '39524',
        commercialNames: ['Geministar'],
        registrationHolder: 'Rainbow Defensivos Agrícolas Ltda.',
        categories: ['Fungicida'],
        activeIngredients: [
          'trifloxistrobina',
        ],
        organicFarmingProduct: false,
      },
      {
        registrationNumber: '7516',
        commercialNames: ['Gemstar LC', 'Diplomata K'],
        registrationHolder: 'Mitsui & Co (Brasil) S.A.',
        categories: ['Inseticida Microbiológico'],
        activeIngredients: [
          'VPN-HzSNPV',
        ],
        organicFarmingProduct: true,
      },
      {
        registrationNumber: '7115',
        commercialNames: ['Gemstar-Max'],
        registrationHolder: 'Mitsui & Co (Brasil) S.A.',
        categories: ['Inseticida Microbiológico'],
        activeIngredients: [
          'VPN-HzSNPV',
        ],
        organicFarmingProduct: true,
      },
      {
        registrationNumber: '225',
        commercialNames: ['Glufos Bestar'],
        registrationHolder: 'Proregistros Registros de Produtos Ltda',
        categories: ['Herbicida'],
        activeIngredients: [
          'Glufosinato - sal de amônio',
        ],
        organicFarmingProduct: false,
      },
      {
        registrationNumber: '22724',
        commercialNames: ['Glufos Bestar SL'],
        registrationHolder: 'Wynca do Brasil Ltda',
        categories: ['Herbicida'],
        activeIngredients: [
          'Glufosinato - sal de amônio',
        ],
        organicFarmingProduct: true,
      },
    ];

    try {
      const apiResponse = await this.embrapaService.getAllProdutoFormuladoByMarcaComercial(search);
      const result: ProductResponseDto[] = [];

      for (const item of apiResponse.data) {
        const orderedNames = this.reorderBySimilarity(item.marca_comercial, search);

        result.push({
          registrationNumber: item.numero_registro,
          commercialNames: orderedNames,
          registrationHolder: item.titular_registro,
          categories: item.classe_categoria_agronomica,
          activeIngredients: item.ingrediente_ativo_detalhado.map(det => det.ingrediente_ativo),
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

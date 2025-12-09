import { ProductsService } from './products.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { EmbrapaService } from '../../embrapa/embrapa.service';
import { ProdutoFormuladoResponseDto } from '../../embrapa/dto/produto-formulado-response.dto';
import { AxiosResponse } from 'axios';

const mockOneProduct = {
  id: '1',
  registrationNumber: 'ABC-123',
  commercialNames: ['Produto X'],
  registrationHolder: 'Empresa Y',
  categories: ['Bioinsumo'],
  activeIngredients: ['A', 'B'],
  organicFarmingProduct: true,
}

const mockProdutoFormulado: ProdutoFormuladoResponseDto = {
  numero_registro: '5810',
  marca_comercial: ['Flexin'],
  titular_registro: 'Prentiss Química Ltda.',
  produto_biologico: false,
  classe_categoria_agronomica: ['Fungicida'],
  formulacao: 'SC - Suspensão Concentrada',
  ingrediente_ativo: ['flutriafol (triazol) (125 g/L)'],
  ingrediente_ativo_detalhado: [
    {
      ingrediente_ativo: 'flutriafol',
      grupo_quimico: 'triazol',
      concentracao: '125',
      unidade_medida: 'Gramas por Litros',
      percentual: '12,5',
    },
  ],
  modo_acao: ['Sistêmico'],
  tecnica_aplicacao: ['Terrestre', 'Aérea'],
  indicacao_uso: [
    {
      cultura: 'Algodão',
      praga_nome_cientifico: 'Colletotrichum gossypii',
      praga_nome_comum: ['Antracnose', 'Tombamento'],
    },
  ],
  classificacao_toxicologica: 'IV - Produto Pouco Tóxico',
  classificacao_ambiental: 'II - Produto Muito Perigoso ao Meio Ambiente',
  inflamavel: false,
  corrosivo: false,
  documento_cadastrado: [
    {
      descricao: 'Bula',
      tipo_documento: 'Bula',
      data_inclusao: '22/10/2025 10:15:47',
      url: 'https://agrofit/arqivo.pdf',
      origem: 'Bula, Rótulo e Certificado',
    },
  ],
  produto_agricultura_organica: false,
  url_agrofit: 'https://agrofit/urlDePesquisa',
};

const mockProductsRepository = {
  create: jest.fn((dto) => dto),
  save: jest.fn().mockImplementation((product) => Promise.resolve({ id: '1', ...product })),
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;
  let embrapaServiceMock: jest.Mocked<EmbrapaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductsRepository,
        },
        {
          provide: EmbrapaService,
          useValue: {
            getAllProdutoFormuladoByMarcaComercial: jest.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    embrapaServiceMock = module.get(EmbrapaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      registrationNumber: 'ABC-123',
      commercialNames: ['Produto X'],
      registrationHolder: 'Empresa Y',
      categories: ['Bioinsumo'],
      activeIngredients: ['A', 'B'],
      organicFarmingProduct: true,
    };

    const exist = {
      id: '1',
      ...createDto,
    };

    it('should return the existing product when the attributes are equal', async () => {
      mockProductsRepository.find.mockResolvedValue([exist]);
      service['isSameProduct'] = jest.fn().mockReturnValue(true);
      const result = await service.create(createDto);

      expect(mockProductsRepository.find).toHaveBeenCalledWith({
        where: { registrationNumber: createDto.registrationNumber },
      });
      expect(service['isSameProduct']).toHaveBeenCalledWith(exist, createDto);
      expect(mockProductsRepository.create).not.toHaveBeenCalled();
      expect(mockProductsRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(mockOneProduct));
    });

    it('should create a new product if it does not exist', async () => {
      mockProductsRepository.find.mockResolvedValue([exist]);
      service['isSameProduct'] = jest.fn().mockReturnValue(false);
      const result = await service.create(createDto);

      expect(mockProductsRepository.find).toHaveBeenCalledWith({
        where: { registrationNumber: createDto.registrationNumber },
      });
      expect(service['isSameProduct']).toHaveBeenCalledWith(exist, createDto);
      expect(mockProductsRepository.create).toHaveBeenCalledWith({
        ...createDto,
      });
      expect(mockProductsRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(mockOneProduct));
    });
  });

  describe('findOne', () => {
    it('should return the product if found', async () => {
      mockProductsRepository.findOne.mockResolvedValue(mockOneProduct);
      const result = await service.findOne('1');
      expect(mockProductsRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockOneProduct);
    });

    it('should throw NotFoundException if not found', async () => {
      mockProductsRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('999'))
        .rejects
        .toBeInstanceOf(NotFoundException);
    });
  })

  describe('reorderBySimilarity', () => {
    it('should return the names in order of similarity.', () => {
      const names = ['Abacate', 'Banana', 'Abaian', 'Uva'];
      const result = service['reorderBySimilarity'](names, 'aba');

      expect(result[0]).toBe('Abacate');
      expect(result[1]).toBe('Abaian');
      expect(result[2]).toBe('Banana');
      expect(result[3]).toBe('Uva');
    });

    it('should preserve the original list if the search result is empty', () => {
      const names = ['A', 'B', 'C'];
      const result = service['reorderBySimilarity'](names, '');

      expect(result).toEqual(names);
    });
  });

  describe('searchByCommercialName', () => {
    it('should return a list of products with their names sorted', async () => {
      embrapaServiceMock.getAllProdutoFormuladoByMarcaComercial.mockResolvedValue({
        data: [mockProdutoFormulado],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      } as AxiosResponse<ProdutoFormuladoResponseDto[]>);

      const result = await service.searchByCommercialName('al');

      expect(result.length).toBe(1);
      expect(result[0].commercialNames[0]).toBe('Alpha'); // Prioriza termo no início
      expect(result[0].registrationNumber).toBe('123');
      expect(result[0].activeIngredients).toEqual(['I.a.1', 'I.a.2']);
      expect(embrapaServiceMock.getAllProdutoFormuladoByMarcaComercial).toHaveBeenCalledWith('al');
    });

    it('deve retornar lista vazia em caso de erro na API', async () => {
      embrapaServiceMock.getAllProdutoFormuladoByMarcaComercial.mockRejectedValue(
        new Error('API error'),
      );

      const result = await service.searchByCommercialName('teste');

      expect(result).toEqual([]);
    });
  });
});
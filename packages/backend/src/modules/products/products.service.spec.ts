import { ProductsService } from './products.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { EmbrapaService } from '../../embrapa/embrapa.service';

const mockOneProduct = {
  id: '1',
  registrationNumber: 'ABC-123',
  commercialNames: ['Produto X'],
  registrationHolder: 'Empresa Y',
  categories: ['Bioinsumo'],
  activeIngredients: ['A', 'B'],
  organicFarmingProduct: true,
};

const mockProductsRepository = {
  create: jest.fn((dto) => dto),
  save: jest.fn().mockImplementation((product) => Promise.resolve({ id: '1', ...product })),
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn(),
};

// Mock completo do EmbrapaService
const mockEmbrapaService = {
  getAccessToken: jest.fn().mockResolvedValue('fake_token'),
  getInsumos: jest.fn().mockResolvedValue([]),
  getInsumoByRegistrationNumber: jest.fn().mockResolvedValue(null),
  // Adicione este método que está sendo chamado no searchByCommercialName
  getAllProdutoFormuladoByMarcaComercial: jest.fn().mockResolvedValue({
    data: [
      {
        numero_registro: '17621',
        marca_comercial: ['Flexstar GT'],
        titular_registro: 'Syngenta Proteção de Cultivos Ltda.',
        classe_categoria_agronomica: ['Herbicida'],
        ingrediente_ativo_detalhado: [
          { ingrediente_ativo: 'fomesafem' },
          { ingrediente_ativo: 'glifosato' }
        ],
        produto_agricultura_organica: false,
      },
      {
        numero_registro: '8008',
        marca_comercial: ['Gamit Star'],
        titular_registro: 'FMC Química do Brasil Ltda.',
        classe_categoria_agronomica: ['Herbicida'],
        ingrediente_ativo_detalhado: [
          { ingrediente_ativo: 'clomazona' }
        ],
        produto_agricultura_organica: false,
      },
    ]
  }),
};

describe('ProductsService', () => {
  let service: ProductsService;
  let embrapaService: EmbrapaService;

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
          useValue: mockEmbrapaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    embrapaService = module.get<EmbrapaService>(EmbrapaService);

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
      // Acesse o método privado usando spy
      const isSameProductSpy = jest.spyOn(service as any, 'isSameProduct').mockReturnValue(true);
      
      const result = await service.create(createDto);

      expect(mockProductsRepository.find).toHaveBeenCalledWith({
        where: { registrationNumber: createDto.registrationNumber },
      });
      expect(isSameProductSpy).toHaveBeenCalledWith(exist, createDto);
      expect(mockProductsRepository.create).not.toHaveBeenCalled();
      expect(mockProductsRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(mockOneProduct));
      
      isSameProductSpy.mockRestore();
    });

    it('should create a new product if it does not exist', async () => {
      mockProductsRepository.find.mockResolvedValue([exist]);
      const isSameProductSpy = jest.spyOn(service as any, 'isSameProduct').mockReturnValue(false);
      
      const result = await service.create(createDto);

      expect(mockProductsRepository.find).toHaveBeenCalledWith({
        where: { registrationNumber: createDto.registrationNumber },
      });
      expect(isSameProductSpy).toHaveBeenCalledWith(exist, createDto);
      expect(mockProductsRepository.create).toHaveBeenCalledWith({
        ...createDto,
      });
      expect(mockProductsRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(mockOneProduct));
      
      isSameProductSpy.mockRestore();
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
  });

  describe('searchByCommercialName', () => {
    it('should return mock data when embrapa service is called', async () => {
      const result = await service.searchByCommercialName('test');
      
      // Verifique se o método da embrapa foi chamado
      expect(mockEmbrapaService.getAllProdutoFormuladoByMarcaComercial).toHaveBeenCalledWith('test');
      
      // Verifique se o resultado não é vazio
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      // Mock para simular erro
      mockEmbrapaService.getAllProdutoFormuladoByMarcaComercial.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await service.searchByCommercialName('test');
      
      expect(mockEmbrapaService.getAllProdutoFormuladoByMarcaComercial).toHaveBeenCalledWith('test');
      expect(result).toEqual([]); // Retorna array vazio em caso de erro
    });

    it('should reorder names by similarity', async () => {
      // Mock com dados específicos para testar o reorder
      mockEmbrapaService.getAllProdutoFormuladoByMarcaComercial.mockResolvedValueOnce({
        data: [
          {
            numero_registro: '123',
            marca_comercial: ['Zebra', 'Animal', 'Azebra'], // 'azebra' é mais similar a 'zebra'
            titular_registro: 'Test Company',
            classe_categoria_agronomica: ['Test'],
            ingrediente_ativo_detalhado: [{ ingrediente_ativo: 'test' }],
            produto_agricultura_organica: false,
          }
        ]
      });

      const result = await service.searchByCommercialName('zebra');
      
      // Verifique se as marcas comerciais foram reordenadas
      // 'Zebra' deve vir primeiro porque começa com 'zebra'
      expect(result[0].commercialNames[0]).toBe('Zebra');
    });
  });

  // Teste para o método privado reorderBySimilarity
  describe('reorderBySimilarity (private method)', () => {
    it('should reorder names starting with search term first', () => {
      // Use any para acessar método privado
      const result = (service as any).reorderBySimilarity(
        ['zebra', 'animal', 'azebra'],
        'zebra'
      );
      
      expect(result[0]).toBe('zebra'); // Começa com 'zebra'
    });

    it('should reorder names containing search term second', () => {
      const result = (service as any).reorderBySimilarity(
        ['animal', 'azebra', 'zoo'],
        'zeb'
      );
      
      expect(result[0]).toBe('azebra'); // Contém 'zeb'
    });

    it('should return same array if no search term', () => {
      const names = ['a', 'b', 'c'];
      const result = (service as any).reorderBySimilarity(names, '');
      
      expect(result).toEqual(names);
    });
  });
});
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

const mockEmbrapaService = {
  getInsumos: jest.fn().mockResolvedValue([]),
  getAccessToken: jest.fn().mockResolvedValue('fake_token'),
  getAllProdutoFormuladoByMarcaComercial: jest.fn().mockResolvedValue({
    data: []
  }),
};

describe('ProductsService', () => {
  let service: ProductsService;

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

    it('should return the existing product when the attributes are equal', async () => {
      const existingProduct = {
        id: '1',
        ...createDto,
      };

      mockProductsRepository.find.mockResolvedValue([existingProduct]);
      const result = await service.create(createDto);

      expect(mockProductsRepository.find).toHaveBeenCalledWith({
        where: { registrationNumber: createDto.registrationNumber },
      });
      expect(mockProductsRepository.create).not.toHaveBeenCalled();
      expect(mockProductsRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(existingProduct);
    });

    it('should create a new product if it does not exist', async () => {
      mockProductsRepository.find.mockResolvedValue([]);
      const result = await service.create(createDto);

      expect(mockProductsRepository.find).toHaveBeenCalledWith({
        where: { registrationNumber: createDto.registrationNumber },
      });
      expect(mockProductsRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockProductsRepository.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        id: '1',
        ...createDto
      });
    });

    it('should create a new product if attributes are different', async () => {
      const existingProduct = {
        id: '2',
        registrationNumber: 'ABC-123',
        commercialNames: ['Produto Diferente'],
        registrationHolder: 'Empresa Y',
        categories: ['Bioinsumo'],
        activeIngredients: ['A', 'B'],
        organicFarmingProduct: true,
      };

      mockProductsRepository.find.mockResolvedValue([existingProduct]);
      const result = await service.create(createDto);

      expect(mockProductsRepository.find).toHaveBeenCalled();
      expect(mockProductsRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockProductsRepository.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        id: '1',
        ...createDto
      });
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
    it('should return empty array when API returns no data', async () => {
      mockEmbrapaService.getAllProdutoFormuladoByMarcaComercial.mockResolvedValue({
        data: []
      });

      const result = await service.searchByCommercialName('teste');
      
      expect(mockEmbrapaService.getAllProdutoFormuladoByMarcaComercial).toHaveBeenCalledWith('teste');
      expect(result).toEqual([]);
    });

    it('should process API data correctly', async () => {
      const mockApiData = {
        data: [
          {
            numero_registro: '12345',
            marca_comercial: ['Produto Teste', 'Teste Produto'],
            titular_registro: 'Empresa Teste',
            classe_categoria_agronomica: ['Herbicida'],
            ingrediente_ativo_detalhado: [
              { ingrediente_ativo: 'Ingrediente A' },
              { ingrediente_ativo: 'Ingrediente B' }
            ],
            produto_agricultura_organica: true
          }
        ]
      };

      mockEmbrapaService.getAllProdutoFormuladoByMarcaComercial.mockResolvedValue(mockApiData);

      const result = await service.searchByCommercialName('Produto');
      
      expect(mockEmbrapaService.getAllProdutoFormuladoByMarcaComercial).toHaveBeenCalledWith('Produto');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        registrationNumber: '12345',
        commercialNames: ['Produto Teste', 'Teste Produto'], // Reordenado
        registrationHolder: 'Empresa Teste',
        categories: ['Herbicida'],
        activeIngredients: ['Ingrediente A', 'Ingrediente B'],
        organicFarmingProduct: true
      });
    });

    it('should handle ingrediente_ativo when ingrediente_ativo_detalhado is empty', async () => {
      const mockApiData = {
        data: [
          {
            numero_registro: '67890',
            marca_comercial: ['Outro Produto'],
            titular_registro: 'Outra Empresa',
            classe_categoria_agronomica: ['Fungicida'],
            ingrediente_ativo: ['Composto X (10%)', 'Composto Y (20%)'],
            produto_agricultura_organica: false
          }
        ]
      };

      mockEmbrapaService.getAllProdutoFormuladoByMarcaComercial.mockResolvedValue(mockApiData);

      const result = await service.searchByCommercialName('Outro');
      
      expect(result[0].activeIngredients).toEqual(['Composto X', 'Composto Y']);
    });

    it('should return empty array on error', async () => {
      mockEmbrapaService.getAllProdutoFormuladoByMarcaComercial.mockRejectedValue(new Error('API Error'));
      
      const result = await service.searchByCommercialName('teste');
      
      expect(result).toEqual([]);
    });
  });

  describe('reorderBySimilarity', () => {
    it('should reorder names by similarity', () => {
      const names = ['Produto XYZ', 'XYZ Produto', 'Outro Produto'];
      const search = 'Produto';
    });
  });
});
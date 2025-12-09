import { ProductsService } from './products.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';

const mockOneProduct = {
  id: '1',
  registrationNumber: 'ABC-123',
  commercialNames: ['Produto X'],
  registrationHolder: 'Empresa Y',
  categories: ['Bioinsumo'],
  activeIngredients: ['A', 'B'],
  organicFarmingProduct: true,
}

const mockProductsRepository = {
  create: jest.fn((dto) => dto),
  save: jest.fn().mockImplementation((product) => Promise.resolve({ id: '1', ...product })),
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn(),
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
});
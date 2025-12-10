import { Test, TestingModule } from '@nestjs/testing';
import { ProductApplicationsService } from './product-applications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ProductApplication } from './entities/product-application.entity';
import { Product } from '../products/entities/product.entity';
import { Property } from '../properties/entities/property.entity';
import { Culture } from '../cultures/entities/culture.entity';
import { CreateProductApplicationDto } from './dto/create-product-application.dto';
import { ProductApplicationResponseDto } from './dto/product-application-response.dto';
import { UpdateProductApplicationDto } from './dto/update-product-application.dto';

describe('ProductApplicationsService', () => {
  let service: ProductApplicationsService;

  let productAppRepo: any;
  let propertiesRepo: any;
  let culturesRepo: any;
  let productsRepo: any;

  const userId = 'user-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductApplicationsService,
        { provide: getRepositoryToken(ProductApplication), useValue: mockRepo() },
        { provide: getRepositoryToken(Property), useValue: mockRepo() },
        { provide: getRepositoryToken(Culture), useValue: mockRepo() },
        { provide: getRepositoryToken(Product), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get<ProductApplicationsService>(ProductApplicationsService);
    productAppRepo = module.get(getRepositoryToken(ProductApplication));
    propertiesRepo = module.get(getRepositoryToken(Property));
    culturesRepo = module.get(getRepositoryToken(Culture));
    productsRepo = module.get(getRepositoryToken(Product));
  });

  function mockRepo() {
    return {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
    };
  }

  describe('create', () => {
    const dto: CreateProductApplicationDto = {
      propertyId: 'prop-1',
      cultureId: 'cult-1',
      area: 'talhao-1',
      productId: 'prod-1',
      productName: 'Produto X',
      applicationDate: new Date().toISOString(),
    } as any;

    it('should create application with success', async () => {
      propertiesRepo.findOne.mockResolvedValue({ id: 'prop-1', userId, isActive: true });
      culturesRepo.findOne.mockResolvedValue({ id: 'cult-1', userId, isActive: true });
      productsRepo.findOne.mockResolvedValue({ id: 'prod-1' });

      productAppRepo.create.mockReturnValue({ id: 'app-1', ...dto, userId });
      productAppRepo.save.mockResolvedValue({ id: 'app-1', ...dto, userId });

      const result = await service.create(dto, userId);

      expect(result).toBeInstanceOf(ProductApplicationResponseDto);
      expect(productAppRepo.create).toHaveBeenCalledWith({ ...dto, userId });
      expect(productAppRepo.save).toHaveBeenCalled();
    });

    it('should fail if property does not exist', async () => {
      propertiesRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should fail if the property belongs to another user', async () => {
      propertiesRepo.findOne.mockResolvedValue({ id: 'prop-1', userId: 'another' });

      await expect(service.create(dto, userId)).rejects.toThrow(ForbiddenException);
    });

    it('should fail if culture does not exist', async () => {
      propertiesRepo.findOne.mockResolvedValue({ id: 'prop-1', userId });
      culturesRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should fail if the culture belongs to another user', async () => {
      propertiesRepo.findOne.mockResolvedValue({ id: 'prop-1', userId });
      culturesRepo.findOne.mockResolvedValue({ id: 'cult-1', userId: 'another' });

      await expect(service.create(dto, userId)).rejects.toThrow(ForbiddenException);
    });

    it('should fail if product does not exist', async () => {
      propertiesRepo.findOne.mockResolvedValue({ id: 'prop-1', userId });
      culturesRepo.findOne.mockResolvedValue({ id: 'cult-1', userId });
      productsRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list', async () => {
      const records = [{ id: '1', userId }, { id: '2', userId }];

      productAppRepo.findAndCount.mockResolvedValue([records, 2]);

      const result = await service.findAll(1, 10, 'DESC', undefined, userId);

      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.lastPage).toBe(1);
      expect(result.data.length).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a record', async () => {
      productAppRepo.findOne.mockResolvedValue({ id: '1', userId });

      const result = await service.findOne('1', userId);

      expect(result).toBeInstanceOf(ProductApplicationResponseDto);
    });

    it('should fail if record does not exist', async () => {
      productAppRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('1', userId)).rejects.toThrow(NotFoundException);
    });

    it('should fail if the record belongs to another user', async () => {
      productAppRepo.findOne.mockResolvedValue({ id: '1', userId: 'other' });

      await expect(service.findOne('1', userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    const dto: UpdateProductApplicationDto = { area: 'talhao-1' };

    it('should update with success', async () => {
      const existing = { id: '1', userId, area: 'talhao-2' };

      productAppRepo.findOneBy.mockResolvedValue(existing);
      productAppRepo.save.mockResolvedValue({ ...existing, ...dto });

      const result = await service.update('1', dto, userId);

      expect(result).toBeInstanceOf(ProductApplicationResponseDto);
    });

    it('should fail if id is empty', async () => {
      await expect(service.update('', dto, userId)).rejects.toThrow(BadRequestException);
    });

    it('should fail if record does not exist', async () => {
      productAppRepo.findOneBy.mockResolvedValue(null);

      await expect(service.update('1', dto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should fail if the record belongs to another user', async () => {
      productAppRepo.findOneBy.mockResolvedValue({ id: '1', userId: 'other' });

      await expect(service.update('1', dto, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove with success e return a message', async () => {
      productAppRepo.findOne.mockResolvedValue({ id: '1', userId });

      const res = await service.remove('1', userId);

      expect(res).toEqual({ message: 'Aplicação de produto excluída com sucesso.' });
    });

    it('should fail if record does not exist', async () => {
      productAppRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('1', userId)).rejects.toThrow(NotFoundException);
    });

    it('should fail if the record belongs to another user', async () => {
      productAppRepo.findOne.mockResolvedValue({ id: '1', userId: 'other' });

      await expect(service.remove('1', userId)).rejects.toThrow(ForbiddenException);
    });
  });
});

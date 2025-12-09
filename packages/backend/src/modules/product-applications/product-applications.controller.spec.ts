import { Test, TestingModule } from '@nestjs/testing';
import { ProductApplicationsController } from './product-applications.controller';
import { ProductApplicationsService } from './product-applications.service';
import { CreateProductApplicationDto } from './dto/create-product-application.dto';
import { UpdateProductApplicationDto } from './dto/update-product-application.dto';
import { User } from '../users/entities/user.entity';

describe('ProductApplicationsController', () => {
  let controller: ProductApplicationsController;
  let service: ProductApplicationsService;

  const mockUser = { id: 'user-123' } as User;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductApplicationsController],
      providers: [
        {
          provide: ProductApplicationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ProductApplicationsController>(ProductApplicationsController);
    service = module.get<ProductApplicationsService>(ProductApplicationsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create a product application', async () => {
      const dto: CreateProductApplicationDto = {
        propertyId: 'prop-1',
        cultureId: 'cult-1',
        area: 'talhao',
        productId: 'prod-1',
        productName: 'Produto X',
        applicationDate: new Date().toISOString(),
      };

      const expected = { id: 'app-1', ...dto, userId: mockUser.id };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto, mockUser);
      expect(result).toEqual(expected);
      expect(mockService.create).toHaveBeenCalledWith(dto, mockUser.id);
    });
  });

  describe('findAll', () => {
    it('should return paginated list', async () => {
      const mockReq = { user: mockUser };
      const response = {
        data: [],
        total: 0,
        page: 1,
        lastPage: 1,
      };

      mockService.findAll.mockResolvedValue(response);

      const result = await controller.findAll(1, 10, 'DESC', mockReq, '');
      expect(result).toEqual(response);
      expect(mockService.findAll).toHaveBeenCalledWith(1, 10, 'DESC', '', mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should return a record', async () => {
      const expected = { id: 'app-1' };
      mockService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne('app-1', mockUser);
      expect(result).toEqual(expected);
      expect(mockService.findOne).toHaveBeenCalledWith('app-1', mockUser.id);
    });
  });

  describe('update', () => {
    it('should update a record', async () => {
      const dto: UpdateProductApplicationDto = {
        area: 'talha-2',
      };

      const expected = { id: 'app-1', ...dto };
      mockService.update.mockResolvedValue(expected);

      const result = await controller.update('app-1', dto, mockUser);

      expect(result).toEqual(expected);
      expect(mockService.update).toHaveBeenCalledWith('app-1', dto, mockUser.id);
    });
  });

  describe('remove', () => {
    it('should remove a record', async () => {
      const expected = { message: 'Aplicação de produto excluída com sucesso.' };
      mockService.remove.mockResolvedValue(expected);

      const result = await controller.remove('app-1', mockUser);
      expect(result).toEqual(expected);
      expect(mockService.remove).toHaveBeenCalledWith('app-1', mockUser.id);
    });
  });
});

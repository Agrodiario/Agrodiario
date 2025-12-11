import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let serviceMock: jest.Mocked<ProductsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn(),
            searchByCommercialName: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    serviceMock = module.get(ProductsService);
  });

  describe('create', () => {
    it('should call service.create with dto e return the saved value', async () => {
      const createDto: CreateProductDto = {
        registrationNumber: '123',
        commercialNames: ['Flexin'],
        registrationHolder: 'Empresa Y',
        categories: ['Fungicida'],
        activeIngredients: ['flutriafol'],
        organicFarmingProduct: false,
      } as any;

      const expectedResponse = { id: '123', ...createDto };

      serviceMock.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createDto);

      expect(serviceMock.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('searchByCommercialName', () => {
    it('should call the service with the parameter and return the result', async () => {
      const mockName = 'flex';

      const mockResult = [
        {
          registrationNumber: '123',
          commercialNames: ['Flexin'],
          registrationHolder: 'Empresa Y',
          categories: ['Fungicida'],
          activeIngredients: ['flutriafol'],
          organicFarmingProduct: false,
        },
      ];

      serviceMock.searchByCommercialName.mockResolvedValue(mockResult);

      const result = await controller.searchByCommercialName(mockName);

      expect(serviceMock.searchByCommercialName).toHaveBeenCalledWith(mockName);
      expect(result).toEqual(mockResult);
    });

    it('should support requests without query parameters', async () => {
      serviceMock.searchByCommercialName.mockResolvedValue([]);

      const result = await controller.searchByCommercialName(undefined);

      expect(serviceMock.searchByCommercialName).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([]);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CulturesController } from './cultures.controller';
import { CulturesService } from './cultures.service';
import { PlantsApiService } from './services/plants-api.service';
import { CreateCultureDto } from './dto/create-culture.dto';
import { User } from '../users/entities/user.entity';
import { CultureOrigin } from './enums/culture-origin.enum';

describe('CulturesController', () => {
  let controller: CulturesController;
  let service: CulturesService;

  const mockCulturesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getUserProperties: jest.fn(),
    findByProperty: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPlantsApiService = {
    searchCrops: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CulturesController],
      providers: [
        {
          provide: CulturesService,
          useValue: mockCulturesService,
        },
        {
          provide: PlantsApiService,
          useValue: mockPlantsApiService,
        },
      ],
    }).compile();

    controller = module.get<CulturesController>(CulturesController);
    service = module.get<CulturesService>(CulturesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve chamar o service.create com os parâmetros corretos', async () => {
      // Arrange
      const createCultureDto: CreateCultureDto = {
        propertyId: 'property-123',
        cultureName: 'Milho Verde',
        cultivar: 'AG 1051',
        cycle: 120,
        origin: CultureOrigin.ORGANIC,
        supplier: 'Sementes Brasil Ltda',
        plantingDate: '2025-07-12',
        plantingArea: 25.5,
        observations: 'Plantio de teste',
      };
      const mockUser = { id: 'user-123' } as User;
      const mockResult = {
        id: 'culture-456',
        propertyId: 'property-123',
        cultureName: 'Milho Verde',
        cultivar: 'AG 1051',
        userId: 'user-123',
        cycle: 120,
        origin: CultureOrigin.ORGANIC,
        supplier: 'Sementes Brasil Ltda',
        plantingDate: new Date('2025-07-12'),
        plantingArea: 25.5,
        observations: 'Plantio de teste',
        property: {
          id: 'property-123',
          name: 'Fazenda Teste',
        },
      };

      mockCulturesService.create.mockResolvedValue(mockResult);

      // Act
      const result = await controller.create(createCultureDto, mockUser);

      // Assert
      expect(mockCulturesService.create).toHaveBeenCalledWith(
        createCultureDto,
        mockUser.id,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll', () => {
    it('deve chamar o service.findAll com paginação padrão', async () => {
      // Arrange
      const mockUser = { id: 'user-123' } as User;
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        lastPage: 0,
      };

      mockCulturesService.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await controller.findAll(mockUser);

      // Assert
      expect(mockCulturesService.findAll).toHaveBeenCalledWith(
        mockUser.id,
        1,
        10,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(mockResult);
    });

    it('deve chamar o service.findAll com paginação customizada', async () => {
      // Arrange
      const mockUser = { id: 'user-123' } as User;
      const mockResult = {
        data: [],
        total: 0,
        page: 2,
        lastPage: 3,
      };

      mockCulturesService.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await controller.findAll(mockUser, '2', '20');

      // Assert
      expect(mockCulturesService.findAll).toHaveBeenCalledWith(
        mockUser.id,
        2,
        20,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserProperties', () => {
    it('deve retornar as propriedades do usuário', async () => {
      // Arrange
      const mockUser = { id: 'user-123' } as User;
      const mockProperties = [
        {
          id: 'prop-1',
          name: 'Fazenda A',
          address: 'Endereço A',
          totalArea: 100,
          productionArea: 80,
          mainCrop: 'Soja',
        },
        {
          id: 'prop-2',
          name: 'Fazenda B',
          address: 'Endereço B',
          totalArea: 200,
          productionArea: 150,
          mainCrop: 'Milho',
        },
      ];

      mockCulturesService.getUserProperties.mockResolvedValue(mockProperties);

      // Act
      const result = await controller.getUserProperties(mockUser);

      // Assert
      expect(mockCulturesService.getUserProperties).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual(mockProperties);
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma cultura específica', async () => {
      // Arrange
      const mockUser = { id: 'user-123' } as User;
      const cultureId = 'culture-456';
      const mockCulture = {
        id: cultureId,
        propertyId: 'property-123',
        cultureName: 'Milho Verde',
        cultivar: 'AG 1051',
        userId: mockUser.id,
        cycle: 90,
        origin: CultureOrigin.CONVENTIONAL,
        supplier: 'Fornecedor XYZ',
        plantingDate: new Date('2025-04-20'),
        plantingArea: 18.0,
        observations: null,
        property: {
          id: 'property-123',
          name: 'Fazenda Teste',
        },
      };

      mockCulturesService.findOne.mockResolvedValue(mockCulture);

      // Act
      const result = await controller.findOne(cultureId, mockUser);

      // Assert
      expect(mockCulturesService.findOne).toHaveBeenCalledWith(
        cultureId,
        mockUser.id,
      );
      expect(result).toEqual(mockCulture);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CulturesService } from './cultures.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Culture } from './entities/culture.entity';
import { Property } from '../properties/entities/property.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateCultureDto } from './dto/create-culture.dto';
import { CultureOrigin } from './enums/culture-origin.enum';

describe('CulturesService', () => {
  let service: CulturesService;
  let culturesRepository: Repository<Culture>;
  let propertiesRepository: Repository<Property>;

  const mockCulturesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockPropertiesRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CulturesService,
        {
          provide: getRepositoryToken(Culture),
          useValue: mockCulturesRepository,
        },
        {
          provide: getRepositoryToken(Property),
          useValue: mockPropertiesRepository,
        },
      ],
    }).compile();

    service = module.get<CulturesService>(CulturesService);
    culturesRepository = module.get<Repository<Culture>>(
      getRepositoryToken(Culture),
    );
    propertiesRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-123';
    const propertyId = 'property-456';
    const createCultureDto: CreateCultureDto = {
      propertyId,
      cultureName: 'Tomate Cereja',
      cultivar: 'Sweet 100',
      cycle: 120,
      origin: CultureOrigin.ORGANIC,
      supplier: 'Sementes Brasil Ltda',
      plantingDate: '2025-07-12',
      plantingArea: 25.5,
      observations: 'Plantio de teste',
    };

    it('deve criar uma cultura com sucesso quando a propriedade pertence ao usuário', async () => {
      // Arrange
      const mockProperty = {
        id: propertyId,
        userId,
        isActive: true,
        name: 'Fazenda Teste',
      };

      const mockCulture = {
        id: 'culture-789',
        propertyId,
        userId,
        cycle: 120,
        origin: CultureOrigin.ORGANIC,
        supplier: 'Sementes Brasil Ltda',
        plantingDate: new Date('2025-07-12'),
        plantingArea: 25.5,
        observations: 'Plantio de teste',
        isActive: true,
      };

      const mockCultureWithProperty = {
        ...mockCulture,
        property: mockProperty,
      };

      mockPropertiesRepository.findOne.mockResolvedValue(mockProperty);
      mockCulturesRepository.create.mockReturnValue(mockCulture);
      mockCulturesRepository.save.mockResolvedValue(mockCulture);
      mockCulturesRepository.findOne.mockResolvedValue(mockCultureWithProperty);

      // Act
      const result = await service.create(createCultureDto, userId);

      // Assert
      expect(mockPropertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: propertyId, isActive: true },
      });
      expect(mockCulturesRepository.create).toHaveBeenCalledWith({
        propertyId,
        cultureName: 'Tomate Cereja',
        cultivar: 'Sweet 100',
        cycle: 120,
        origin: CultureOrigin.ORGANIC,
        supplier: 'Sementes Brasil Ltda',
        plantingDate: '2025-07-12',
        plantingArea: 25.5,
        observations: 'Plantio de teste',
        userId,
      });
      expect(mockCulturesRepository.save).toHaveBeenCalledWith(mockCulture);
      expect(result).toBeDefined();
      expect(result.data.id).toBe('culture-789');
    });

    it('deve lançar NotFoundException quando a propriedade não existe', async () => {
      // Arrange
      mockPropertiesRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createCultureDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createCultureDto, userId)).rejects.toThrow(
        'Propriedade não encontrada',
      );
      expect(mockCulturesRepository.create).not.toHaveBeenCalled();
      expect(mockCulturesRepository.save).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando a propriedade está inativa', async () => {
      // Arrange
      const inactiveProperty = {
        id: propertyId,
        userId,
        isActive: false,
      };
      mockPropertiesRepository.findOne.mockResolvedValue(null); // isActive: true no where clause

      // Act & Assert
      await expect(service.create(createCultureDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException quando a propriedade pertence a outro usuário', async () => {
      // Arrange
      const mockProperty = {
        id: propertyId,
        userId: 'outro-usuario-999',
        isActive: true,
      };
      mockPropertiesRepository.findOne.mockResolvedValue(mockProperty);

      // Act & Assert
      await expect(service.create(createCultureDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.create(createCultureDto, userId)).rejects.toThrow(
        'Você não tem permissão para criar cultura nesta propriedade',
      );
      expect(mockCulturesRepository.create).not.toHaveBeenCalled();
      expect(mockCulturesRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getUserProperties', () => {
    it('deve retornar as propriedades ativas do usuário ordenadas por nome', async () => {
      // Arrange
      const userId = 'user-123';
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

      mockPropertiesRepository.find.mockResolvedValue(mockProperties);

      // Act
      const result = await service.getUserProperties(userId);

      // Assert
      expect(mockPropertiesRepository.find).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        select: [
          'id',
          'name',
          'address',
          'totalArea',
          'productionArea',
          'mainCrop',
        ],
        order: { name: 'ASC' },
      });
      expect(result).toEqual(mockProperties);
      expect(result).toHaveLength(2);
    });

    it('deve retornar array vazio quando o usuário não tem propriedades', async () => {
      // Arrange
      const userId = 'user-sem-propriedades';
      mockPropertiesRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getUserProperties(userId);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findAll', () => {
    it('deve retornar culturas paginadas do usuário', async () => {
      // Arrange
      const userId = 'user-123';
      const mockCultures = [
        {
          id: 'culture-1',
          propertyId: 'prop-1',
        cultureName: 'Tomate Cereja',
        cultivar: 'Sweet 100',
          userId,
          cycle: 90,
          origin: CultureOrigin.CONVENTIONAL,
          supplier: 'Fornecedor XYZ',
          plantingDate: new Date('2025-03-15'),
          plantingArea: 15.75,
          observations: null,
          isActive: true,
          property: { id: 'prop-1', name: 'Fazenda A' },
          createdAt: new Date(),
        },
      ];

      mockCulturesRepository.findAndCount.mockResolvedValue([
        mockCultures,
        1,
      ]);

      // Act
      const result = await service.findAll(userId, 1, 10);

      // Assert
      expect(mockCulturesRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        relations: ['property'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.lastPage).toBe(1);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma cultura específica do usuário', async () => {
      // Arrange
      const userId = 'user-123';
      const cultureId = 'culture-123';
      const mockCulture = {
        id: cultureId,
        propertyId: 'prop-1',
        cultureName: 'Tomate Cereja',
        cultivar: 'Sweet 100',
        userId,
        cycle: 100,
        origin: CultureOrigin.TRANSGENIC,
        supplier: 'Agro Seeds Inc',
        plantingDate: new Date('2025-05-20'),
        plantingArea: 50.0,
        observations: 'Cultura em teste',
        isActive: true,
        property: { id: 'prop-1', name: 'Fazenda A' },
      };

      mockCulturesRepository.findOne.mockResolvedValue(mockCulture);

      // Act
      const result = await service.findOne(cultureId, userId);

      // Assert
      expect(mockCulturesRepository.findOne).toHaveBeenCalledWith({
        where: { id: cultureId, isActive: true },
        relations: ['property'],
      });
      expect(result).toBeDefined();
    });

    it('deve lançar NotFoundException quando a cultura não existe', async () => {
      // Arrange
      const userId = 'user-123';
      const cultureId = 'culture-inexistente';
      mockCulturesRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(cultureId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(cultureId, userId)).rejects.toThrow(
        'Cultura não encontrada',
      );
    });

    it('deve lançar ForbiddenException quando a cultura pertence a outro usuário', async () => {
      // Arrange
      const userId = 'user-123';
      const cultureId = 'culture-123';
      const mockCulture = {
        id: cultureId,
        userId: 'outro-usuario-999',
        cycle: 100,
        origin: CultureOrigin.ORGANIC,
        supplier: 'Fornecedor ABC',
        plantingDate: new Date('2025-06-10'),
        plantingArea: 30.25,
        observations: 'Observação',
        isActive: true,
      };

      mockCulturesRepository.findOne.mockResolvedValue(mockCulture);

      // Act & Assert
      await expect(service.findOne(cultureId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.findOne(cultureId, userId)).rejects.toThrow(
        'Você não tem permissão para acessar esta cultura',
      );
    });
  });
});

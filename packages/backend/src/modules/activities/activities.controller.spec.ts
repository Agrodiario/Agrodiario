import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import { ActivityController } from './activities.controller';
import { ActivityService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityType } from './entities/activity.entity';

const mockActivityService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockFile: Express.Multer.File = {
  fieldname: 'files',
  originalname: 'test-file.png',
  encoding: '7bit',
  mimetype: 'image/png',
  buffer: Buffer.from('test'),
  size: 1024,
  destination: './uploads',
  filename: 'test-file.png',
  stream: new Readable(),
  path: ''
};

const mockRequest = {
  user: { id: 1, email: 'teste@agrodiario.com' },
};

describe('ActivityController', () => {
  let controller: ActivityController;
  let service: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivityService,
          useValue: mockActivityService,
        },
      ],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
    service = module.get<ActivityService>(ActivityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with dto, userId and files', async () => {
      const createDto: CreateActivityDto = {
        date: '2025-11-20',
        propriedade: 'Fazenda Teste',
        tipo: ActivityType.PREPARO,
        descricao: 'Teste',
        responsavel: 'João',
        titulo: 'Atividade Teste',
        operacao: ''
      };

      const expectedResult = { id: 1, ...createDto, userId: 1 };
      
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult as any);

      const result = await controller.create(createDto, [mockFile], mockRequest);

      expect(service.create).toHaveBeenCalledWith(createDto, mockRequest.user.id, [mockFile]);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with correct pagination, order and userId', async () => {
      const page = 1;
      const limit = 10;
      const order = 'asc'; 
      const search = 'Soja';

      const expectedResult = { data: [], total: 0 };
      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      await controller.findAll(page, limit, order, mockRequest, search);

      expect(service.findAll).toHaveBeenCalledWith(
        page, 
        limit, 
        'ASC', 
        search, 
        mockRequest.user.id
      );
    });

    it('should use DESC as default order if not provided', async () => {
      await controller.findAll(1, 10, 'DESC', mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(
        1, 
        10, 
        'DESC', 
        undefined, 
        mockRequest.user.id
      );
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id and userId', async () => {
      const activityId = 5;
      const expectedResult = { id: activityId, titulo: 'Teste' };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult as any);

      const result = await controller.findOne(activityId, mockRequest);

      expect(service.findOne).toHaveBeenCalledWith(activityId, mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should call service.update with id, dto, userId and files', async () => {
      const activityId = 1;
      const updateDto: UpdateActivityDto = { titulo: 'Novo Título' };
      const expectedResult = { id: activityId, ...updateDto };

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult as any);

      const result = await controller.update(activityId, updateDto, [mockFile], mockRequest);

      expect(service.update).toHaveBeenCalledWith(
        activityId, 
        updateDto, 
        mockRequest.user.id, 
        [mockFile]
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should call service.remove with id and userId', async () => {
      const activityId = 1;
      
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(activityId, mockRequest);

      expect(service.remove).toHaveBeenCalledWith(activityId, mockRequest.user.id);
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivityService } from './activities.service'; 
import { Activity } from './entities/activity.entity';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';


jest.mock('fs');

const mockUser = { id: 1 };
const mockFile: Express.Multer.File = {
  fieldname: 'files',
  originalname: 'foto.png',
  encoding: '7bit',
  mimetype: 'image/png',
  buffer: Buffer.from(''),
  size: 100,
  destination: './uploads',
  filename: '123-foto.png',
  path: 'uploads/123-foto.png',
  stream: new (require('stream').Readable)(),
};

const mockActivityArray = [
  { id: 1, titulo: 'Atividade 1', userId: 1 },
  { id: 2, titulo: 'Atividade 2', userId: 1 },
];

const mockOneActivity = {
  id: 1,
  titulo: 'Atividade Teste',
  anexos: ['antigo.png'],
  userId: 1,
};

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([mockActivityArray, 2]),
};

const mockActivityRepository = {
  create: jest.fn().mockImplementation((dto) => dto),
  save: jest.fn().mockImplementation((activity) => Promise.resolve({ id: 1, ...activity })),
  findOne: jest.fn().mockImplementation((options) => {
    const { where } = options;
    if (where.id === 1 && where.userId === 1) return Promise.resolve(mockOneActivity);
    return Promise.resolve(null);
  }),
  merge: jest.fn().mockImplementation((entity, dto) => ({ ...entity, ...dto })),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: getRepositoryToken(Activity),
          useValue: mockActivityRepository,
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new activity with userId and files', async () => {
      const createDto = {
        date: '2025-11-20',
        propriedade: 'Sítio',
        tipo: 'preparo' as any,
        descricao: 'Teste',
        responsavel: 'João',
        titulo: 'Nova',
        operacao: 'Operação Teste',
      };

      const result = await service.create(createDto, 1, [mockFile]);

      expect(mockActivityRepository.create).toHaveBeenCalledWith({
        ...createDto,
        anexos: ['123-foto.png'], 
        userId: 1,
      });
      expect(mockActivityRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ userId: 1, anexos: ['123-foto.png'] }));
    });
  });

  describe('findAll', () => {
    it('should return paginated data with userId filter', async () => {
      const result = await service.findAll(1, 10, 'DESC', undefined, 1);

      expect(mockActivityRepository.createQueryBuilder).toHaveBeenCalledWith('activity');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('activity.userId = :userId', { userId: 1 });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('activity.date', 'DESC');
      expect(result).toEqual({ data: mockActivityArray, total: 2 });
    });

    it('should apply search filter if provided', async () => {
      const searchTerm = 'Soja';
      await service.findAll(1, 10, 'DESC', searchTerm, 1);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return the activity if found', async () => {
      const result = await service.findOne(1, 1);
      expect(result).toEqual(mockOneActivity);
    });

    it('should throw NotFoundException if not found', async () => {
      try {
        await service.findOne(999, 1);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('update', () => {
    it('should update activity and handle file removal', async () => {
      const updateDto = {
        titulo: 'Titulo Atualizado',
        removedFiles: JSON.stringify(['antigo.png']), 
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await service.update(1, updateDto, 1, [mockFile]);

      expect(fs.unlinkSync).toHaveBeenCalled(); 

      expect(mockActivityRepository.merge).toHaveBeenCalledWith(
        mockOneActivity,
        expect.objectContaining({
          titulo: 'Titulo Atualizado',
          anexos: ['123-foto.png'], 
        })
      );
      
      expect(mockActivityRepository.save).toHaveBeenCalled();
    });

    it('should handle update without file changes', async () => {
      const updateDto = { titulo: 'Apenas texto' };
      
      await service.update(1, updateDto, 1, []); 

      expect(mockActivityRepository.merge).toHaveBeenCalledWith(
        mockOneActivity,
        expect.objectContaining({
          titulo: 'Apenas texto',
          anexos: ['antigo.png'], 
        })
      );
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete files and the activity record', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await service.remove(1, 1);

      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(mockActivityRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if activity does not exist or user is wrong', async () => {
      mockActivityRepository.delete.mockResolvedValueOnce({ affected: 0 });

      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());

      await expect(service.remove(99, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
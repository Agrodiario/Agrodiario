// src/activities/activity.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, ILike, Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { join } from 'path';
import * as fs from 'fs'; 

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async create(
    createActivityDto: CreateActivityDto,
    userId: number, 
    files: Array<Express.Multer.File> = []
  ): Promise<Activity> {
    
    const fileNames = files ? files.map(file => file.filename) : [];

    const newActivity = this.activityRepository.create({
      ...createActivityDto,
      anexos: fileNames,
      userId: userId,
    });

    return await this.activityRepository.save(newActivity);
  }

  async findAll(
    page: number = 1, 
    limit: number = 10, 
    order: 'ASC' | 'DESC' = 'DESC',
    search?: string,
    userId?: number,
  ): Promise<{ data: Activity[], total: number }> {
    
    const skip = (page - 1) * limit;

    const query = this.activityRepository.createQueryBuilder('activity');
    query.where('activity.userId = :userId', { userId });

    if (search && search.trim().length > 0) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('activity.titulo ILIKE :search', { search: `%${search}%` })
            .orWhere('activity.descricao ILIKE :search', { search: `%${search}%` })
            .orWhere('activity.propriedade ILIKE :search', { search: `%${search}%` })
            .orWhere('activity.insumoNome ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    query.orderBy('activity.date', order);
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number, userId: number): Promise<Activity> {
    const activity = await this.activityRepository.findOne({ where: { id, userId } });
    if (!activity) {
      throw new NotFoundException(`Atividade com ID ${id} não encontrada.`);
    }
    return activity;
  }

  async update(
    id: number, 
    updateActivityDto: UpdateActivityDto,
    userId: number,
    files: Array<Express.Multer.File> = []
  ): Promise<Activity> {
    const activity = await this.findOne(id, userId);

    let currentAnexos = activity.anexos || [];

    if (updateActivityDto.removedFiles) {
      try {
        const filesToRemove: string[] = JSON.parse(updateActivityDto.removedFiles);
        
        currentAnexos = currentAnexos.filter(filename => !filesToRemove.includes(filename));

        filesToRemove.forEach(filename => {
          const filePath = join(__dirname, '..', '..', 'uploads', filename);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); 
          }
        });
      } catch (error) {
        console.error('Erro ao processar arquivos removidos:', error);
      }
    }

    const newFileNames = files ? files.map(file => file.filename) : [];
    
    const finalAnexos = [...currentAnexos, ...newFileNames];

    const { removedFiles, ...dataToUpdate } = updateActivityDto;

    const updatedActivity = this.activityRepository.merge(activity, {
      ...dataToUpdate,
      anexos: finalAnexos,
    });

    return await this.activityRepository.save(updatedActivity);
  }

  async remove(id: number, userId: number): Promise<void> {
    const activity = await this.findOne(id, userId);

    if (activity.anexos && activity.anexos.length > 0) {
      activity.anexos.forEach(filename => {
        const filePath = join(__dirname, '..', '..', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error(`Erro ao deletar anexo ${filename}`, e);
          }
        }
      });
    }

    const result = await this.activityRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Atividade com ID ${id} não encontrada.`);
    }
  }
}
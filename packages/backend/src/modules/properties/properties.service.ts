import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyResponseDto } from './dto/property-response.dto';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto, 
    userId: string,
    files: Array<Express.Multer.File> = [] // Novo argumento
  ): Promise<PropertyResponseDto> {
    
    // Tratamento de dados numéricos (FormData envia como string)
    const totalArea = Number(createPropertyDto.totalArea);
    const productionArea = Number(createPropertyDto.productionArea);

    if (productionArea > totalArea) {
      throw new BadRequestException('A área de produção não pode ser maior que a área total');
    }

    // Processar nomes dos arquivos
    const fileNames = files ? files.map(file => file.filename) : [];

    // Preparar objeto para salvar
    const propertyData = {
      ...createPropertyDto,
      userId,
      totalArea,
      productionArea,
      certificates: fileNames, // Salva o array de strings
    };

    const property = this.propertiesRepository.create(propertyData);
    const savedProperty = await this.propertiesRepository.save(property);
    
    return new PropertyResponseDto(savedProperty);
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: PropertyResponseDto[]; total: number; page: number; lastPage: number }> {
    const skip = (page - 1) * limit;

    const [properties, total] = await this.propertiesRepository.findAndCount({
      where: { userId, isActive: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const data = properties.map((property) => new PropertyResponseDto(property));

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<PropertyResponseDto> {
    const property = await this.propertiesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!property) {
      throw new NotFoundException('Propriedade não encontrada');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar esta propriedade');
    }

    return new PropertyResponseDto(property);
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    userId: string,
    files: Array<Express.Multer.File> = [] // Novo argumento
  ): Promise<PropertyResponseDto> {
    const property = await this.propertiesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!property) throw new NotFoundException('Propriedade não encontrada');
    if (property.userId !== userId) throw new ForbiddenException('Você não tem permissão para editar esta propriedade');

    // 1. Lógica de Validação de Área
    const newTotalArea = Number(updatePropertyDto.totalArea ?? property.totalArea);
    const newProductionArea = Number(updatePropertyDto.productionArea ?? property.productionArea);

    if (newProductionArea > newTotalArea) {
      throw new BadRequestException('A área de produção não pode ser maior que a área total');
    }

    // 2. Lógica de Arquivos (Remoção e Adição)
    let currentCertificates = property.certificates || [];

    // Se houver arquivos para remover (vem como string JSON do front)
    if (updatePropertyDto.removedFiles) {
      try {
        const filesToRemove: string[] = JSON.parse(updatePropertyDto.removedFiles as any);
        
        // Filtra o array do banco
        currentCertificates = currentCertificates.filter(f => !filesToRemove.includes(f));
        
        // Deleta do disco físico
        filesToRemove.forEach(f => {
          const filePath = join(process.cwd(), 'uploads', f);
          if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) { console.error(`Erro ao deletar ${f}`, e); }
          }
        });
      } catch (e) {
        console.error('Erro ao processar removedFiles', e);
      }
    }

    const newFileNames = files ? files.map(f => f.filename) : [];
    const finalCertificates = [...currentCertificates, ...newFileNames];

    const { removedFiles, ...dataToUpdate } = updatePropertyDto;

    const finalData: any = { ...dataToUpdate, certificates: finalCertificates };

    this.propertiesRepository.merge(property, finalData);
    
    const updatedProperty = await this.propertiesRepository.save(property);
    return new PropertyResponseDto(updatedProperty);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const property = await this.propertiesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!property) throw new NotFoundException('Propriedade não encontrada');
    if (property.userId !== userId) throw new ForbiddenException('Você não tem permissão para deletar esta propriedade');

    property.isActive = false;
    await this.propertiesRepository.save(property);

    return { message: 'Propriedade deletada com sucesso' };
  }

  async hardRemove(id: string, userId: string): Promise<{ message: string }> {
    const property = await this.propertiesRepository.findOne({ where: { id } });

    if (!property) throw new NotFoundException('Propriedade não encontrada');
    if (property.userId !== userId) throw new ForbiddenException('Você não tem permissão para deletar esta propriedade');

    // Opcional: Deletar arquivos físicos antes de remover do banco
    if (property.certificates && property.certificates.length > 0) {
        property.certificates.forEach(f => {
            const filePath = join(process.cwd(), 'uploads', f);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
    }

    await this.propertiesRepository.remove(property);
    return { message: 'Propriedade deletada permanentemente' };
  }
}
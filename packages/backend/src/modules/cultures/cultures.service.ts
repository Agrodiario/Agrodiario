import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Culture } from './entities/culture.entity';
import { Property } from '../properties/entities/property.entity';
import { CreateCultureDto } from './dto/create-culture.dto';
import { UpdateCultureDto } from './dto/update-culture.dto';
import { CultureResponseDto } from './dto/culture-response.dto';

@Injectable()
export class CulturesService {
  private static readonly MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

  constructor(
    @InjectRepository(Culture)
    private readonly culturesRepository: Repository<Culture>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  async create(
    createCultureDto: CreateCultureDto,
    userId: string,
  ): Promise<{ message: string; data: CultureResponseDto }> {
    await this.validatePropertyOwnership(createCultureDto.propertyId, userId);

    const culture = this.culturesRepository.create({
      ...createCultureDto,
      userId,
    });

    const savedCulture = await this.culturesRepository.save(culture);
    
    // Load the property relationship
    const cultureWithProperty = await this.culturesRepository.findOne({
      where: { id: savedCulture.id },
      relations: ['property'],
    });

    return {
      message: 'Cultura adicionada com sucesso',
      data: this.mapToResponseDto(cultureWithProperty),
    };
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ data: CultureResponseDto[]; total: number; page: number; lastPage: number }> {
    const skip = (page - 1) * limit;

    // Build query with search
    const queryBuilder = this.culturesRepository
      .createQueryBuilder('culture')
      .leftJoinAndSelect('culture.property', 'property')
      .leftJoinAndSelect('culture.activities', 'activities')
      .where('culture.userId = :userId', { userId });

    this.applySearchFilter(queryBuilder, search);
    this.applySorting(queryBuilder, sortBy, sortOrder);

    queryBuilder
      .skip(skip)
      .take(limit);

    const [cultures, total] = await queryBuilder.getManyAndCount();

    // Auto-deactivate completed cultures
    await this.autoDeactivateCompletedCycles(cultures);

    const data = this.mapCulturesToResponseDtos(cultures);
    this.sortByCalculatedFields(data, sortBy, sortOrder);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<CultureResponseDto> {
    const culture = await this.culturesRepository.findOne({
      where: { id, isActive: true },
      relations: ['property', 'activities'],
    });

    if (!culture) {
      throw new NotFoundException('Cultura não encontrada');
    }

    // Verify ownership
    if (culture.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar esta cultura');
    }

    // Auto-deactivate if cycle is complete
    await this.autoDeactivateCompletedCycles([culture]);

    const dto = this.mapToResponseDto(culture);
    dto.activitiesCount = culture.activities?.length || 0;
    
    return dto;
  }

  async update(
    id: string,
    updateCultureDto: UpdateCultureDto,
    userId: string,
  ): Promise<{ message: string; data: CultureResponseDto }> {
    const culture = await this.culturesRepository.findOne({
      where: { id, isActive: true },
      relations: ['property'],
    });

    if (!culture) {
      throw new NotFoundException('Cultura não encontrada');
    }

    if (culture.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar esta cultura');
    }

    // Convert DTO to entity format and update fields
    if (updateCultureDto.cultureName !== undefined) culture.cultureName = updateCultureDto.cultureName;
    if (updateCultureDto.cultivar !== undefined) culture.cultivar = updateCultureDto.cultivar;
    if (updateCultureDto.cycle !== undefined) culture.cycle = updateCultureDto.cycle;
    if (updateCultureDto.origin !== undefined) culture.origin = updateCultureDto.origin;
    if (updateCultureDto.supplier !== undefined) culture.supplier = updateCultureDto.supplier;
    if (updateCultureDto.plantingDate !== undefined) culture.plantingDate = new Date(updateCultureDto.plantingDate);
    if (updateCultureDto.plantingArea !== undefined) culture.plantingArea = updateCultureDto.plantingArea;
    if (updateCultureDto.observations !== undefined) culture.observations = updateCultureDto.observations;

    const updatedCulture = await this.culturesRepository.save(culture);

    // Reload with all relations
    const cultureWithRelations = await this.culturesRepository.findOne({
      where: { id: updatedCulture.id },
      relations: ['property', 'activities'],
    });

    const dto = this.mapToResponseDto(cultureWithRelations);
    dto.activitiesCount = cultureWithRelations.activities?.length || 0;

    return {
      message: 'Alterações salvas com sucesso',
      data: dto,
    };
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const culture = await this.culturesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!culture) {
      throw new NotFoundException('Cultura não encontrada');
    }

    if (culture.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para excluir esta cultura');
    }

    await this.culturesRepository.remove(culture);

    return {
      message: 'Cultura excluída com sucesso',
    };
  }

  async getUserProperties(userId: string): Promise<any[]> {
    const properties = await this.propertiesRepository.find({
      where: { userId, isActive: true },
      select: ['id', 'name', 'address', 'totalArea', 'productionArea', 'mainCrop'],
      order: { name: 'ASC' },
    });

    return properties;
  }

  private mapToResponseDto(culture: Culture): CultureResponseDto {
    const daysElapsed = this.calculateDaysElapsed(culture.plantingDate);
    
    const expectedHarvestDate = this.calculateExpectedHarvestDate(culture.plantingDate, culture.cycle);
    
    const daysRemaining = culture.cycle - daysElapsed;
    const isCycleComplete = this.isCycleComplete(culture.plantingDate, culture.cycle);

    const response: CultureResponseDto = {
      id: culture.id,
      propertyId: culture.propertyId,
      userId: culture.userId,
      cultureName: culture.cultureName,
      cultivar: culture.cultivar,
      cycle: culture.cycle,
      origin: culture.origin,
      supplier: culture.supplier,
      plantingDate: culture.plantingDate,
      plantingArea: culture.plantingArea,
      observations: culture.observations,
      isActive: culture.isActive,
      createdAt: culture.createdAt,
      updatedAt: culture.updatedAt,
      
      // Calculated fields
      daysElapsed: Math.max(0, daysElapsed), // Don't return negative days if planting is in future
      daysRemaining,
      isCycleComplete,
      expectedHarvestDate,
    };

    if (culture.property) {
      response.property = {
        id: culture.property.id,
        name: culture.property.name,
        address: culture.property.address,
        totalArea: culture.property.totalArea,
        productionArea: culture.property.productionArea,
        mainCrop: culture.property.mainCrop,
      };
    }

    return response;
  }

  /**
   * Validates that a property exists and belongs to the user
   */
  private async validatePropertyOwnership(propertyId: string, userId: string): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id: propertyId, isActive: true },
    });

    if (!property) {
      throw new NotFoundException('Propriedade não encontrada');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para criar cultura nesta propriedade');
    }

    return property;
  }

  /**
   * Calculates the number of days elapsed since planting date
   */
  private calculateDaysElapsed(plantingDate: Date): number {
    const today = this.getTodayAtMidnight();
    const planting = this.getDateAtMidnight(plantingDate);
    
    const diffTime = today.getTime() - planting.getTime();
    return Math.floor(diffTime / CulturesService.MILLISECONDS_PER_DAY);
  }

  /**
   * Calculates the expected harvest date based on planting date and cycle
   */
  private calculateExpectedHarvestDate(plantingDate: Date, cycle: number): Date {
    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(harvestDate.getDate() + cycle);
    return harvestDate;
  }

  /**
   * Checks if a culture's cycle is complete
   */
  private isCycleComplete(plantingDate: Date, cycle: number): boolean {
    const today = this.getTodayAtMidnight();
    const expectedHarvestDate = this.calculateExpectedHarvestDate(plantingDate, cycle);
    return today >= expectedHarvestDate;
  }

  /**
   * Auto-deactivates cultures that have completed their cycle
   */
  private async autoDeactivateCompletedCycles(cultures: Culture[]): Promise<void> {
    const culturesToDeactivate = cultures.filter((culture) => {
      if (!culture.isActive) return false;
      return this.calculateDaysElapsed(culture.plantingDate) > culture.cycle;
    });

    if (culturesToDeactivate.length > 0) {
      const cultureIds = culturesToDeactivate.map(c => c.id);
      
      await this.culturesRepository.update(
        { id: In(cultureIds) },
        { isActive: false }
      );
      
      // Update entities in memory to reflect database state
      culturesToDeactivate.forEach(culture => {
        culture.isActive = false;
      });
    }
  }

  /**
   * Applies search filter to query builder
   */
  private applySearchFilter(queryBuilder: any, search?: string): void {
    if (search && search.trim()) {
      queryBuilder.andWhere(
        '(LOWER(culture.cultureName) LIKE LOWER(:search) OR ' +
        'LOWER(culture.cultivar) LIKE LOWER(:search) OR ' +
        'LOWER(property.name) LIKE LOWER(:search))',
        { search: `%${search.trim()}%` }
      );
    }
  }

  /**
   * Applies sorting to query builder
   */
  private applySorting(
    queryBuilder: any,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): void {
    const sortField = this.getSortField(sortBy);
    queryBuilder.orderBy(sortField, sortOrder);
  }

  /**
   * Maps sort parameter to database field
   */
  private getSortField(sortBy?: string): string {
    const sortFieldMap: Record<string, string> = {
      plantingDate: 'culture.plantingDate',
      cultureName: 'culture.cultureName',
      plantingArea: 'culture.plantingArea',
      propertyName: 'property.name',
      cycle: 'culture.cycle',
    };

    return sortFieldMap[sortBy] || 'culture.createdAt';
  }

  /**
   * Maps array of cultures to response DTOs
   */
  private mapCulturesToResponseDtos(cultures: Culture[]): CultureResponseDto[] {
    return cultures.map((culture) => {
      const dto = this.mapToResponseDto(culture);
      dto.activitiesCount = culture.activities?.length || 0;
      return dto;
    });
  }

  /**
   * Sorts response DTOs by calculated fields
   */
  private sortByCalculatedFields(
    data: CultureResponseDto[],
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): void {
    if (sortBy === 'daysRemaining' || sortBy === 'daysElapsed') {
      const field = sortBy as 'daysRemaining' | 'daysElapsed';
      data.sort((a, b) => {
        const comparison = a[field] - b[field];
        return sortOrder === 'ASC' ? comparison : -comparison;
      });
    }
  }

  /**
   * Returns today's date with time set to midnight
   */
  private getTodayAtMidnight(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Returns a date with time set to midnight
   */
  private getDateAtMidnight(date: Date): Date {
    const midnight = new Date(date);
    midnight.setHours(0, 0, 0, 0);
    return midnight;
  }
}

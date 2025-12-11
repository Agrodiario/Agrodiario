import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

    const plantingDate = this.parseDateString(createCultureDto.plantingDate);
    const isActive = this.shouldBeActive(plantingDate, createCultureDto.cycle);

    const culture = this.culturesRepository.create({
      ...createCultureDto,
      plantingDate,
      isActive,
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
      .select([
        'culture',
        'property.id',
        'property.name',
        'property.address',
        'property.totalArea',
        'property.productionArea',
        'property.mainCrop',
        'activities.id',
        'activities.titulo',
        'activities.date',
        'activities.tipo',
        'activities.descricao',
      ])
      .where('culture.userId = :userId', { userId });

    this.applySearchFilter(queryBuilder, search);
    this.applySorting(queryBuilder, sortBy, sortOrder);

    queryBuilder.skip(skip).take(limit);

    const [cultures, total] = await queryBuilder.getManyAndCount();

    // Update active status based on planting date and cycle
    await this.updateCulturesActiveStatus(cultures);

    const data = this.mapCulturesToResponseDtos(cultures);

    // Log para debug
    console.log('[CulturesService] Total cultures:', total);
    if (data.length > 0) {
      console.log('[CulturesService] First culture activities:', data[0].activities?.length || 0);
      if (data[0].activities && data[0].activities.length > 0) {
        console.log('[CulturesService] First activity:', data[0].activities[0]);
      }
    }
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
      where: { id },
      relations: ['property', 'activities'],
    });

    if (!culture) {
      throw new NotFoundException('Cultura não encontrada');
    }

    // Verify ownership
    if (culture.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar esta cultura');
    }

    // Update active status based on planting date and cycle
    await this.updateCulturesActiveStatus([culture]);

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
      where: { id },
      relations: ['property'],
    });

    if (!culture) {
      throw new NotFoundException('Cultura não encontrada');
    }

    if (culture.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar esta cultura');
    }

    // Convert DTO to entity format and update fields
    if (updateCultureDto.cultureName !== undefined)
      culture.cultureName = updateCultureDto.cultureName;
    if (updateCultureDto.cultivar !== undefined) culture.cultivar = updateCultureDto.cultivar;
    if (updateCultureDto.cycle !== undefined) culture.cycle = updateCultureDto.cycle;
    if (updateCultureDto.origin !== undefined) culture.origin = updateCultureDto.origin;
    if (updateCultureDto.supplier !== undefined) culture.supplier = updateCultureDto.supplier;
    if (updateCultureDto.plantingDate !== undefined)
      culture.plantingDate = this.parseDateString(updateCultureDto.plantingDate);
    if (updateCultureDto.plantingArea !== undefined)
      culture.plantingArea = updateCultureDto.plantingArea;
    if (updateCultureDto.plotName !== undefined) culture.plotName = updateCultureDto.plotName;
    if (updateCultureDto.observations !== undefined)
      culture.observations = updateCultureDto.observations;

    // Recalcular isActive baseado na data de plantio e ciclo
    culture.isActive = this.shouldBeActive(culture.plantingDate, culture.cycle);

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
      where: { id },
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

  async findByProperty(propertyId: string, userId: string): Promise<any[]> {
    const cultures = await this.culturesRepository.find({
      where: { propertyId, userId, isActive: true },
      select: ['id', 'cultureName', 'cultivar', 'cycle', 'plotName'],
      order: { cultureName: 'ASC' },
    });

    return cultures;
  }

  private mapToResponseDto(culture: Culture): CultureResponseDto {
    const plantingDate =
      culture.plantingDate instanceof Date ? culture.plantingDate : new Date(culture.plantingDate);

    const daysElapsed = this.calculateDaysElapsed(plantingDate);

    const expectedHarvestDate = this.calculateExpectedHarvestDate(plantingDate, culture.cycle);

    const daysRemaining = culture.cycle - daysElapsed;
    const isCycleComplete = this.isCycleComplete(plantingDate, culture.cycle);

    const response: CultureResponseDto = {
      id: culture.id,
      propertyId: culture.propertyId,
      userId: culture.userId,
      cultureName: culture.cultureName,
      cultivar: culture.cultivar,
      cycle: culture.cycle,
      origin: culture.origin,
      supplier: culture.supplier,
      plantingDate: plantingDate,
      plantingArea: culture.plantingArea,
      plotName: culture.plotName,
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

    if (culture.activities) {
      response.activities = culture.activities.map((activity) => ({
        id: activity.id,
        titulo: activity.titulo,
        data: activity.date,
        tipo: activity.tipo,
        descricao: activity.descricao,
      }));
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
   * Determines if a culture should be active based on planting date and cycle
   */
  private shouldBeActive(plantingDate: Date, cycle: number): boolean {
    const today = this.getTodayAtMidnight();
    const planting = this.getDateAtMidnight(plantingDate);

    // Se a data de plantio é no futuro, deve ser inativa
    if (planting > today) {
      return false;
    }

    // Se o ciclo já foi completado, deve ser inativa
    if (this.isCycleComplete(plantingDate, cycle)) {
      return false;
    }

    // Caso contrário, deve ser ativa
    return true;
  }

  /**
   * Updates active status of cultures based on planting date and cycle
   */
  private async updateCulturesActiveStatus(cultures: Culture[]): Promise<void> {
    const culturesToUpdate: { culture: Culture; newStatus: boolean }[] = [];

    cultures.forEach((culture) => {
      const shouldBeActive = this.shouldBeActive(culture.plantingDate, culture.cycle);

      if (culture.isActive !== shouldBeActive) {
        culturesToUpdate.push({ culture, newStatus: shouldBeActive });
      }
    });

    if (culturesToUpdate.length > 0) {
      // Update in database
      for (const { culture, newStatus } of culturesToUpdate) {
        await this.culturesRepository.update({ id: culture.id }, { isActive: newStatus });
        // Update in memory
        culture.isActive = newStatus;
      }
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
        { search: `%${search.trim()}%` },
      );
    }
  }

  /**
   * Applies sorting to query builder
   */
  private applySorting(
    queryBuilder: any,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
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
    sortOrder: 'ASC' | 'DESC' = 'DESC',
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

  /**
   * Converts a date string (YYYY-MM-DD) to a Date object at local midnight
   * This avoids timezone issues where dates can shift by a day
   */
  private parseDateString(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }
}

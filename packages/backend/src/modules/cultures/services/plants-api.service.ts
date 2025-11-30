import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { TranslationService } from './translation.service';

export interface WikidataCrop {
  id: string;
  label: string;
  description?: string;
  aliases?: string[];
}

export interface WikidataCultivar {
  id: string;
  label: string;
  description?: string;
}

@Injectable()
export class PlantsApiService {
  private static readonly API_BASE_URL = 'https://trefle.io/api/v1';
  private static readonly API_TIMEOUT = 15000;
  private static readonly DEFAULT_LIMIT = 50;

  private readonly logger = new Logger(PlantsApiService.name);
  private readonly trefleApi: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly translationService: TranslationService,
  ) {
    this.trefleApi = this.createApiClient();
  }

  private createApiClient(): AxiosInstance {
    const apiToken = this.configService.get<string>('TREFLE_API_TOKEN') || 
                     'usr-KHirc_oh8C0Sk_y8uTPn8LmidIo7k66ANcadoCYqjF4';
    
    return axios.create({
      baseURL: PlantsApiService.API_BASE_URL,
      timeout: PlantsApiService.API_TIMEOUT,
      params: { token: apiToken },
    });
  }

  async searchCrops(searchTerm?: string, limit: number = PlantsApiService.DEFAULT_LIMIT): Promise<WikidataCrop[]> {
    try {
      const params = this.buildSearchParams(searchTerm);
      const response = await this.trefleApi.get('/plants/search', { params });

      if (!response.data?.data) {
        return [];
      }

      const plantsWithNames = this.filterPlantsWithCommonName(response.data.data);
      const limitedPlants = plantsWithNames.slice(0, limit);
      const crops = await this.translateAndMapToCrops(limitedPlants);

      this.logger.log(`Found ${crops.length} crops for term: ${searchTerm || 'all'}`);
      return crops;
    } catch (error) {
      this.logger.error(`Trefle API error: ${error.message}`);
      return [];
    }
  }

  async searchCultivars(cropName: string, limit: number = 20): Promise<WikidataCultivar[]> {
    try {
      const params = this.buildSearchParams(cropName);
      const response = await this.trefleApi.get('/plants/search', { params });

      if (!response.data?.data) {
        return [];
      }

      const plantsWithNames = this.filterPlantsWithCommonName(response.data.data);
      const limitedPlants = plantsWithNames.slice(0, limit);
      const cultivars = await this.translateAndMapToCultivars(limitedPlants);

      this.logger.log(`Found ${cultivars.length} cultivars for crop: ${cropName}`);
      return cultivars;
    } catch (error) {
      this.logger.error(`Trefle cultivars error: ${error.message}`);
      return [];
    }
  }

  /**
   * Builds search parameters for Trefle API
   */
  private buildSearchParams(searchTerm?: string): Record<string, any> {
    const params: Record<string, any> = {
      'filter[edible]': true,
    };

    if (searchTerm) {
      params.q = searchTerm;
    }

    return params;
  }

  /**
   * Filters plants that have a common name
   */
  private filterPlantsWithCommonName(plants: any[]): any[] {
    return plants.filter(plant => plant.common_name);
  }

  /**
   * Translates plant names and maps to WikidataCrop format
   */
  private async translateAndMapToCrops(plants: any[]): Promise<WikidataCrop[]> {
    const commonNames = plants.map(plant => plant.common_name);
    const translatedNames = await this.translationService.translateBatch(commonNames);

    return plants.map((plant, index) => ({
      id: plant.id.toString(),
      label: translatedNames[index],
      description: plant.scientific_name,
      aliases: [],
    }));
  }

  /**
   * Translates plant names and maps to WikidataCultivar format
   */
  private async translateAndMapToCultivars(plants: any[]): Promise<WikidataCultivar[]> {
    const commonNames = plants.map(plant => plant.common_name);
    const translatedNames = await this.translationService.translateBatch(commonNames);

    return plants.map((plant, index) => ({
      id: plant.id.toString(),
      label: translatedNames[index],
      description: this.buildCultivarDescription(plant),
    }));
  }

  /**
   * Builds a formatted description for cultivar
   */
  private buildCultivarDescription(plant: any): string {
    const scientificName = plant.scientific_name || '';
    const familyName = plant.family_common_name ? ` (${plant.family_common_name})` : '';
    return `${scientificName}${familyName}`;
  }
}

import { CultureOrigin } from '../enums/culture-origin.enum';

export class CultureResponseDto {
  id: string;
  propertyId: string;
  userId: string;
  cultureName: string;
  cultivar: string;
  cycle: number;
  origin: CultureOrigin;
  supplier: string;
  plantingDate: Date;
  plantingArea: number;
  observations?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Calculated fields
  daysElapsed: number; // Days since planting
  daysRemaining: number; // Days remaining in cycle (can be negative if overdue)
  isCycleComplete: boolean; // True if current date >= planting date + cycle
  expectedHarvestDate: Date; // Planting date + cycle days
  activitiesCount?: number; // Number of activities linked to this culture
  
  property?: {
    id: string;
    name: string;
    address: string;
    totalArea: number;
    productionArea: number;
    mainCrop: string;
  };
}

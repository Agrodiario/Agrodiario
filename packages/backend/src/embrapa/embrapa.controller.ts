import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EmbrapaService } from './embrapa.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard'; 

@Controller('embrapa')
export class EmbrapaController {
  constructor(private readonly embrapaService: EmbrapaService) {}

  @UseGuards(JwtAuthGuard) 
  @Get('insumos')
  async getInsumos(@Query('q') query?: string) {
    return this.embrapaService.getInsumos(query);
  }
}
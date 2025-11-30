import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmbrapaService } from './embrapa.service';
import { EmbrapaController } from './embrapa.controller';

@Module({
  imports: [HttpModule], 
  controllers: [EmbrapaController],
  providers: [EmbrapaService],
})
export class EmbrapaModule {}
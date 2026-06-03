import { Module } from '@nestjs/common';
import { FrutasService } from './frutas.service';
import { FrutasController } from './frutas.controller';
import { PrismaModule } from '../../config/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FrutasController],
  providers: [FrutasService],
  exports: [FrutasService],
})
export class FrutasModule { }
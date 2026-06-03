import { Module } from '@nestjs/common';
import { OperacionesCargaService } from './operaciones-carga.service';
import { OperacionesCargaController } from './operaciones-carga.controller';
import { PrismaModule } from '../../config/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OperacionesCargaController],
  providers: [OperacionesCargaService],
})
export class OperacionesCargaModule { }
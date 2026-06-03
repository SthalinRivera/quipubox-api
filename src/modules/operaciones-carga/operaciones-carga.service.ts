import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateOperacionCargaDto } from './dto/create-operaciones-carga.dto';
import { UpdateOperacionCargaDto } from './dto/update-operaciones-carga.dto';
import { QueryOperacionesCargaDto } from './dto/query-operaciones-carga.dto';

@Injectable()
export class OperacionesCargaService {
  constructor(private prisma: PrismaService) { }

  async create(createDto: CreateOperacionCargaDto) {
    // Verificar que las relaciones existan
    await this.validateRelations(createDto);

    return this.prisma.operaciones_carga.create({
      data: {
        id_empresa: 1, // Obtener de algún contexto (ej. JWT). Ajusta según tu auth.
        id_sede_origen: createDto.id_sede_origen,
        id_sede_destino: createDto.id_sede_destino,
        id_camion: createDto.id_camion,
        id_encargado_carga: createDto.id_encargado_carga,
        id_repartidor_asignado: createDto.id_repartidor_asignado,
        fecha_carga: new Date(createDto.fecha_carga),
        hora_carga: createDto.hora_carga ? new Date(`1970-01-01T${createDto.hora_carga}`) : undefined,
        estado: createDto.estado ?? 'pendiente',
        observaciones: createDto.observaciones,
      },
      include: {
        camiones: true,
        sedes_operaciones_carga_id_sede_origenTosedes: true,
        sedes_operaciones_carga_id_sede_destinoTosedes: true,
        usuarios_operaciones_carga_id_encargado_cargaTousuarios: true,
        usuarios_operaciones_carga_id_repartidor_asignadoTousuarios: true,
      },
    });
  }

  async findAll(query: QueryOperacionesCargaDto) {
    const { estado, fecha } = query;
    const where: any = {};

    if (estado) where.estado = estado;
    if (fecha) {
      const startDate = new Date(fecha);
      const endDate = new Date(fecha);
      endDate.setDate(endDate.getDate() + 1);
      where.fecha_carga = { gte: startDate, lt: endDate };
    }

    return this.prisma.operaciones_carga.findMany({
      where,
      orderBy: { fecha_carga: 'desc' },
      include: {
        camiones: true,
        sedes_operaciones_carga_id_sede_origenTosedes: true,
        sedes_operaciones_carga_id_sede_destinoTosedes: true,
        usuarios_operaciones_carga_id_encargado_cargaTousuarios: true,
        usuarios_operaciones_carga_id_repartidor_asignadoTousuarios: true,
      },
    });
  }

  async findOne(id: number) {
    const operacion = await this.prisma.operaciones_carga.findUnique({
      where: { id_operacion: id },
      include: {
        camiones: true,
        sedes_operaciones_carga_id_sede_origenTosedes: true,
        sedes_operaciones_carga_id_sede_destinoTosedes: true,
        usuarios_operaciones_carga_id_encargado_cargaTousuarios: true,
        usuarios_operaciones_carga_id_repartidor_asignadoTousuarios: true,
        detalle_carga: {
          include: {
            frutas: true,
            variedades: true,
            tipos_jaba: true,
            clientes: true,
          },
        },
        incidencias: true,
      },
    });

    if (!operacion) {
      throw new NotFoundException(`Operación con ID ${id} no encontrada`);
    }
    return operacion;
  }

  async update(id: number, updateDto: UpdateOperacionCargaDto) {
    await this.findOne(id); // asegura existencia

    if (Object.keys(updateDto).length === 0) {
      throw new BadRequestException('No se enviaron datos para actualizar');
    }

    await this.validateRelations(updateDto, id);

    return this.prisma.operaciones_carga.update({
      where: { id_operacion: id },
      data: {
        id_sede_origen: updateDto.id_sede_origen,
        id_sede_destino: updateDto.id_sede_destino,
        id_camion: updateDto.id_camion,
        id_encargado_carga: updateDto.id_encargado_carga,
        id_repartidor_asignado: updateDto.id_repartidor_asignado,
        fecha_carga: updateDto.fecha_carga ? new Date(updateDto.fecha_carga) : undefined,
        hora_carga: updateDto.hora_carga ? new Date(`1970-01-01T${updateDto.hora_carga}`) : undefined,
        estado: updateDto.estado,
        observaciones: updateDto.observaciones,
      },
      include: {
        camiones: true,
        sedes_operaciones_carga_id_sede_origenTosedes: true,
        sedes_operaciones_carga_id_sede_destinoTosedes: true,
        usuarios_operaciones_carga_id_encargado_cargaTousuarios: true,
        usuarios_operaciones_carga_id_repartidor_asignadoTousuarios: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // "Cancelar" = cambiar estado a 'cancelada' (soft delete)
    return this.prisma.operaciones_carga.update({
      where: { id_operacion: id },
      data: { estado: 'cancelada' },
    });
  }

  async changeState(id: number, newState: string) {
    const allowedStates = ['pendiente', 'en_proceso', 'completada', 'cancelada'];
    if (!allowedStates.includes(newState)) {
      throw new BadRequestException(`Estado no válido: ${newState}`);
    }
    await this.findOne(id);
    return this.prisma.operaciones_carga.update({
      where: { id_operacion: id },
      data: { estado: newState },
    });
  }

  // --- Método auxiliar para validar relaciones ---
  private async validateRelations(dto: any, excludeId?: number) {
    const { id_sede_origen, id_sede_destino, id_camion, id_encargado_carga, id_repartidor_asignado } = dto;

    if (id_sede_origen) {
      const exists = await this.prisma.sedes.findUnique({ where: { id_sede: id_sede_origen } });
      if (!exists) throw new BadRequestException(`Sede origen con ID ${id_sede_origen} no existe`);
    }
    if (id_sede_destino) {
      const exists = await this.prisma.sedes.findUnique({ where: { id_sede: id_sede_destino } });
      if (!exists) throw new BadRequestException(`Sede destino con ID ${id_sede_destino} no existe`);
    }
    if (id_camion) {
      const exists = await this.prisma.camiones.findUnique({ where: { id_camion } });
      if (!exists) throw new BadRequestException(`Camión con ID ${id_camion} no existe`);
    }
    if (id_encargado_carga) {
      const exists = await this.prisma.usuarios.findUnique({ where: { id_usuario: id_encargado_carga } });
      if (!exists) throw new BadRequestException(`Usuario (encargado) con ID ${id_encargado_carga} no existe`);
    }
    if (id_repartidor_asignado) {
      const exists = await this.prisma.usuarios.findUnique({ where: { id_usuario: id_repartidor_asignado } });
      if (!exists) throw new BadRequestException(`Usuario (repartidor) con ID ${id_repartidor_asignado} no existe`);
    }
  }
}
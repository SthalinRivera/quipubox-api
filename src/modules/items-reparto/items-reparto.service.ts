import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateItemRepartoDto } from './dto/create-items-reparto.dto';
import { UpdateItemRepartoDto } from './dto/update-items-reparto.dto';
import { QueryItemsRepartoDto } from './dto/query-items-reparto.dto';
import { UpdateItemsRepartoDetalleDto } from './dto/update-items-reparto-detalle.dto';
import { CreateItemsRepartoDetalleDto } from './dto/create-items-reparto-detalle.dto';

@Injectable()
export class ItemsRepartoService {
  constructor(private prisma: PrismaService) { }

  async create(createDto: CreateItemRepartoDto) {
    await this.validateRelations(createDto);

    return this.prisma.items_reparto.create({
      data: {
        id_empresa: 1, // desde JWT
        id_detalle_carga: createDto.id_detalle_carga,
        id_cliente_receptor: createDto.id_cliente_receptor,
        id_puesto: createDto.id_puesto,
        cantidad_asignada: createDto.cantidad_asignada,
        orden_entrega: createDto.orden_entrega,
        observaciones: createDto.observaciones,
        seccion: createDto.seccion,
      },
      include: {
        detalle_carga: true,
        clientes: true,
        puestos: true,
      },
    });
  }

  async findAll(query: QueryItemsRepartoDto) {
    const where: any = {};
    if (query.id_detalle_carga) where.id_detalle_carga = query.id_detalle_carga;
    if (query.id_cliente_receptor) where.id_cliente_receptor = query.id_cliente_receptor;
    if (query.id_puesto) where.id_puesto = query.id_puesto;
    if (query.seccion) where.seccion = query.seccion;

    return this.prisma.items_reparto.findMany({
      where,
      include: {
        detalle_carga: true,
        clientes: true,
        puestos: true,
        entregas: true,
      },
      orderBy: { orden_entrega: 'asc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.items_reparto.findUnique({
      where: { id_item_reparto: id },
      include: {
        detalle_carga: true,
        clientes: true,
        puestos: true,
        entregas: true,
      },
    });
    if (!item) throw new NotFoundException(`Item de reparto con ID ${id} no encontrado`);
    return item;
  }

  async update(id: number, updateDto: UpdateItemRepartoDto) {
    await this.findOne(id);
    if (Object.keys(updateDto).length === 0)
      throw new BadRequestException('No se enviaron datos para actualizar');
    await this.validateRelations(updateDto);
    return this.prisma.items_reparto.update({
      where: { id_item_reparto: id },
      data: updateDto,
      include: {
        detalle_carga: true,
        clientes: true,
        puestos: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.items_reparto.delete({ where: { id_item_reparto: id } });
  }

  async changeState(id: number, newState: string) {
    const item = await this.findOne(id);
    // Si no hay un campo estado directo, podrías derivarlo de las entregas, pero por ahora solo ejemplo.
    // En la tabla items_reparto no hay campo estado, pero podemos lanzar error o manejarlo según necesidad.
    throw new BadRequestException('El módulo de items de reparto no tiene un campo de estado propio. El estado se define por las entregas.');
  }

  // Métodos auxiliares para endpoints anidados (desde detalle-carga)
  async findByDetalleCarga(detalleId: number) {
    const detalle = await this.prisma.detalle_carga.findUnique({
      where: { id_detalle_carga: detalleId },
    });
    if (!detalle) throw new NotFoundException(`Detalle de carga con ID ${detalleId} no existe`);
    return this.prisma.items_reparto.findMany({
      where: { id_detalle_carga: detalleId },
      include: { clientes: true, puestos: true, entregas: true },
    });
  }

  private async validateRelations(dto: any) {
    if (dto.id_detalle_carga) {
      const exists = await this.prisma.detalle_carga.findUnique({
        where: { id_detalle_carga: dto.id_detalle_carga },
      });
      if (!exists) throw new BadRequestException(`Detalle de carga ID ${dto.id_detalle_carga} no existe`);
    }
    if (dto.id_cliente_receptor) {
      const exists = await this.prisma.clientes.findUnique({
        where: { id_cliente: dto.id_cliente_receptor },
      });
      if (!exists) throw new BadRequestException(`Cliente receptor ID ${dto.id_cliente_receptor} no existe`);
    }
    if (dto.id_puesto) {
      const exists = await this.prisma.puestos.findUnique({
        where: { id_puesto: dto.id_puesto },
      });
      if (!exists) throw new BadRequestException(`Puesto ID ${dto.id_puesto} no existe`);
    }
  }


  // ==================== ITEMS REPARTO DETALLE ====================

  async addDetalle(itemId: number, dto: CreateItemsRepartoDetalleDto) {
    // Verificar que el ítem de reparto existe
    const item = await this.findOne(itemId);

    // Verificar que la relación calidad exista
    const calidadRel = await this.prisma.detalle_carga_calidades.findUnique({
      where: { id_detalle_carga_calidad: dto.id_detalle_carga_calidad },
    });
    if (!calidadRel) {
      throw new NotFoundException(`Calidad con ID ${dto.id_detalle_carga_calidad} no encontrada`);
    }

    // Validar que la calidad pertenezca al mismo detalle de carga que el ítem
    if (calidadRel.id_detalle_carga !== item.id_detalle_carga) {
      throw new BadRequestException('La calidad no pertenece al detalle de carga asociado a este ítem');
    }

    // Evitar duplicados (misma calidad en el mismo ítem)
    const existing = await this.prisma.items_reparto_detalle.findFirst({
      where: {
        id_item_reparto: itemId,
        id_detalle_carga_calidad: dto.id_detalle_carga_calidad,
      },
    });
    if (existing) {
      throw new BadRequestException('Esta calidad ya está asociada a este ítem de reparto');
    }

    return this.prisma.items_reparto_detalle.create({
      data: {
        id_empresa: 1,
        id_item_reparto: itemId,
        id_detalle_carga_calidad: dto.id_detalle_carga_calidad,
        cantidad: dto.cantidad,
        precio_unitario: dto.precio_unitario,
      },
      include: {
        detalle_carga_calidades: {
          include: { calidades: true },
        },
      },
    });
  }

  async findAllDetalles(itemId?: number) {
    const where = itemId ? { id_item_reparto: itemId } : {};
    return this.prisma.items_reparto_detalle.findMany({
      where,
      include: {
        detalle_carga_calidades: {
          include: { calidades: true },
        },
      },
    });
  }

  async findOneDetalle(id: number) {
    const detalle = await this.prisma.items_reparto_detalle.findUnique({
      where: { id_item_reparto_detalle: id },
      include: {
        detalle_carga_calidades: { include: { calidades: true } },
        items_reparto: true,
      },
    });
    if (!detalle) throw new NotFoundException(`Detalle de reparto con ID ${id} no encontrado`);
    return detalle;
  }

  async updateDetalle(id: number, dto: UpdateItemsRepartoDetalleDto) {
    await this.findOneDetalle(id);
    return this.prisma.items_reparto_detalle.update({
      where: { id_item_reparto_detalle: id },
      data: {
        cantidad: dto.cantidad,
        precio_unitario: dto.precio_unitario,
      },
      include: { detalle_carga_calidades: true },
    });
  }

  async removeDetalle(id: number) {
    await this.findOneDetalle(id);
    return this.prisma.items_reparto_detalle.delete({ where: { id_item_reparto_detalle: id } });
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateTipoJabaDto } from './dto/create-tipos-jaba.dto';
import { UpdateTipoJabaDto } from './dto/update-tipos-jaba.dto';

@Injectable()
export class TiposJabaService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createTipoJabaDto: CreateTipoJabaDto) {
    const empresa = await this.prisma.empresas.findUnique({
      where: { id_empresa: BigInt(createTipoJabaDto.id_empresa) },
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    return this.prisma.tipos_jaba.create({
      data: {
        id_empresa: BigInt(createTipoJabaDto.id_empresa),
        nombre: createTipoJabaDto.nombre,
        tipo_material: createTipoJabaDto.tipo_material,
        descripcion: createTipoJabaDto.descripcion,
        estado: createTipoJabaDto.estado ?? true,
      },
      include: { empresas: true },
    });
  }

  async findAll(estado?: boolean) {
    const where: any = {};
    if (estado !== undefined) where.estado = estado;
    return this.prisma.tipos_jaba.findMany({
      where,
      include: { empresas: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const tipo = await this.prisma.tipos_jaba.findUnique({
      where: { id_tipo_jaba: BigInt(id) },
      include: { empresas: true },
    });
    if (!tipo) throw new NotFoundException(`Tipo de jaba con ID ${id} no encontrado`);
    return tipo;
  }

  async update(id: number, updateTipoJabaDto: UpdateTipoJabaDto) {
    try {
      const updated = await this.prisma.tipos_jaba.update({
        where: { id_tipo_jaba: BigInt(id) },
        data: {
          nombre: updateTipoJabaDto.nombre,
          tipo_material: updateTipoJabaDto.tipo_material,
          descripcion: updateTipoJabaDto.descripcion,
          estado: updateTipoJabaDto.estado,
          id_empresa: updateTipoJabaDto.id_empresa ? BigInt(updateTipoJabaDto.id_empresa) : undefined,
        },
        include: { empresas: true },
      });
      return updated;
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException(`Tipo de jaba con ID ${id} no encontrado`);
      throw error;
    }
  }

  async changeState(id: number, estado: boolean) {
    return this.update(id, { estado });
  }
}
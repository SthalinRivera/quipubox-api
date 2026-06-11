import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClienteSedeDto } from './dto/cliente-sede.dto';
import { AsignarPuestoDto } from './dto/asignar-puesto.dto';
import { QueryClientesDto } from './dto/query-clientes.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) { }


  async create(createClienteDto: CreateClienteDto) {
    // Verificar que la empresa exista
    const empresa = await this.prisma.empresas.findUnique({
      where: { id_empresa: BigInt(createClienteDto.id_empresa) }
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    return this.prisma.clientes.create({
      data: {
        id_empresa: BigInt(createClienteDto.id_empresa),
        nombres: createClienteDto.nombres,
        apellidos: createClienteDto.apellidos,
        apodo: createClienteDto.apodo,
        telefono: createClienteDto.telefono,
        observaciones: createClienteDto.observaciones,
        estado: createClienteDto.estado ?? true,
      },
      include: {
        empresas: true,
        cliente_sede: { include: { sedes: true } },
        clientes_puestos: { include: { puestos: true } }
      }
    });
  }

  async findAll(buscar?: string) {
    const where: any = {};
    if (buscar) {
      where.OR = [
        { nombres: { contains: buscar, mode: 'insensitive' } },
        { apellidos: { contains: buscar, mode: 'insensitive' } },
        { apodo: { contains: buscar, mode: 'insensitive' } },
        { telefono: { contains: buscar, mode: 'insensitive' } },
      ];
    }
    return this.prisma.clientes.findMany({
      where,
      include: {
        empresas: true,

        cliente_sede: { include: { sedes: true } },
        clientes_puestos: { include: { puestos: true } }
      },
      orderBy: { id_cliente: 'desc' }
    });
  }


  async findAllPaginated(query: QueryClientesDto) {
    const { page = 1, limit = 10, buscar, estado = 'todos', tipo_relacion = 'todos' } = query;
    const skip = (page - 1) * limit;
    const take = limit;

    const where: any = {};

    if (buscar) {
      where.OR = [
        { nombres: { contains: buscar, mode: 'insensitive' } },
        { apellidos: { contains: buscar, mode: 'insensitive' } },
        { apodo: { contains: buscar, mode: 'insensitive' } },
        { telefono: { contains: buscar, mode: 'insensitive' } },
      ];
    }

    if (estado !== 'todos') {
      where.estado = estado === 'true';
    }
    if (tipo_relacion !== 'todos') {
      where.cliente_sede = {
        some: { tipo_relacion: tipo_relacion, estado: true }
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.clientes.findMany({
        where,
        include: {
          empresas: true,
          cliente_sede: { include: { sedes: true } },
          clientes_puestos: {
            include: {
              puestos: {
                include: {
                  lugares_operativos: true   // ✅ incluye tipo_lugar y otros campos
                }
              }
            }
          }
        },
        orderBy: { id_cliente: 'asc' },
        skip,
        take,
      }),
      this.prisma.clientes.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }


  async findOne(id: number) {
    const cliente = await this.prisma.clientes.findUnique({
      where: { id_cliente: BigInt(id) },
      include: {
        empresas: true,
        cliente_sede: { include: { sedes: true } },
        clientes_puestos: { include: { puestos: true } }
      }
    });
    if (!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    return cliente;
  }


  async update(id: number, updateClienteDto: UpdateClienteDto) {
    try {
      const updated = await this.prisma.clientes.update({
        where: { id_cliente: BigInt(id) },
        data: {
          nombres: updateClienteDto.nombres,
          apellidos: updateClienteDto.apellidos,
          apodo: updateClienteDto.apodo,
          telefono: updateClienteDto.telefono,
          observaciones: updateClienteDto.observaciones,
          estado: updateClienteDto.estado,
          id_empresa: updateClienteDto.id_empresa ? BigInt(updateClienteDto.id_empresa) : undefined,
        },
        include: {
          empresas: true,
          cliente_sede: { include: { sedes: true } },
          clientes_puestos: { include: { puestos: true } }
        }
      });
      return updated;
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      throw error;
    }
  }


  async changeState(id: number, estado: boolean) {
    try {
      const updated = await this.prisma.clientes.update({
        where: { id_cliente: BigInt(id) },
        data: { estado },
        include: {
          empresas: true,
          cliente_sede: { include: { sedes: true } },
          clientes_puestos: { include: { puestos: true } }
        }
      });
      return updated;
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      throw error;
    }
  }


  async associateSede(dto: ClienteSedeDto) {
    const cliente = await this.prisma.clientes.findUnique({
      where: { id_cliente: BigInt(dto.id_cliente) }
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    const sede = await this.prisma.sedes.findUnique({
      where: { id_sede: BigInt(dto.id_sede) }
    });
    if (!sede) throw new NotFoundException('Sede no encontrada');

    // Evitar duplicados exactos (mismo cliente, misma sede, mismo tipo)
    const existing = await this.prisma.cliente_sede.findFirst({
      where: {
        id_cliente: BigInt(dto.id_cliente),
        id_sede: BigInt(dto.id_sede),
        tipo_relacion: dto.tipo_relacion
      }
    });
    if (existing) throw new ConflictException('Esta relación cliente-sede ya existe');

    return this.prisma.cliente_sede.create({
      data: {
        id_cliente: BigInt(dto.id_cliente),
        id_sede: BigInt(dto.id_sede),
        id_empresa: cliente.id_empresa,
        tipo_relacion: dto.tipo_relacion,
        estado: true   // siempre activa al crearse
      },
      include: { clientes: true, sedes: true }
    });
  }


  async getSedesByCliente(id: number) {
    const cliente = await this.prisma.clientes.findUnique({
      where: { id_cliente: BigInt(id) },
      include: {
        cliente_sede: {
          where: { estado: true },
          include: { sedes: true }
        }
      }
    });
    if (!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    return cliente.cliente_sede;
  }


  async updateSedeRelacion(clienteId: number, sedeId: number, tipoRelacion: string) {
    const valoresValidos = ['emisor', 'receptor', 'ambos'];
    if (!valoresValidos.includes(tipoRelacion)) {
      throw new ConflictException('tipo_relacion debe ser: emisor, receptor o ambos');
    }

    const relation = await this.prisma.cliente_sede.findFirst({
      where: {
        id_cliente: BigInt(clienteId),
        id_sede: BigInt(sedeId),
        estado: true,
      },
    });

    if (!relation) {
      throw new NotFoundException('Relación cliente-sede no encontrada');
    }

    return this.prisma.cliente_sede.update({
      where: { id_cliente_sede: relation.id_cliente_sede },
      data: { tipo_relacion: tipoRelacion },
      include: { clientes: true, sedes: true },
    });
  }


  async removeSede(clienteId: number, sedeId: number) {
    // Buscar la relación activa (estado true)
    const relation = await this.prisma.cliente_sede.findFirst({
      where: {
        id_cliente: BigInt(clienteId),
        id_sede: BigInt(sedeId),
        estado: true,
      },
    });

    if (!relation) {
      throw new NotFoundException('Relación cliente-sede no encontrada');
    }

    // Eliminar físicamente el registro (no solo actualizar estado)
    return this.prisma.cliente_sede.delete({
      where: { id_cliente_sede: relation.id_cliente_sede },
    });
  }


  async assignPuesto(clienteId: number, dto: AsignarPuestoDto) {
    const cliente = await this.prisma.clientes.findUnique({
      where: { id_cliente: BigInt(clienteId) }
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    const puesto = await this.prisma.puestos.findUnique({
      where: { id_puesto: BigInt(dto.id_puesto) }
    });
    if (!puesto) throw new NotFoundException('Puesto no encontrado');

    // Evitar duplicados activos (sin fecha_fin)
    const existing = await this.prisma.clientes_puestos.findFirst({
      where: {
        id_cliente: BigInt(clienteId),
        id_puesto: BigInt(dto.id_puesto),
        fecha_fin: null
      }
    });
    if (existing) throw new ConflictException('El cliente ya tiene este puesto activo');

    return this.prisma.clientes_puestos.create({
      data: {
        id_cliente: BigInt(clienteId),
        id_puesto: BigInt(dto.id_puesto),
        id_empresa: cliente.id_empresa,
        fecha_inicio: new Date(), // ✅ siempre la fecha actual
        estado: true,
        seccion: dto.seccion ?? null, // 👈 agregado
      },
      include: { puestos: true }
    });
  }

  async removePuesto(clienteId: number, puestoId: number) {
    const relation = await this.prisma.clientes_puestos.findFirst({
      where: {
        id_cliente: BigInt(clienteId),
        id_puesto: BigInt(puestoId),
        fecha_fin: null
      }
    });
    if (!relation) throw new NotFoundException('Relación cliente-puesto no encontrada o ya finalizada');

    // Eliminar físicamente el registro
    return this.prisma.clientes_puestos.delete({
      where: { id_cliente_puesto: relation.id_cliente_puesto }
    });
  }

  async getPuestosByCliente(clienteId: number) {
    const cliente = await this.prisma.clientes.findUnique({
      where: { id_cliente: BigInt(clienteId) },
      include: {
        clientes_puestos: {
          where: { fecha_fin: null, estado: true },
          include: {
            puestos: {
              include: {
                lugares_operativos: {   // 🔥 INCLUIR LUGARES OPERATIVOS
                  include: { sedes: true }
                }
              }
            }
          }
        }
      }
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente.clientes_puestos;
  }

  async findAllClientesPuestos() {
    return this.prisma.clientes_puestos.findMany({
      where: { estado: true }, // solo activas
      include: {
        clientes: {
          select: { id_cliente: true, nombres: true, apellidos: true, telefono: true }
        },
        puestos: {
          include: {
            lugares_operativos: {
              include: { sedes: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

}
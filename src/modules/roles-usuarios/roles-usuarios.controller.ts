import { Controller, Get, Post, Put, Body, Patch, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesUsuariosService } from './roles-usuarios.service';
import { CreateRolDto } from './dto/create-roles-usuario.dto';
import { UpdateRolDto } from './dto/update-roles-usuario.dto';
import { UpdateStateDto } from './dto/update-state.dto';

@ApiTags('Roles de Usuarios')
@Controller('roles-usuarios')
export class RolesUsuariosController {
  constructor(private readonly rolesService: RolesUsuariosService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolesService.create(createRolDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar roles (opcionalmente filtrar por estado)' })
  findAll(@Query('estado') estado?: string) {
    const estadoBool = estado === 'true' ? true : estado === 'false' ? false : undefined;
    return this.rolesService.findAll(estadoBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un rol' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRolDto: UpdateRolDto) {
    return this.rolesService.update(id, updateRolDto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Activar o desactivar un rol (soft delete)' })
  changeState(@Param('id', ParseIntPipe) id: number, @Body() updateStateDto: UpdateStateDto) {
    return this.rolesService.changeState(id, updateStateDto.estado);
  }
}
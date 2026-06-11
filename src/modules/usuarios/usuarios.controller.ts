import { Controller, Get, Post, Body, Put, Param, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateStateDto } from './dto/update-state.dto';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  // Se conserva PUT como solicita el usuario (actualización completa)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar completamente un usuario (PUT)' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Activar o desactivar un usuario (soft delete)' })
  changeState(@Param('id', ParseIntPipe) id: number, @Body() updateStateDto: UpdateStateDto) {
    return this.usuariosService.changeState(id, updateStateDto.estado);
  }

  @Patch(':id/estado-acceso')
  @ApiOperation({ summary: 'Cambiar el estado de acceso (activo/bloqueado)' })
  @ApiBody({ schema: { example: { estado_acceso: 'activo' } } })
  changeEstadoAcceso(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado_acceso') estadoAcceso: 'activo' | 'bloqueado'
  ) {
    return this.usuariosService.cambiarEstadoAcceso(id, estadoAcceso);
  }

  // Asignar rol
  @Post(':id/roles')
  @ApiOperation({ summary: 'Asignar un rol al usuario' })
  @ApiParam({ name: 'id', type: Number })
  assignRole(@Param('id', ParseIntPipe) id: number, @Body('id_rol_usuario') rolId: number) {
    return this.usuariosService.assignRole(id, rolId);
  }

  // Eliminar rol
  @Delete(':id/roles/:rolId')
  @ApiOperation({ summary: 'Eliminar un rol del usuario' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'rolId', type: Number })
  removeRole(@Param('id', ParseIntPipe) id: number, @Param('rolId', ParseIntPipe) rolId: number) {
    return this.usuariosService.removeRole(id, rolId);
  }

  // Obtener roles de un usuario
  @Get(':id/roles')
  @ApiOperation({ summary: 'Obtener todos los roles de un usuario' })
  @ApiParam({ name: 'id', type: Number })
  getRoles(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.getRolesByUser(id);
  }
}
import { Controller, Get, Post, Body, Put, Param, Delete, Patch, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { CreateFullUsuarioDto } from './dto/create-usuario-full.dto';
import { UpdateFullUsuarioDto } from './dto/update-full-usuario.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('usuarios')
@UseGuards(SupabaseAuthGuard, RolesGuard)   // Aplica ambos guards a todo el controlador
@Roles('admin')                              // Requiere rol admin en todos los endpoints
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

  @Post('full')
  async createFull(@Body() dto: CreateFullUsuarioDto) {
    return this.usuariosService.createFull(dto);
  }

  @Put(':id/full')
  async updateFull(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFullUsuarioDto) {
    return this.usuariosService.updateFull(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar completamente un usuario (PUT)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Activar o desactivar un usuario (soft delete)' })
  changeState(@Param('id', ParseIntPipe) id: number, @Body() updateStateDto: UpdateStateDto) {
    return this.usuariosService.changeState(id, updateStateDto.estado);
  }

  @Post(':id/roles')
  @ApiOperation({ summary: 'Asignar un rol al usuario' })
  assignRole(@Param('id', ParseIntPipe) id: number, @Body('id_rol_usuario') rolId: number) {
    return this.usuariosService.assignRole(id, rolId);
  }

  @Delete(':id/roles/:rolId')
  @ApiOperation({ summary: 'Eliminar un rol del usuario' })
  removeRole(@Param('id', ParseIntPipe) id: number, @Param('rolId', ParseIntPipe) rolId: number) {
    return this.usuariosService.removeRole(id, rolId);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Obtener todos los roles de un usuario' })
  getRoles(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.getRolesByUser(id);
  }
}
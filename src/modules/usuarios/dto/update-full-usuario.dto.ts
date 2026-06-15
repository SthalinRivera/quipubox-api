import { PartialType } from '@nestjs/mapped-types';
import { CreateFullUsuarioDto } from './create-usuario-full.dto';

export class UpdateFullUsuarioDto extends PartialType(CreateFullUsuarioDto) { }
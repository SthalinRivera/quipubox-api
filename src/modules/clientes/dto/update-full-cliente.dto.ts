// src/modules/clientes/dto/update-full-cliente.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateFullClienteDto } from './create-full-cliente.dto';

export class UpdateFullClienteDto extends PartialType(CreateFullClienteDto) { }
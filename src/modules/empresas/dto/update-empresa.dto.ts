import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaDto } from './create-empresa.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {
    @ApiProperty({ example: false, required: false })
    estado?: boolean;
}
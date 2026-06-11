// src/common/dto/update-state.dto.ts (o dentro de empresas/dto)
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStateDto {
    @ApiProperty({ example: false, description: 'false = inactivo, true = activo' })
    @IsBoolean()
    @IsNotEmpty()
    estado!: boolean;
}
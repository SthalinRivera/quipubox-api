import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStateDto {
    @ApiProperty({ example: false, description: 'false = inactivo, true = activo' })
    @IsBoolean()
    @IsNotEmpty()
    estado!: boolean;
}
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolDto {
    @ApiProperty({ example: 'Administrador' })
    @IsString()
    @MaxLength(100)
    nombre!: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiProperty({ default: true, required: false })
    @IsOptional()
    @IsBoolean()
    estado?: boolean;
}
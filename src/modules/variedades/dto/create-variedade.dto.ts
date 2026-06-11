import { IsString, IsOptional, IsBoolean, IsInt, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVariedadDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id_empresa!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    id_fruta!: number;

    @ApiProperty({ example: 'Hass' })
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
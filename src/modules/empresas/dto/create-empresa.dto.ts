import { IsString, IsOptional, IsBoolean, Length, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmpresaDto {
    @ApiProperty({ example: 'Empresa SAC', description: 'Razón social completa' })
    @IsString()
    @IsNotEmpty({ message: 'La razón social es obligatoria' })
    razon_social!: string;

    @ApiProperty({ example: 'Empresa', description: 'Nombre comercial' })
    @IsString()
    @IsNotEmpty({ message: 'El nombre comercial es obligatorio' })
    nombre_comercial!: string;

    @ApiProperty({ example: '20123456789', required: false })
    @IsOptional()
    @IsString()
    @Length(11, 11, { message: 'El RUC debe tener 11 dígitos' })
    ruc?: string;

    @ApiProperty({ example: '+51999999999', required: false })
    @IsOptional()
    @IsString()
    telefono?: string;

    @ApiProperty({ example: 'Av. Principal 123', required: false })
    @IsOptional()
    @IsString()
    direccion?: string;

    @ApiProperty({ example: true, default: true, required: false })
    @IsOptional()
    @IsBoolean()
    estado?: boolean;
}
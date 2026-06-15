// src/modules/clientes/dto/create-full-cliente.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class SedeAsignacionDto {
    @IsNumber()
    id_sede!: number;

    @IsString()
    tipo_relacion!: string;
}

class PuestoAsignacionDto {
    @IsNumber()
    id_puesto!: number;

    @IsString()
    seccion!: string;
}

export class CreateFullClienteDto {
    @IsString()
    @IsNotEmpty()
    nombres!: string;

    @IsString()
    @IsOptional()
    apellidos?: string;

    @IsString()
    @IsOptional()
    apodo?: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsString()
    @IsOptional()
    observaciones?: string;

    @IsNumber()
    id_empresa!: number;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SedeAsignacionDto)
    @IsOptional()
    sedes?: SedeAsignacionDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PuestoAsignacionDto)
    @IsOptional()
    puestos?: PuestoAsignacionDto[];
}
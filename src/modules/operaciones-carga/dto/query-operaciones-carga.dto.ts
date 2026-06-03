import { IsOptional, IsString, IsDateString } from 'class-validator';

export class QueryOperacionesCargaDto {
    @IsOptional()
    @IsString()
    estado?: string;

    @IsOptional()
    @IsDateString()
    fecha?: string; // filtro por fecha_carga
}
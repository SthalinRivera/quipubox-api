// dto/create-detalle-carga-for-operacion.dto.ts
import { IsNumber, IsOptional, IsString, IsBoolean, Min } from 'class-validator';

export class CreateDetalleCargaForOperacionDto {
    @IsNumber()
    id_cliente_emisor!: number;

    @IsNumber()
    id_fruta!: number;

    @IsNumber()
    @IsOptional()
    id_variedad?: number | null;

    @IsNumber()
    id_tipo_jaba!: number;

    @IsNumber()
    @Min(1)
    cantidad_jabas!: number;

    @IsBoolean()
    @IsOptional()
    es_reparto?: boolean;

    @IsString()
    @IsOptional()
    instruccion_reparto?: string;

    @IsString()
    @IsOptional()
    observaciones?: string;

    @IsBoolean()
    @IsOptional()
    requiere_retorno_jabas?: boolean;

    // ✅ Nuevos campos para entrega manual
    @IsNumber()
    @IsOptional()
    id_cliente_receptor?: number | null;

    @IsNumber()
    @IsOptional()
    id_puesto?: number | null;

    @IsString()
    @IsOptional()
    id_seccion?: string | null;
}
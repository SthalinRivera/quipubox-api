import { IsNumber, IsOptional, Min, IsDecimal } from 'class-validator';

export class CreateItemsRepartoDetalleDto {
    @IsNumber()
    id_detalle_carga_calidad!: number;

    @IsNumber()
    @Min(1)
    cantidad!: number;

    @IsOptional()
    @IsDecimal()
    precio_unitario?: number;
}
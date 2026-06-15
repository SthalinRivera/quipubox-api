import { PartialType } from '@nestjs/mapped-types';
import { CreateItemsRepartoDetalleDto } from './create-items-reparto-detalle.dto';

export class UpdateItemsRepartoDetalleDto extends PartialType(CreateItemsRepartoDetalleDto) { }
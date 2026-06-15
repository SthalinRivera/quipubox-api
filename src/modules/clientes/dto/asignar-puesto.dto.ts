import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class AsignarPuestoDto {
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  id_puesto!: number;

  @IsString()
  @IsOptional()
  seccion?: string;
}
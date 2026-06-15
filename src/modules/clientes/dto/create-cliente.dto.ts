import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClienteDto {
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  id_empresa!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres!: string;

  @IsString()
  @IsOptional()
  apellidos?: string;

  @IsString()
  @IsOptional()
  apodo?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{9,15}$/, { message: 'Teléfono debe tener 9-15 dígitos' })
  telefono?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}  
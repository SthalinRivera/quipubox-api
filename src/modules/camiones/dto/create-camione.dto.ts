import { IsString, IsOptional, IsBoolean, IsInt, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCamionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id_empresa!: number;

  @ApiProperty({ example: 'ABC-123' })
  @IsString()
  @MaxLength(20)
  placa!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
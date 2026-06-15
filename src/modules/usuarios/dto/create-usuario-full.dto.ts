import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsBoolean, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFullUsuarioDto {
    @IsString()
    @IsNotEmpty()
    nombres!: string;

    @IsString()
    @IsOptional()
    apellidos?: string;

    @IsString()
    @IsEmail()
    email!: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsNumber()
    id_empresa!: number;

    @IsNumber()
    id_sede!: number;

    @IsArray()
    @IsNumber({}, { each: true })
    roles!: number[]; // IDs de roles a asignar

    @IsBoolean()
    @IsOptional()
    estado?: boolean;


}
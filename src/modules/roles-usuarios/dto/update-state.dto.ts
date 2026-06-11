import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStateDto {
    @ApiProperty({ example: false })
    @IsBoolean()
    @IsNotEmpty()
    estado!: boolean;
}
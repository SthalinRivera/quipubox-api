import { ApiProperty } from '@nestjs/swagger';

export class Empresa {
    @ApiProperty({ example: 1, description: 'ID (bigint, se convierte a number en la respuesta)' })
    id_empresa!: bigint;  // 👈 Cambiar de number a bigint

    @ApiProperty({ example: 'Empresa SAC' })
    razon_social!: string;

    @ApiProperty({ example: 'Empresa' })
    nombre_comercial!: string;

    @ApiProperty({ example: '20123456789', nullable: true })
    ruc!: string | null;

    @ApiProperty({ example: '+51999999999', nullable: true })
    telefono!: string | null;

    @ApiProperty({ example: 'Av. Principal 123', nullable: true })
    direccion!: string | null;

    @ApiProperty({ example: true })
    estado!: boolean | null;

    @ApiProperty({ example: '2025-01-01T00:00:00.000Z', nullable: true })
    created_at!: Date | null;
}
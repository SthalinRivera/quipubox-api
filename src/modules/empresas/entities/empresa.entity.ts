export class Empresa {
    id_empresa!: bigint;
    razon_social!: string;
    nombre_comercial!: string;
    ruc!: string | null;
    telefono!: string | null;
    direccion!: string | null;
    estado!: boolean | null;
    created_at!: Date | null;
}
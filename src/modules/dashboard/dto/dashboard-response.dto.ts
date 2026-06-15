// src/modules/dashboard/dto/dashboard-response.dto.ts
export class DashboardResponseDto {
    // Operaciones
    operacionesHoy!: number;
    operacionesEnCurso!: number;
    // Jabas
    jabasCargadasHoy!: number;
    // Camiones
    camionesEnRuta!: number;
    // Alertas
    alertasPendientes!: number;
    // Repartos
    repartosPendientes!: number;
    // Entregas
    entregasHoy!: number;
    // Opcional: desglose por tipo (si lo requieres)
    jabasPorTipo?: { tipo: string; cantidad: number }[];
}
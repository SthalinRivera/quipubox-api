import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => this.transformResponse(data)),
        );
    }

    private transformResponse(value: any, key?: string): any {
        if (value === null || value === undefined) return value;

        // Convertir BigInt a número
        if (typeof value === 'bigint') return Number(value);

        // Manejar fechas según el nombre del campo
        if (value instanceof Date) {
            if (key?.startsWith('fecha_') || key === 'fecha_carga' || key === 'fecha_incidencia' || key === 'fecha_origen') {
                return value.toISOString().split('T')[0]; // YYYY-MM-DD
            }
            if (key?.startsWith('hora_') || key === 'hora_carga') {
                return value.toISOString().split('T')[1]?.slice(0, 8) || null; // HH:MM:SS
            }
            // Para created_at, updated_at, etc.
            return value.toISOString();
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.transformResponse(item));
        }

        if (typeof value === 'object') {
            const newObj: any = {};
            for (const k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                    newObj[k] = this.transformResponse(value[k], k);
                }
            }
            return newObj;
        }

        return value;
    }
}
// common/interceptors/date.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DateInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => this.convertDates(data)),
        );
    }

    private convertDates(value: any): any {
        if (value === null || value === undefined) return value;

        if (value instanceof Date) {
            // Para campos específicos podrías personalizar
            return value.toISOString();
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.convertDates(item));
        }

        if (typeof value === 'object') {
            const newObj: any = {};
            for (const key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    newObj[key] = this.convertDates(value[key]);
                }
            }
            return newObj;
        }

        return value;
    }
}
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((value) => {
        // If the response already has a { data, meta } shape, preserve it
        if (value && typeof value === 'object' && 'data' in value) {
          return { ...value, timestamp: new Date().toISOString() };
        }
        return {
          data: value,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

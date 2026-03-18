import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response, Request } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data: T) => {
        return {
          success: true,
          statusCode: response.statusCode || HttpStatus.OK,
          message: this.generateSuccessMessage(request.method, request.url),
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private generateSuccessMessage(method: string, url: string): string {
    const resource = this.extractResourceFromUrl(url);

    switch (method.toUpperCase()) {
      case 'GET':
        return `${resource} retrieved successfully`;
      case 'POST':
        return `${resource} created successfully`;
      case 'PATCH':
      case 'PUT':
        return `${resource} updated successfully`;
      case 'DELETE':
        return `${resource} deleted successfully`;
      default:
        return 'Operation completed successfully';
    }
  }

  private extractResourceFromUrl(url: string): string {
    const segments = url
      .split('/')
      .filter((segment) => segment && segment !== 'api' && segment !== 'aws');
    const resource = segments[0] || 'Resource';
    return resource.charAt(0).toUpperCase() + resource.slice(1);
  }
}

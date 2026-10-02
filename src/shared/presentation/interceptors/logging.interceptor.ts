import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { method, url, body } = request;

    // Scrub sensitive data
    const safeBody = this.scrubData(body);

    const now = Date.now();
    this.logger.log(`Incoming Request: ${method} ${url} - Body: ${JSON.stringify(safeBody)}`);

    return next
      .handle()
      .pipe(
        tap(() => this.logger.log(`Outgoing Response: ${method} ${url} - ${Date.now() - now}ms`)),
      );
  }

  private scrubData(data: any): any {
    if (!data) return data;
    const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken'];
    const scrubbed = Array.isArray(data) ? [...data] : { ...data };

    for (const key of Object.keys(scrubbed)) {
      if (sensitiveKeys.includes(key.toLowerCase()) || sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        scrubbed[key] = '[REDACTED]';
      } else if (typeof scrubbed[key] === 'object' && scrubbed[key] !== null) {
        scrubbed[key] = this.scrubData(scrubbed[key]);
      }
    }
    return scrubbed;
  }
}

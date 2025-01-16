import {
  CallHandler,
  ExecutionContext,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AppLoggerService } from '../../logger/logger.service';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  private readonly logger: LoggerService;

  constructor(logger: AppLoggerService) {
    this.logger = logger.createLogger(RequestInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { headers, body, query, url, method } = context
      .switchToHttp()
      .getRequest<Request>();
    // simple clean up
    const mQuery = { ...query };
    const mHeaders = { ...headers };
    const mBody = { ...body };
    delete mQuery.token;
    delete mQuery.access_token;
    delete mHeaders.authorization;
    delete mBody.password;

    this.logger.log(`Incoming Request: ${method} ${url}`, {
      headers: mHeaders,
      body: mBody,
      query: mQuery,
      requestId: headers['x-request-id'],
    });

    return next.handle();
  }
}

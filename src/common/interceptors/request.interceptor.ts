import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  private logger: Logger = new Logger(RequestInterceptor.name, {
    timestamp: true,
  });

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
    this.logger.log(`%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%`);
    this.logger.log(`URL --> ${method} ${url}`);
    this.logger.log(`headers --> ${JSON.stringify(mHeaders, null, 2)}`);
    this.logger.log(`body --> ${JSON.stringify(mBody, null, 2)}`);
    this.logger.log(`query --> ${JSON.stringify(mQuery, null, 2)}`);

    return next.handle();
  }
}

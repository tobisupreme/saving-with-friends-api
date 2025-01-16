import { Injectable, LoggerService } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { transports } from './winston.config';

class ChildLoggerService implements LoggerService {
  constructor(
    private readonly parentLogger: AppLoggerService,
    private readonly context: string,
  ) {}

  log(message: any, context?: string | any, metadata?: any) {
    if (typeof context === 'string' || context === undefined) {
      this.parentLogger.log(message, context || this.context);
      return;
    }
    this.parentLogger.log(message, this.context, context);
  }

  error(message: any, trace?: string, context?: string | any, metadata?: any) {
    if (typeof context === 'string' || context === undefined) {
      this.parentLogger.error(message, trace, context || this.context);
      return;
    }
    this.parentLogger.error(message, trace, this.context, context);
  }

  warn(message: any, context?: string | any, metadata?: any) {
    if (typeof context === 'string' || context === undefined) {
      this.parentLogger.warn(message, context || this.context);
      return;
    }
    this.parentLogger.warn(message, this.context, context);
  }

  debug(message: any, context?: string | any, metadata?: any) {
    if (typeof context === 'string' || context === undefined) {
      this.parentLogger.debug(message, context || this.context);
      return;
    }
    this.parentLogger.debug(message, this.context, context);
  }

  verbose(message: any, context?: string | any, metadata?: any) {
    if (typeof context === 'string' || context === undefined) {
      this.parentLogger.verbose(message, context || this.context);
      return;
    }
    this.parentLogger.verbose(message, this.context, context);
  }
}

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: LoggerService;
  private defaultContext?: string;

  constructor() {
    this.logger = WinstonModule.createLogger({
      transports,
    });
  }

  createLogger(context: string): LoggerService {
    return new ChildLoggerService(this, context);
  }

  private formatMessage(message: any, context?: string, metadata?: any) {
    return {
      timestamp: new Date().toISOString(),
      context: context || this.defaultContext || 'Application',
      message,
      metadata: {
        ...metadata,
        environment: process.env.NODE_ENV,
        service: process.env.APP_NAME,
      },
    };
  }

  log(message: any, context?: string | any, metadata?: any) {
    if (typeof context === 'string' || context === undefined) {
      this.logger.log(this.formatMessage(message, context));
      return;
    }
    this.logger.log(this.formatMessage(message, this.defaultContext, context));
  }

  error(message: any, trace?: string, context?: string | any, metadata?: any) {
    if (typeof context === 'string' || context === undefined) {
      this.logger.error(
        this.formatMessage(message, context, { trace }),
      );
      return;
    }
    this.logger.error(
      this.formatMessage(message, this.defaultContext, {
        ...context,
        trace,
      }),
    );
  }

  warn(message: any, context?: string | any, metadata?: any) {
    if (typeof context === 'string' || context === undefined) {
      this.logger.warn(this.formatMessage(message, context));
      return;
    }
    this.logger.warn(this.formatMessage(message, this.defaultContext, context));
  }

  debug(message: any, context?: string | any, metadata?: any) {
    if (typeof context === 'string' || context === undefined) {
      this.logger.debug(this.formatMessage(message, context));
      return;
    }
    this.logger.debug(this.formatMessage(message, this.defaultContext, context));
  }

  verbose(message: any, context?: string | any, metadata?: any) {
    if (typeof context === 'string' || context === undefined) {
      this.logger.verbose(this.formatMessage(message, context));
      return;
    }
    this.logger.verbose(this.formatMessage(message, this.defaultContext, context));
  }
}

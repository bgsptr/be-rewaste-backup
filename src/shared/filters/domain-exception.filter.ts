import { ExceptionFilter, Catch, ArgumentsHost, Inject } from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { AuthenticatedRequest } from 'src/middlewares/auth.middleware';

@Catch(DomainException)
export class DomainExceptionsFilter implements ExceptionFilter {
  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {
    this.logger.setContext(DomainExceptionsFilter.name);
  }

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthenticatedRequest>();
    const status = exception.getStatus();

    // Log the domain exception with structured data
    this.logger.error(
      {
        message: 'Domain exception',
        method: request.method,
        url: request.url,
        status,
        exceptionName: exception.name,
        exceptionMessage: exception.message,
        userId: request.user?.id || 'anonymous',
      },
      exception.stack,
    );

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
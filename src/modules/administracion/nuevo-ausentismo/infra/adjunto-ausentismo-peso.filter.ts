import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  PayloadTooLargeException,
} from '@nestjs/common';
import type { Response } from 'express';
import { MSG_ADJUNTO_AUSENTISMO_PESO } from '../../shared/adjunto-ausentismo';

@Catch(PayloadTooLargeException)
export class AdjuntoAusentismoPesoFilter implements ExceptionFilter {
  catch(exception: PayloadTooLargeException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = exception.getResponse();
    const message =
      typeof body === 'string'
        ? body
        : body && typeof body === 'object' && 'message' in body
          ? String((body as { message: unknown }).message)
          : '';

    if (message !== 'File too large') {
      response.status(exception.getStatus()).json(body);
      return;
    }

    response.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      message: MSG_ADJUNTO_AUSENTISMO_PESO,
      error: 'Payload Too Large',
    });
  }
}

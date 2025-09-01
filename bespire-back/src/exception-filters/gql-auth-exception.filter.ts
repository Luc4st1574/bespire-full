import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch(UnauthorizedException)
export class GqlAuthExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const statusCode = exception?.status || 401;
    const message = exception?.message || 'Unauthorized';
    return gqlHost.getContext().res.status(statusCode).json({
      statusCode,
      message,
      error: 'Unauthorized',
    });
  }
}

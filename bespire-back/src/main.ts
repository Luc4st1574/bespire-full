import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { GqlAuthExceptionFilter } from './exception-filters/gql-auth-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { logHttpRoutesExpress } from '../utils/log-routes';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  logHttpRoutesExpress(app); // imprime métodos y paths
  //app.useGlobalFilters(new GqlAuthExceptionFilter());

  // Configurar archivos estáticos para uploads locales
  // Solo sirve archivos GET /files/* para evitar conflictos con POST /upload/*
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/files/',
  });

  app.use(
    json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(
    urlencoded({
      extended: true,
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.enableCors();
  await app.listen(4000);
}
bootstrap();

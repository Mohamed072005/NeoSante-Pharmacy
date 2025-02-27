import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http.exception.filter';
import { RequestLogger } from "./core/logger/request.logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new RequestLogger());
  await app.listen(process.env.PORT ?? 5000);
}

bootstrap();

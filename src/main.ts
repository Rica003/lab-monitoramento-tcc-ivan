import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// ⬇️ MUDANÇA DO WINSTON: Importando o módulo do Winston e o arquivo de regras
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../logger.config'; 
// ⬆️ FIM DA MUDANÇA

async function bootstrap() {
  // ⬇️ MUDANÇA DO WINSTON: Injetando o Winston no momento da criação do NestFactory
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  // ⬆️ FIM DA MUDANÇA

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('API Deputados')
    .setDescription('Documentação dos endpoints')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  Logger.log(`API rodando na porta: http://localhost:${port}`, 'Fazenoq');
}
void bootstrap();

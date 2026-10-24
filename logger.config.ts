import * as winston from 'winston';

// 1. Criamos um formato de texto limpo para o dia a dia (.txt)
const txtFormat = winston.format.printf(({ level, message, timestamp, context }) => {
  // Exemplo de saída: [2026-08-12 17:22:18] ERROR: [CamaraService] Falha ao buscar deputados
  return `[${timestamp}] ${level.toUpperCase()}: ${context ? `[${context}] ` : ''}${message}`;
});

export const winstonConfig = {
  transports: [
    // ==========================================
    // LOGS NO TERMINAL (Console)
    // ==========================================
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        txtFormat,
      ),
    }),
    
    // ==========================================
    // ARQUIVOS DE ERRO (Foco em falhas críticas)
    // ==========================================
    new winston.transports.File({
      filename: 'logs/error.json',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.txt',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        txtFormat,
      ),
    }),

    // ==========================================
    // ARQUIVOS GERAIS (Fluxo normal da aplicação)
    // ==========================================
    new winston.transports.File({
      filename: 'logs/combined.json',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.txt',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        txtFormat,
      ),
    }),
    
    // ==========================================
    // LOGS CINZAS (Foco em depuração detalhada)
    // ==========================================
    new winston.transports.File({
      filename: 'logs/debug-gray.json',
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/debug-gray.txt',
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        txtFormat,
      ),
    }),

  ],
};
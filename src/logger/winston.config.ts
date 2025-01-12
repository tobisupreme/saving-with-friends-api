import { SeqTransport } from '@datalust/winston-seq';
import * as winston from 'winston';
import { Green, Red, Yellow } from './console-text';

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'DD/MM/YYYY, HH:mm:ss',
    }),
    winston.format.printf((info) => {
      const timestamp = info.timestamp;
      const level = info.level.toUpperCase();
      const message = info.message;
      const context = info.context ? `[${info.context}]` : '';
      const colorToUse = level === 'ERROR' ? Red : Green;
      const part1 = colorToUse(`[Nest] ${process.pid}`);
      const part2 = colorToUse(`${level}`);
      return `${part1} - ${timestamp}    ${part2} ${Yellow(`${context}`)} ${colorToUse(`${message}`)}`;
    }),
  ),
});

export const transports = [
  ...(process.env.NODE_ENV !== 'production' ? [consoleTransport] : []),
  new winston.transports.File({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, context, trace }) => {
        return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
      }),
    ),
    filename: 'logs/winston.log',
  }),
  new SeqTransport({
    serverUrl: process.env.SEQ_URL,
    apiKey: process.env.SEQ_KEY,
    onError: (e) => {
      console.error(e);
    },
    handleExceptions: true,
    handleRejections: true,
  }),
];

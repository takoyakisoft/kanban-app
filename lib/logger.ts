// カスタムログ関数
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  sessionId?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logDir = join(process.cwd(), 'logs');
  private logFile = join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  
  constructor() {
    // ログディレクトリを作成
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }
  
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`ℹ️ ${this.formatMessage('info', message, context)}`);
    }
  }

  warn(message: string, context?: LogContext) {
    console.warn(`⚠️ ${this.formatMessage('warn', message, context)}`);
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = error ? { ...context, error: error.message, stack: error.stack } : context;
    console.error(`❌ ${this.formatMessage('error', message, errorContext)}`);
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(`🐛 ${this.formatMessage('debug', message)}`);
      if (data) {
        console.debug('Debug data:', data);
      }
    }
  }

  // パフォーマンス測定
  time(label: string) {
    if (this.isDevelopment) {
      console.time(`⏱️ ${label}`);
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(`⏱️ ${label}`);
    }
  }

  // テーブル形式でのデータ表示
  table(data: any[], message?: string) {
    if (this.isDevelopment) {
      if (message) {
        console.log(`📊 ${message}`);
      }
      console.table(data);
    }
  }
}

export const logger = new Logger();
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const isDev = import.meta.env.MODE === 'development';

const log = (level: LogLevel, message: string, ...args: any[]) => {
  if (!isDev && level === 'debug') return;

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  const styles = {
    info: 'color: #007bff; font-weight: bold;',
    warn: 'color: #ffc107; font-weight: bold;',
    error: 'color: #dc3545; font-weight: bold;',
    debug: 'color: #6c757d; font-weight: bold;',
  };

  console[level](`%c${prefix} ${message}`, styles[level], ...args);
};

export const logger = {
  info: (message: string, ...args: any[]) => log('info', message, ...args),
  warn: (message: string, ...args: any[]) => log('warn', message, ...args),
  error: (message: string, ...args: any[]) => log('error', message, ...args),
  debug: (message: string, ...args: any[]) => log('debug', message, ...args),
};

export default logger;

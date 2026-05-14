const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: unknown[]) => isDev && console.log('[BotlBack]', ...args),
  info: (...args: unknown[]) => isDev && console.info('[BotlBack]', ...args),
  warn: (...args: unknown[]) => console.warn('[BotlBack]', ...args),
  error: (...args: unknown[]) => console.error('[BotlBack]', ...args),
  debug: (...args: unknown[]) => isDev && console.debug('[BotlBack]', ...args),
  time: (label: string) => isDev && console.time(`[BotlBack] ${label}`),
  timeEnd: (label: string) => isDev && console.timeEnd(`[BotlBack] ${label}`),
}

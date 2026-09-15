type TelegramApp = { initData: string; ready: () => void; expand: () => void };
export function telegramApp(): TelegramApp | undefined {
  return (window as unknown as { Telegram?: { WebApp?: TelegramApp } }).Telegram?.WebApp;
}

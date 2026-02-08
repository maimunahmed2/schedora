'use server';

export async function sendTelegramMessage(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    console.warn("Telegram bot environment variables (TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID) are not set. Skipping notification.");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
        const result = await response.json();
        console.error("Failed to send Telegram message:", result.description);
        // Don't throw error to not fail the whole operation
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}

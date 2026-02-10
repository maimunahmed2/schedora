'use server';

export async function sendTelegramMessage(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!botToken || !channelId) {
    console.warn("Telegram bot environment variables (TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID) are not set. Skipping notification.");
    return;
  }
  
  if (!appUrl) {
    console.warn("NEXT_PUBLIC_APP_URL is not set. The 'See full timetable' button will not be included in Telegram notifications.");
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const body: any = {
    chat_id: channelId,
    text: message,
    parse_mode: 'Markdown',
  };

  if (appUrl) {
    body.reply_markup = {
      inline_keyboard: [
        [{ text: "See full timetable", url: appUrl }]
      ]
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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

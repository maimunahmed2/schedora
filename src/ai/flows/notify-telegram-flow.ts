'use server';
/**
 * @fileOverview A flow for sending notifications to a Telegram channel.
 *
 * - notifyTelegram - A function that sends a message to Telegram.
 * - NotifyTelegramInput - The input type for the notifyTelegram function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { sendTelegramMessage } from '@/services/telegram';

const NotifyTelegramInputSchema = z.object({
  message: z.string().describe('The message to send to Telegram.'),
});

export type NotifyTelegramInput = z.infer<typeof NotifyTelegramInputSchema>;

export async function notifyTelegram(input: NotifyTelegramInput): Promise<void> {
  // We run this out of band, no need to wait for it.
  notifyTelegramFlow(input);
}

const notifyTelegramFlow = ai.defineFlow(
  {
    name: 'notifyTelegramFlow',
    inputSchema: NotifyTelegramInputSchema,
    outputSchema: z.void(),
  },
  async ({ message }) => {
    // This flow is designed to be fire-and-forget.
    // We don't want to block the user's UI for a notification.
    await sendTelegramMessage(message);
  }
);

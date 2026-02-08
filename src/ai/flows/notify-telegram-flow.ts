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
  await notifyTelegramFlow(input);
}

const notifyTelegramFlow = ai.defineFlow(
  {
    name: 'notifyTelegramFlow',
    inputSchema: NotifyTelegramInputSchema,
    outputSchema: z.void(),
  },
  async ({ message }) => {
    await sendTelegramMessage(message);
  }
);

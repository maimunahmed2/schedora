'use server';
/**
 * @fileOverview AI Chatbot for answering timetable related queries.
 *
 * - timetableChat - A function that handles the chat interaction.
 * - TimetableChatInput - The input type for the chatbot.
 * - TimetableChatOutput - The response from the chatbot.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TimetableChatInputSchema = z.object({
  message: z.string().describe('The user question about the timetable.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional().describe('Chat history for context.'),
  context: z.object({
    currentTime: z.string(),
    currentDay: z.string(),
    dayOfWeek: z.number(),
  }).describe('Context about the current time and day.')
});

export type TimetableChatInput = z.infer<typeof TimetableChatInputSchema>;

const TimetableChatOutputSchema = z.object({
  response: z.string().describe('The AI response to the user query.'),
});

export type TimetableChatOutput = z.infer<typeof TimetableChatOutputSchema>;

const getTimetableData = ai.defineTool(
  {
    name: 'getTimetableData',
    description: 'Fetches the current class timetable including subjects, faculty, times, and notes.',
    inputSchema: z.void(),
    outputSchema: z.array(z.any()),
  },
  async () => {
    const timetableRef = collection(db, 'timetable');
    const q = query(timetableRef, orderBy('dayOfWeek', 'asc'), orderBy('time', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
);

export async function timetableChat(input: TimetableChatInput): Promise<TimetableChatOutput> {
  return timetableChatFlow(input);
}

const timetableChatFlow = ai.defineFlow(
  {
    name: 'timetableChatFlow',
    inputSchema: TimetableChatInputSchema,
    outputSchema: TimetableChatOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      system: `You are Schedora Assistant, a helpful AI specialized in the student timetable.
      Current Context:
      - Today is ${input.context.currentDay}
      - Current time is ${input.context.currentTime}
      
      Use the 'getTimetableData' tool to see the current schedule.
      When answering:
      1. Be concise and friendly.
      2. If asked about "next class", look at the current time and find the next scheduled class for today.
      3. If no classes are left today, mention classes for tomorrow.
      4. Pay attention to "notes" in the timetable data for information about assignments or exams.
      5. If a class is "Cancelled" or "Postponed", make sure to mention that status clearly.`,
      prompt: input.message,
      messages: input.history?.map(h => ({
        role: h.role,
        content: [{ text: h.content }]
      })),
      tools: [getTimetableData],
    });

    return { response: output?.text || "I'm sorry, I couldn't process that request." };
  }
);

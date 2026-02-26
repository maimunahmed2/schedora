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
    try {
      const timetableRef = collection(db, 'timetable');
      // Fetching all data to avoid index requirements for complex queries in the tool
      const snapshot = await getDocs(timetableRef);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          subject: data.subject,
          faculty: data.faculty,
          dayOfWeek: data.dayOfWeek,
          time: data.time,
          duration: data.duration,
          status: data.status,
          notes: data.notes || '',
        };
      });
    } catch (error) {
      // Return an empty array if there's an issue fetching data
      return [];
    }
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
    try {
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: `You are Schedora Assistant, a helpful AI specialized in the student timetable.
        Current Context:
        - Today is ${input.context.currentDay}
        - Current time is ${input.context.currentTime}
        
        Use the 'getTimetableData' tool to see the current schedule.
        When answering:
        1. Be concise, professional, and friendly.
        2. If asked about "next class", look at the current time and find the next scheduled class for today.
        3. If no classes are left today, mention classes for tomorrow.
        4. Pay attention to "notes" in the timetable data for information about assignments or exams.
        5. If a class status is "Cancelled" or "Postponed", make sure to mention that clearly.
        6. If you cannot find any data, politely inform the user that no schedule is currently set.`,
        prompt: input.message,
        messages: input.history?.map(h => ({
          role: h.role,
          content: [{ text: h.content }]
        })),
        tools: [getTimetableData],
      });

      return { response: response.text || "I'm sorry, I couldn't find a response. Please try rephrasing your question." };
    } catch (error) {
      // Log error internally if needed, but return a user-friendly message
      return { response: "I'm having trouble connecting to my brain right now. Please check if the API key is set and try again." };
    }
  }
);

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
import { collection, getDocs } from 'firebase/firestore';
import { db, isConfigured } from '@/lib/firebase';

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
  }).describe('Context about the current time and day.'),
  isApi: z.boolean().optional().describe('Whether the request is coming from the API.')
});

export type TimetableChatInput = z.infer<typeof TimetableChatInputSchema>;

const TimetableChatOutputSchema = z.object({
  response: z.string().describe('The AI response to the user query.'),
  error: z.string().optional().describe('Error message if something went wrong.'),
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
    if (!isConfigured) {
      throw new Error('Firebase is not configured. Please set up your .env.local file with Firebase keys.');
    }
    try {
      const timetableRef = collection(db, 'timetable');
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
    } catch (error: any) {
      throw new Error(`Failed to fetch timetable data: ${error.message}`);
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
        model: 'googleai/gemini-2.5-flash',
        system: `You are Schedora Assistant, a helpful AI specialized in the student timetable.
        Current Context:
        - Today is ${input.context.currentDay}
        - Current time is ${input.context.currentTime}
        
        Language Rules:
        1. If the user messages in Hindi or Hinglish, respond in Hinglish (Hindi written using English/Latin alphabets).
        2. For ALL responses, regardless of the input language, ONLY use English/Latin alphabets. NEVER use Devanagari or any other non-Latin scripts.

        Behavioral Rules:
        1. Be concise, professional, and friendly.
        2. Use the 'getTimetableData' tool to see the current schedule.
        3. If asked about "next class", look at the current time and find the next scheduled class for today.
        4. If no classes are left today, mention classes for tomorrow.
        5. Pay attention to "notes" in the timetable data for information about assignments or exams.
        6. If a class status is "Cancelled" or "Postponed", make sure to mention that clearly.
        7. If you cannot find any data, politely inform the user that no schedule is currently set.
        8. UNCERTAINTY HANDLING:
           - If the user's question is unrelated to the timetable, faculty, classes, or notes, or if the answer cannot be determined with confidence:
             ${input.isApi ? "You MUST respond with exactly the string 'ai_fail_silent' and nothing else." : "Politely inform the user that you can only assist with timetable-related queries."}`,
        prompt: input.message,
        messages: input.history?.map(h => ({
          role: h.role,
          content: [{ text: h.content }]
        })),
        tools: [getTimetableData],
      });

      return { response: response.text || (input.isApi ? "ai_fail_silent" : "I'm sorry, I couldn't find a response. Please try rephrasing your question.") };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { 
        response: input.isApi ? "ai_fail_silent" : "I encountered an error while processing your request.",
        error: errorMessage 
      };
    }
  }
);

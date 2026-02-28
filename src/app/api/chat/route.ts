import { NextResponse } from 'next/server';
import { timetableChat, type TimetableChatInput } from '@/ai/flows/timetable-chat-flow';

export const dynamic = 'force-dynamic';

/**
 * API route to interact with Schedora Assistant.
 * Expects a POST request with TimetableChatInput in JSON format.
 */
export async function POST(request: Request) {
  try {
    const body: TimetableChatInput = await request.json();

    // Basic validation
    if (!body.message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    if (!body.context) {
      return NextResponse.json(
        { error: 'Context (currentTime, currentDay, dayOfWeek) is required.' },
        { status: 400 }
      );
    }

    // Call the Genkit flow
    const result = await timetableChat(body);

    if (result.error) {
      return NextResponse.json(
        { error: result.error, response: result.response },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred while processing the chat request.' },
      { status: 500 }
    );
  }
}

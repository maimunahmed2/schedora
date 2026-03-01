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

    // Call the Genkit flow with isApi flag set to true
    const result = await timetableChat({
        ...body,
        isApi: true
    });

    if (result.error) {
      // Even if there's an error, if it's an API request we prefer returning the silent fail token
      return NextResponse.json({
        response: "ai_fail_silent",
        error: result.error
      }, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { 
        response: "ai_fail_silent",
        error: error.message || 'An unknown error occurred while processing the chat request.' 
      },
      { status: 500 }
    );
  }
}

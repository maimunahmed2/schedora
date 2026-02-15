import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, isConfigured } from '@/lib/firebase';

const dayNameToIndex: { [key: string]: number } = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// By default, Next.js API Routes are dynamically rendered.
// Setting this to 'force-dynamic' ensures they are always run on the server for every request.
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { day: string } }
) {
  if (!isConfigured) {
    return NextResponse.json({ error: 'Firebase is not configured on the server.' }, { status: 503 });
  }

  const dayName = params.day.toLowerCase();
  const dayIndex = dayNameToIndex[dayName];

  if (dayIndex === undefined) {
    return NextResponse.json({ error: 'Invalid day of the week. Please use full day names like "monday", "tuesday", etc.' }, { status: 400 });
  }

  try {
    const timetableRef = collection(db, 'timetable');
    const q = query(
      timetableRef,
      where('dayOfWeek', '==', dayIndex),
      orderBy('time', 'asc')
    );

    const querySnapshot = await getDocs(q);

    const timetableData: any[] = [];
    querySnapshot.forEach((doc) => {
        // Exclude server-side timestamps for clean JSON serialization
        const { createdAt, ...data } = doc.data();
        timetableData.push({
            id: doc.id,
            ...data,
        });
    });

    return NextResponse.json(timetableData, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error('Error fetching timetable data:', error);
    return NextResponse.json({ error: 'Failed to fetch timetable data from the server.', details: errorMessage }, { status: 500 });
  }
}

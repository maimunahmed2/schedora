# **App Name**: ClassPulse

## Core Features:

- Timetable Display: Display the class timetable in a responsive table or card layout, with subject name, faculty, date, time, and status.
- Real-time Updates: Reflect timetable updates in real-time using Firestore.
- Status Highlighting: Clearly highlight postponed or canceled classes for better visibility.
- Admin Edit Mode: Provide an edit mode for the Class Representative (CR) after authentication.
- Authentication: Firebase Authentication (email/password) to authenticate the Class Representative.
- Firestore Security Rules: Enforce permissions using Firestore Security Rules for CR-only write access and public read access.
- Last Updated Timestamp: Display a “Last updated at” timestamp at the top of the timetable.

## Style Guidelines:

- Primary color: Light sky blue (#87CEEB) for a calm and clear feel.
- Background color: Off-white (#F5F5F5) for a clean and minimal look.
- Accent color: Soft orange (#FFB347) to highlight important updates or status changes.
- Body and headline font: 'Inter' for a modern, clean, and readable design.
- Note: currently only Google Fonts are supported.
- Minimal and subtle icons to represent class status (scheduled, postponed, cancelled).
- Clean, single-page layout with a mobile-first responsive design.
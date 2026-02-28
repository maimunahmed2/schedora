# Schedora - Class Timetable Management

A single source of truth for your class timetable, featuring a Telegram-integrated notification system and an AI Assistant.

## Features
- **Real-time Timetable**: View your schedule for the day or week.
- **AI Assistant**: Ask Schedora about class timings, faculty, and notes.
- **Telegram Notifications**: Get instant updates on schedule changes in your channel.
- **CR Management**: Authenticated Class Representatives can manage the schedule and load templates.

## API Documentation

### 1. Get Full Week Timetable
Retrieve all class entries for the entire week.
- **Endpoint**: `/api/timetable`
- **Method**: `GET`
- **Response**: `TimetableEntry[]`

### 2. Get Day-specific Timetable
Retrieve all classes for a specific day.
- **Endpoint**: `/api/timetable/[day]`
- **Method**: `GET`
- **Params**: `day` (e.g., `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`)
- **Example**: `/api/timetable/wednesday`

### 3. Schedora Chat API
Interact with the AI Assistant programmatically.
- **Endpoint**: `/api/chat`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "message": "What is my next class?",
    "context": {
      "currentTime": "10:30",
      "currentDay": "Wednesday",
      "dayOfWeek": 3
    },
    "history": [] // Optional: Array of { role: 'user' | 'model', content: 'string' }
  }
  ```
- **Response**:
  ```json
  {
    "response": "AI generated answer...",
    "error": "Error message if any"
  }
  ```

### Example Usage (cURL)
```bash
curl -X POST http://localhost:9002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Who is teaching Chemistry?",
    "context": {
      "currentTime": "09:00",
      "currentDay": "Monday",
      "dayOfWeek": 1
    }
  }'
```

## Setup
Ensure your `.env.local` is configured with Firebase and Telegram credentials.

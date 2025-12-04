# VAPI Custom Call Interface

## Overview
A custom mobile-style voice call interface for customer support and lead generation. Uses VAPI as the hidden voice engine while presenting a beautiful custom UI that mimics native phone call screens.

## Project Purpose
- Customer support hotline interface
- Lead generation and deal assistance
- 24/7 AI voice assistance

## Architecture

### Frontend (React + TypeScript)
- **Home Page** (`client/src/pages/home.tsx`): Main call interface with all states
- **Components** (`client/src/components/call-screen/`):
  - `avatar.tsx`: Animated avatar with status indicators
  - `waveform.tsx`: Audio visualization during calls
  - `timer.tsx`: Call duration timer
  - `call-button.tsx`: Start/end call and mute buttons
  - `status-text.tsx`: Dynamic status text display
- **Hooks** (`client/src/hooks/`):
  - `use-vapi.ts`: VAPI SDK integration with WebSocket session management and transcript collection

### Backend (Express + WebSocket)
- **Routes** (`server/routes.ts`): Call logging and transcript notification endpoints
- **Call Session** (`server/call-session.ts`): WebSocket-based session management for mobile persistence
- **Storage** (`server/storage.ts`): In-memory storage for call logs

### Shared
- **Schema** (`shared/schema.ts`): TypeScript types for users and call logs

## Tech Stack
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- VAPI Web SDK for voice calls (includes built-in transcription)
- Express.js backend with WebSocket support
- TanStack Query for data fetching
- Resend API for email notifications

## Key Features
1. **Custom Call Screen**: Mobile-style interface with familiar phone UI patterns
2. **VAPI Integration**: Hidden widget with programmatic control
3. **Call States**: Idle, connecting, connected, ended states with smooth transitions
4. **Visual Feedback**: Animated waveform, pulsing rings, call timer
5. **Call Logging**: Automatic logging of call duration and status
6. **Dark Theme**: Professional dark UI optimized for the call experience
7. **Transcript Email Notification**: Sends conversation transcript via email when call ends
8. **Mobile Persistence**: WebSocket session management keeps calls alive on mobile

## Mobile Support Features
- **WebSocket Session Management**: Backend maintains call session even if frontend disconnects
- **Automatic Reconnection**: 3-second reconnection interval for dropped connections
- **Keep-Alive Ping**: 20-second ping interval prevents mobile browser connection drops
- **Transcript Saving**: Backend stores transcripts even if frontend disconnects
- **Separate Ringtone**: Ringtone plays as isolated HTML Audio element (3-second max, no loop)

## Transcript Notification Workflow

### How It Works
1. **User talks** - VAPI SDK captures and transcribes speech in real-time
2. **Transcripts collected** - Both user and assistant messages are collected during the call
3. **Call ends** - Full transcript is sent to `/api/notify` endpoint
4. **Email sent** - Resend API sends notification with transcript text (no audio attachments)

### Benefits
- **Lightweight**: Only text payload, no large file uploads
- **Reliable**: Works for long calls (10+ minutes) without timeout issues
- **No storage required**: No database or cloud storage needed
- **Fast delivery**: Small payload ensures quick email delivery

### Email Format
```
New visitor used the voice service.

Transcript:
---------------------------------
[USER]: Hello, I need help...
[ASSISTANT]: Hi! How can I help you today?
...
---------------------------------

Call Details:
- Start Time: [timestamp]
- End Time: [timestamp]
- Duration: [X minutes Y seconds]
- Browser/Device: [info]
```

### Configuration
- **RESEND_API_KEY**: Set in environment secrets for email functionality
- **Email Recipient**: Configured to send to `glowseoulaura@yahoo.com`
  - To change recipient, update the `to` field in `server/routes.ts` or `api/notify.ts`
  - For production, use a verified domain with Resend

## VAPI Configuration
- Public Key: Stored in `VITE_VAPI_PUBLIC_KEY` environment variable
- Assistant ID: Stored in `VITE_VAPI_ASSISTANT_ID` environment variable

## API Endpoints
- `POST /api/notify`: Send transcript notification email
- `POST /api/calls`: Create a call log
- `GET /api/calls`: Get all call logs
- `GET /api/calls/:id`: Get specific call log
- `PATCH /api/calls/:id`: Update a call log
- `GET /api/stats`: Get call statistics
- `POST /api/leads`: Create a lead
- `GET /api/leads`: Get all leads
- `GET /api/leads/:id`: Get specific lead

## WebSocket Endpoints
- `ws://host/ws/call`: Call session management
  - `start_session`: Initialize or restore a call session
  - `call_start`: Notify backend of call start
  - `call_connected`: Notify backend of successful connection
  - `call_end`: Notify backend of call end
  - `transcript`: Save transcript entries
  - `ping`: Keep-alive ping (responds with pong)

## Development
The app runs on port 5000 with hot reload enabled.

## Environment Variables
- `VITE_VAPI_PUBLIC_KEY`: VAPI public key (frontend)
- `VITE_VAPI_ASSISTANT_ID`: VAPI assistant ID (frontend)
- `RESEND_API_KEY`: Resend API key for email functionality (backend)

## Vercel Deployment

### Prerequisites
1. Vercel account connected to your GitHub repository
2. Environment variables configured in Vercel dashboard

### Required Environment Variables (Vercel Dashboard)
- `RESEND_API_KEY`: Resend API key for email functionality
- `VITE_VAPI_PUBLIC_KEY`: VAPI public key
- `VITE_VAPI_ASSISTANT_ID`: VAPI assistant ID

### Deploy to Vercel
1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Set environment variables in Vercel project settings
4. Deploy

### Project Structure for Vercel
- `api/` - Vercel serverless functions (calls, leads, stats, notify)
- `lib/` - Shared database and storage modules for serverless
- `client/` - React frontend (built with Vite)
- `dist/` - Production build output
- `vercel.json` - Vercel deployment configuration

### Build Commands
- `npm run build:vercel` - Build frontend for Vercel deployment
- `npm run dev` - Development server (Replit)

### How It Works
- Frontend is built as static files and served from Vercel's CDN
- API routes are deployed as serverless functions in the `/api` directory
- Transcript notifications use lightweight JSON payloads (no timeout issues)

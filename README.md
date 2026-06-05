# Farcaster Space App SDK

A Next.js application providing API endpoints for building Farcaster Space applications with LiveKit integration.

## Features

- 🎙️ LiveKit-powered audio spaces
- 📊 Vercel Web Analytics integration
- 🔒 TypeScript for type safety
- ⚡ Next.js 14 with App Router

## API Routes

- `/api/spaces/create` - Create a new space
- `/api/spaces/invite` - Invite users to a space
- `/api/spaces/leaderboard` - Get space leaderboard
- `/api/spaces/list` - List all active spaces
- `/api/spaces/moderate` - Moderate a space
- `/api/spaces/stream` - Stream space data
- `/api/spaces/token` - Get access token for LiveKit

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or your preferred package manager
- LiveKit account (optional, for full functionality)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env.local` and configure your LiveKit credentials:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Vercel Analytics

This project includes Vercel Web Analytics for tracking page views and web vitals. The analytics will automatically work when deployed to Vercel - no additional configuration required.

The Analytics component is integrated in `app/layout.tsx` and will track:
- Page views
- Web Vitals (CLS, FID, LCP, FCP, TTFB)
- Custom events (when configured)

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or using the Vercel CLI:

```bash
vercel deploy
```

## Environment Variables

See `.env.example` for required environment variables:

- `LIVEKIT_API_KEY` - Your LiveKit API key
- `LIVEKIT_API_SECRET` - Your LiveKit API secret
- `LIVEKIT_URL` - Your LiveKit server URL

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm run start

# Run linter
npm run lint
```

## License

See LICENSE file for details.

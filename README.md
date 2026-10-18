# Socially Approved Carousel

## Overview

Socially Approved Carousel is a full-stack hiring assignment that presents a responsive horizontal video carousel and a focused video modal. Visitors can play videos on demand, navigate between videos, track likes, and share links.

The project is organized as two npm workspaces: a React/TypeScript frontend and a Node.js/Express/TypeScript API. Sample video metadata is served by the backend from a JSON fixture; the frontend does not bundle a static video dataset. No database is used.

## Features

- Responsive, horizontally scrollable thumbnail carousel with mouse, touch, and arrow navigation.
- Modal video carousel with keyboard navigation, swipe/drag, Escape and backdrop close, focus handling, and body-scroll locking.
- Lazy thumbnail loading and user-initiated video playback.
- Only the active modal slide mounts a video element.
- Video controls for play/pause, mute/unmute, and progress seeking.
- Visibility-aware playback: offscreen video is paused and its media source is released.
- Optimistic likes with duplicate protection, per-browser like state, API confirmation, and rollback on error.
- Share menu for copying a link, native device sharing, WhatsApp, Facebook, and X/Twitter.
- Like and share actions update the visible count and report API errors.
- Typed API contracts, request validation, health endpoint, CORS configuration, and JSON error responses.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Sample data | `videos.json` plus in-memory like/share state |
| Quality | TypeScript checks, ESLint |

## Architecture

```text
React
  ↓ HTTP / JSON
Express API
  ↓ reads fixture at startup
videos.json
```

The React client gets video metadata from `GET /videos` and sends interactions to the API. Express validates requests and delegates video operations to service/repository modules. The repository initializes its working video records from `server/src/data/videos.json`; like and share counters and per-user like records are held in memory for the lifetime of the server process.

The API is also mounted under `/api` for compatibility, so `/videos` and `/api/videos` (and the corresponding action routes) both work.

## Video Lifecycle

```text
thumbnail
   ↓
visibility detection
   ↓
lazy load
   ↓
play
   ↓
leave viewport
   ↓
pause
```

Carousel cards begin with thumbnails only. The modal mounts one active video player; its media source is attached only when the visitor presses Play. An `IntersectionObserver` watches the player stage. When the player is no longer meaningfully visible, playback is paused and the source is removed. If the visitor returns, the thumbnail remains and playback can be explicitly started again.

## Performance Strategy

- **IntersectionObserver:** watches the active video stage and releases its media source when it leaves the viewport.
- **Lazy loading:** carousel and preview thumbnails use native `loading="lazy"`; HTML video uses `preload="none"` and receives a source only on a Play action.
- **Active video limit:** the modal mounts one video element at a time. Other slides remain images, keeping active video elements well below the target of approximately ten.
- **Modal priority:** opening the modal pauses background video elements; only the selected modal slide can play.
- **Offscreen pause:** the player is paused and its source unloaded when it leaves the viewport, preventing background playback and reducing network use.
- **DOM/resource management:** cards are reusable and memoized, adjacent carousel slides are lightweight thumbnails, and video time updates are throttled with `requestAnimationFrame`.
- **No eager autoplay:** videos do not play or download until requested.

## API Documentation

Base URL for local development: `http://localhost:4000`

### `GET /videos`

Returns sample video metadata. Supply `userId` to receive the liked state for that user. Without it, each video has `liked: false`.

Request:

```http
GET /videos?userId=user-123
```

Example response:

```json
{
  "videos": [
    {
      "id": "video-001",
      "title": "Golden Hour in the Dolomites",
      "description": "A quiet sunrise hike through the dramatic peaks and alpine meadows of northern Italy.",
      "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      "thumbnailUrl": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=720&q=80",
      "likes": 1284,
      "shares": 96,
      "duration": 32,
      "liked": false
    }
  ]
}
```

### `POST /like`

Records one like per `userId` and video during the current server process. A repeated request from the same user returns the current count with `duplicate: true`.

Request:

```http
POST /like
Content-Type: application/json
```

```json
{
  "videoId": "video-001",
  "userId": "user-123"
}
```

Example response:

```json
{
  "video": {
    "id": "video-001",
    "title": "Golden Hour in the Dolomites",
    "description": "A quiet sunrise hike through the dramatic peaks and alpine meadows of northern Italy.",
    "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "thumbnailUrl": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=720&q=80",
    "likes": 1285,
    "shares": 96,
    "duration": 32
  },
  "likes": 1285,
  "liked": true,
  "duplicate": false
}
```

### `POST /share`

Records a share and returns the updated share count. Supported platforms: `copy`, `web-share`, `whatsapp`, `facebook`, and `twitter`.

Request:

```http
POST /share
Content-Type: application/json
```

```json
{
  "videoId": "video-001",
  "platform": "copy"
}
```

Example response:

```json
{
  "videoId": "video-001",
  "shares": 97,
  "platform": "copy"
}
```

### `GET /health`

Health check for the API process.

Request:

```http
GET /health
```

Example response:

```json
{
  "status": "ok"
}
```

Invalid request bodies return `400`; unknown routes and video IDs return `404`; unexpected server errors return `500`. Error responses use this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "..."
  }
}
```

## Project Structure

```text
client/
  src/
    components/
      LikeButton/
      LoadingSpinner/
      ProgressBar/
      ShareButton/
      SociallyApproved/
      VideoCard/
      VideoControls/
      VideoModal/
      VideoPlayer/
    hooks/                 React data and interaction state
    services/              Typed API requests; fetch stays out of UI components
    types/                 Frontend TypeScript interfaces
    utils/                 Shared formatting helpers
    App.tsx                Page composition and top-level selected-video state
    main.tsx               React application entry point
  index.html
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  tsconfig*.json
server/
  src/
    controllers/           Request validation and HTTP responses
    data/
      videos.json          Sample video metadata
    middleware/            Error handling and not-found responses
    repositories/          In-memory data initialized from the JSON fixture
    routes/                Health and video endpoint registration
    services/              Like/share business logic
    types/                 Server-side TypeScript contracts
    app.ts                 Express middleware and route setup
    server.ts              Environment loading and HTTP listener
  tsconfig.json
client/.env.example
server/.env.example
eslint.config.js
tsconfig.base.json
package.json               npm workspaces and root scripts
```

## Local Setup

Requirements: Node.js 20+ and npm 10+.

From the project root, install dependencies:

```powershell
cd D:\Interview_Assessment_Task\socially-approved-carousel
npm install
```

Start the API and frontend in separate terminals. Run both commands from the project root:

```powershell
npm run dev:server
```

```powershell
npm run dev:client
```

Open `http://localhost:5173`. The API listens at `http://localhost:4000` by default.

## Environment Variables

Copy the example files if you need to override local defaults:

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

| Variable | Used by | Default | Description |
| --- | --- | --- | --- |
| `PORT` | Server | `4000` | HTTP port for Express |
| `CLIENT_ORIGIN` | Server | `http://localhost:5173` | Allowed browser origin for CORS |
| `VITE_API_BASE_URL` | Client | `http://localhost:4000` | Base URL used by the API service |

Only `VITE_`-prefixed variables are exposed to browser code. Do not put secrets in client environment files.

## Testing

Run the project’s available static checks from the root:

```powershell
npm run lint
npm run build
```

The build type-checks and bundles the client, then compiles the server. There is no automated test script configured yet.

You can manually verify the API in PowerShell while the server is running:

```powershell
Invoke-RestMethod http://localhost:4000/health
Invoke-RestMethod http://localhost:4000/videos
```

Example POST requests:

```powershell
$like = @{ videoId = "video-001"; userId = "test-user" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/like" -Method Post -ContentType "application/json" -Body $like

$share = @{ videoId = "video-001"; platform = "copy" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/share" -Method Post -ContentType "application/json" -Body $share
```

## Deployment

Build both workspaces:

```powershell
npm run build
```

Deploy the generated client assets in `client/dist` to a static hosting provider and deploy the Node server as a separate web service. Configure:

- `VITE_API_BASE_URL` to the public API origin when building the client.
- `CLIENT_ORIGIN` to the deployed client origin on the server.
- `PORT` to the port provided by the server hosting platform.

The server start command is `npm run start --workspace @socially-approved-carousel/server`; compile it first with `npm run build`. Configure static hosting to serve the SPA entry point for client-side routes if routes are added later.

The current API stores interaction state in memory. It is suitable for an assignment/demo deployment, not multi-instance or durable production use.

## Engineering Decisions

- **JSON fixture instead of a database:** `videos.json` keeps assignment sample metadata reviewable, version-controlled, and easy to run without database setup or credentials.
- **In-memory interactions:** likes and shares demonstrate backend validation and state changes while keeping the scope small. State resets when the server restarts and is not shared between server instances.
- **Separate API service:** all client HTTP requests are centralized and validated in `client/src/services/videoApi.ts`; components express UI behavior without calling `fetch`.
- **On-demand playback:** attaching sources only after an explicit Play action avoids downloading unselected clips and gives the user control over playback.
- **Per-browser like identity:** the client generates and stores a user ID in local storage for duplicate-like handling in this demo. It is not authentication and should not be treated as a secure identity mechanism.
- **External sample media:** the fixture uses public demo video/image URLs. A deployment should use controlled media assets and verify licensing, availability, and performance.

## Future Production Improvements

- Persist video metadata and interactions in **PostgreSQL or MongoDB**.
- Add **authentication** and authorization instead of relying on a client-generated user ID.
- Store **persistent likes** and enforce uniqueness at the database layer.
- Serve media and thumbnails through a **CDN**.
- Add a **video transcoding** pipeline for consistent renditions and formats.
- Use **HLS/adaptive streaming** for bandwidth-aware playback.
- Add privacy-aware **analytics** for playback, engagement, and shares.
- Add API **rate limiting**, abuse prevention, and monitoring.

# Socially Approved Video Carousel

The project is split into an independently runnable React client and Express API server. No database is used; the server's sample video list is stored in `server/src/data/videos.json`.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Install

Run once from the project root:

```powershell
npm install
```

## Run locally

In separate terminals from the project root:

```powershell
npm run dev:server
npm run dev:client
```

The Vite client runs at `http://localhost:5173` and the API server at `http://localhost:4000` by default. The server exposes `GET /videos`, `POST /like`, `POST /share`, and `GET /health`; `/api`-prefixed versions are also available for compatibility. Video metadata is returned from the in-memory copy of the JSON fixture.

Copy `server/.env.example` to `server/.env` to set server options, and `client/.env.example` to `client/.env` to configure the client API base URL. Only variables prefixed with `VITE_` are available to client code; do not put secrets in client environment files.

The server repository imports `server/src/data/videos.json` as a TypeScript JSON module (`resolveJsonModule` is enabled) and exposes it through `getAll()`. The JSON module is included in the server build; no dataset is embedded in `server.ts`. The fixture uses public demo clips from [MDN's CC0 flower video](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4) and [W3C's public media test samples](https://media.w3.org/2010/05/). Demo URLs are shared across records and depend on their external hosts remaining available.

## API

- `GET /health` returns `200 { "status": "ok" }`.
- `GET /videos` returns `200 { "videos": [...] }`.
- `POST /like` accepts `{ "videoId": "video-001", "userId": "user-123" }` and returns the updated video, like count, and duplicate status. Each user can like a video once during the current server process.
- `POST /share` accepts `{ "videoId": "video-001", "platform": "copy" }`, where platform is `copy`, `web-share`, `whatsapp`, `facebook`, or `twitter`; it returns the updated share count.

The `/api`-prefixed versions of these paths are also available. Invalid request bodies return `400`, unknown routes and video IDs return `404`, and unexpected server errors return `500`. Error responses use `{ "error": { "code": "...", "message": "..." } }`. Like/share counts are stored in memory and reset when the server restarts.

## Checks

```powershell
npm run lint
npm run build
```

## Project layout

```text
client/
  src/
    components/     Small reusable carousel UI building blocks
    hooks/          React data hooks
    services/       Dedicated backend API client
    types/          Frontend data and API response interfaces
    utils/           Shared formatting helpers
    App.tsx         Minimal application shell
  index.html        Vite browser document
  vite.config.ts    Vite and React plugin configuration
  tsconfig*.json    Client and Vite TypeScript settings
server/
  src/
    controllers/    Request validation and HTTP responses
    data/           Local JSON video fixture
    middleware/     JSON error responses and route-not-found handling
    repositories/   JSON import and in-memory video state
    routes/         Health and video endpoint definitions
    services/       Video like/share business logic
    types/          Server-side TypeScript data types
    app.ts          Express middleware and route setup
    server.ts       Environment loading and HTTP listener only
  tsconfig.json     Server TypeScript settings
tsconfig.base.json  Shared strict TypeScript compiler options
eslint.config.js    Shared ESLint rules for client and server
```

- `client/` is the browser application, kept separate so it can be developed and built independently from the API.
- `client/src/components/` contains small reusable building blocks; they are not assembled into the full carousel interface yet.
- `client/src/services/videoApi.ts` centralizes requests to the video API using `VITE_API_BASE_URL`.
- `client/src/hooks/useVideos.ts` provides loading, error, and video state for consumers of the API service.
- `client/src/types/` defines the frontend video and API contracts.
- `server/` is the HTTP API application, kept separate so API logic and runtime configuration are not bundled with the browser app.
- `server/src/` holds the Express application setup and server entry point.
- `server/src/data/` holds the sample `videos.json` fixture; the API serves it without a database.
- Root configuration files provide shared workspace scripts, TypeScript defaults, lint rules, and ignored generated/environment files.

## Client/server communication

The server listens on port `4000` by default and exposes `GET /api/videos`. It responds with JSON shaped like `{ "videos": [...] }`, read from `server/src/data/videos.json`. When client-side requests are added, the client can build the API URL from `import.meta.env.VITE_API_BASE_URL` (default example: `http://localhost:4000`) and make standard HTTP requests. The server's `CLIENT_ORIGIN` setting configures CORS for the Vite origin (`http://localhost:5173` by default). The current client is intentionally an empty shell and does not make requests yet.

# TexLoop

**Share text in real time. Collaborate instantly. Then let it vanish.**

TexLoop is an ephemeral, link-based text collaboration tool. Create a temporary room, paste anything, and share the URL — edits sync live across every connected device, with built-in chat beside the editor. No signup, no clutter. Rooms clean up after themselves.

Built with **Next.js 16**, **Socket.IO**, **Yjs (CRDT)**, and **MongoDB**.

---

## Features

- **Real-time sync** — CRDT-based collaborative editing via Y.js; every keystroke lands on every device without conflicts.
- **Live chat** — discuss next to the content you're editing; click any message to load it into the editor.
- **Ephemeral by design** — set a destruction timer per room, rely on auto-deletion after inactivity, or delete manually at any time.
- **Private when it matters** — password-gate any room in one toggle. Passwords are hashed (PBKDF2-SHA512) and verified in constant time.
- **Encrypted at rest** — chat messages are AES-256-CBC encrypted before hitting the database and decrypted only on delivery.
- **Zero friction** — no accounts, no downloads, no onboarding tour.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + custom Node server |
| Language | TypeScript |
| Realtime | Socket.IO + Y.js CRDTs over WebSockets |
| Database | MongoDB (Mongoose) with TTL-based expiry |
| Styling | Tailwind CSS 4 + shadcn/ui, warm light theme with emerald accent |
| Fonts | Space Grotesk (display) · Inter (body) · IBM Plex Mono |

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or Atlas)

### Installation

```bash
git clone https://github.com/akashwrites1120/texloop.git
cd texloop
npm install
```

### Environment variables

Create `.env.local` in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
ENCRYPTION_KEY=your_32_character_encryption_key_here
CRON_SECRET=your_32_character_cron_secret_here
```

> `ENCRYPTION_KEY` is required to encrypt stored messages. The server warns loudly if it's missing.

### Run

The project uses a custom server for Socket.IO, so always start it through `server.ts`:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server (custom server + Turbopack HMR) |
| `npm run build` | Production build |
| `npm run start` / `npm run start:prod` | Production server |
| `npm run lint` | ESLint |

## How it works

1. **Rooms** are MongoDB documents with an optional `expiresAt`, an `autoDelete` flag, a PBKDF2 password hash, and encrypted-at-rest state.
2. **Real-time layer**: a custom HTTP server hosts both Next.js and Socket.IO (`path: /api/socket`). Clients join rooms through authenticated socket events; all edit/chat events validate room membership server-side.
3. **Live sync**: enabling the toggle unlocks Yjs-backed collaborative editing. Updates relay through the server, which also merges document state per room and persists plain-text snapshots to the database. With sync off, drafts stay local.
4. **Expiry**: expired rooms are cleaned every minute by an in-process job (with socket notifications to connected clients). A Mongo TTL index provides a second safety net. Inactive-room cleanup can additionally be triggered by an external cron calling `POST /api/rooms/cleanup` with `Authorization: Bearer $CRON_SECRET`.
5. **Deletion notifications**: manual deletes flow through `POST /api/notify/room-deleted`, which broadcasts `room:deleted` and detaches sockets from the room. (Note: this endpoint intentionally lives outside the `/api/socket` prefix — engine.io owns that path.)

## API overview

| Method & route | Auth | Description |
|---|---|---|
| `POST /api/rooms` | — | Create a room (password required; used for deletion and optional join protection) |
| `GET /api/rooms` | — | List active rooms (hashes excluded) |
| `GET /api/rooms/[roomId]` | password query param for private rooms | Room details; private rooms return metadata-only until verified |
| `PATCH /api/rooms/[roomId]` | room password | Update text content |
| `DELETE /api/rooms/[roomId]` | room password | Delete room + messages, notify clients |
| `POST /api/rooms/[roomId]/verify` | — | Verify room password; returns full room on success |
| `GET/POST /api/rooms/[roomId]/messages` | rate-limited | Fetch (auto-decrypted) / create messages |
| `POST /api/notify/room-deleted` | internal | Broadcast deletion to connected sockets |
| `POST /api/rooms/cleanup` | `Bearer CRON_SECRET` | Expire inactive rooms |

## Project structure

```
texloop/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/              # REST endpoints (see API overview)
│   ├── room/[roomId]/    # Live room (editor + chat)
│   ├── (dashboard)/      # Rooms browser
│   └── (auth)/join/      # Join-by-code page
├── components/
│   ├── home/             # Landing animations (hero demo, typewriter)
│   ├── dashboard/        # Room cards, list, search, creation dialog
│   ├── room/             # Editor, chat panel, header
│   └── ui/               # shadcn/ui primitives
├── hooks/                # useSocket, useRoom, useYjsEditor
├── lib/                  # encryption, rate limiting, cleanup service
├── models/               # Mongoose schemas
├── types/                # Shared TypeScript types
└── server.ts             # Custom HTTP + Socket.IO server
```

## Security model

- Room passwords are required for creation (they authorize deletion and optional join protection) and are never stored in plaintext — PBKDF2-SHA512 with per-room salt, constant-time comparison.
- Private rooms enforce passwords on **both** the REST layer and the socket join path; private room content is not exposed until verification succeeds.
- Chat messages are encrypted with AES-256-CBC before storage; keys come from `ENCRYPTION_KEY`.
- Rate limiting applies to joins, messages, and text updates (in-memory; swap for Redis in multi-instance deployments).
- See [`docs/audit-and-fixes.md`](docs/audit-and-fixes.md) for a full security audit, the issues found, and how each was resolved.

## Deployment

A [`render.yaml`](render.yaml) blueprint is included for one-click Render deployment (Node runtime, health check on `/`). Set `MONGODB_URI`, `NEXT_PUBLIC_APP_URL`, and `ENCRYPTION_KEY` in your provider's dashboard. Optionally schedule the cleanup cron against `/api/rooms/cleanup`.

## Contributing

Contributions are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please run `npm run lint` and `npm run build` before submitting.

## License

Distributed under the MIT License.

---

<div align="center">
TexLoop — the internet's scratchpad. Here when you need it, gone when you don't.
</div>

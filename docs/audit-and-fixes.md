# Project Audit & Bug Fixes

> Audit date: August 2026 · Scope: full codebase (server, hooks, API routes, UI) · All findings verified against a running instance.

This document records the results of a full health check of TexLoop — what was tested, every bug found, and how each one was fixed. All fixes were re-verified live after being applied.

---

## 1. Verification summary

| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | Clean |
| ESLint | **0 errors / 0 warnings** (was 11 errors / 12 warnings) |
| Production build (`next build`) | Succeeds, all routes compile |
| Pages `/`, `/rooms`, `/join`, `/room/[id]` | Render 200 |
| REST lifecycle (create → read → patch → verify → messages → delete) | Passes |
| Socket.IO security suite | **5/5 checks pass** |
| Message encryption at rest + decrypt roundtrip | Passes |

---

## 2. Security fixes

### 2.1 CRITICAL — Private rooms could be joined without a password via Socket.IO

- **Where:** `server.ts` (`room:join` handler)
- **Problem:** Password verification only ran `if (room.isPrivate && password)`. A client connecting directly to the socket and omitting the password skipped verification entirely and was added to the room. Confirmed live with a raw socket client.
- **Fix:** Private rooms now *always* require a password; missing or incorrect passwords are rejected before joining.

### 2.2 CRITICAL — Unauthenticated text overwrites via PATCH

- **Where:** `app/api/rooms/[roomId]/route.ts` (`PATCH`)
- **Problem:** Anyone could overwrite any room's text content (including private rooms) with no password check.
- **Fix:** `PATCH` now requires the room password, validates it server-side, and enforces the `MAX_TEXT_LENGTH` limit on the payload.

### 2.3 CRITICAL — Private room data leaked before password entry

- **Where:** `app/api/rooms/[roomId]/route.ts` (`GET`)
- **Problem:** For private rooms the API returned the *full* room object (including `textContent` and `participants`) alongside `requiresPassword: true`.
- **Fix:** Without valid credentials, private rooms now return only safe metadata: `roomId`, `name`, `isPrivate`, `autoDelete`, `createdAt`, `expiresAt`. Full data is available by:
  - passing the correct password as `?password=` to the GET request, or
  - calling `POST /api/rooms/[roomId]/verify`, which now returns the full room (sans hash) on success so clients can hydrate their cache after unlocking.

### 2.4 HIGH — Any socket could inject edits into any room

- **Where:** `server.ts` (`text:change`, `yjs:update`, `yjs:sync-request`, `message:send`, `room:leave`)
- **Problem:** Handlers never checked whether the emitting socket had actually joined the room, so unauthenticated clients could push text updates into arbitrary rooms.
- **Fix:** Added an `isRoomMember()` guard to every event handler, plus:
  - rate limits for `text:change` (60/min) and `yjs:update` (300/min),
  - input validation (types checked before processing),
  - one-room-per-socket enforcement.

### 2.5 MEDIUM — Timing-unsafe password comparison

- **Where:** `lib/encryption.ts` (`verifyPassword`)
- **Problem:** Hashes were compared with `===`, which is theoretically vulnerable to timing attacks.
- **Fix:** Comparison now uses `crypto.timingSafeEqual` with length guards.

### 2.6 MEDIUM — Silent fallback encryption key

- **Where:** `lib/encryption.ts`
- **Problem:** A missing `ENCRYPTION_KEY` silently fell back to a hardcoded default, making message "encryption" effectively plaintext with no indication.
- **Fix:** Emits a loud warning when the key is missing. The check is lazy (resolved on first use) because ESM static imports in `server.ts` evaluate before `loadEnvConfig()`, which previously caused false-positive warnings even when the key was set.

---

## 3. Correctness fixes

### 3.1 HIGH — Yjs collaborative state was per-connection

- **Where:** `server.ts`
- **Problem:** The shared `roomStates` Map was declared *inside* the `io.on("connection")` callback, so every socket connection got its own empty map. Server-side state merging between collaborators never happened.
- **Fix:** Hoisted the Map above the connection handler so state is genuinely shared per room.

### 3.2 HIGH — Room-deletion notifications never worked

- **Where:** `app/api/socket/room-deleted/route.ts` (moved), `lib/socket-instance.ts`, `app/api/rooms/[roomId]/route.ts`
- **Problem:** Two compounding issues:
  1. engine.io intercepts every request whose path starts with `/api/socket`, so `POST /api/socket/room-deleted` was answered by engine.io itself with `"Transport unknown"` and **never reached the Next.js route**.
  2. `server.ts` stored the io instance on `global.io` while API routes read from a module-level variable — two separate module registries that never meet, so `getSocketIO()` always returned `null`.
- **Fix:**
  - Route moved out of the reserved prefix to **`POST /api/notify/room-deleted`**.
  - The io instance is now shared through a typed `globalThis` singleton (`setSocketIO` / `getSocketIO`), which works across both module registries.
  - Verified end-to-end: deleting a room via the API now broadcasts `room:deleted` to connected clients.

### 3.3 MEDIUM — Dead cleanup code masked a design decision

- **Where:** `app/room/[roomId]/page.tsx`
- **Problem:** The join effect's cleanup referenced a stale `hasJoined` closure, so `room:leave` never fired on unmount. Server-side disconnect handling was silently doing the real work.
- **Fix:** Removed the misleading code and documented that leaving is handled by the server's disconnect handler when the socket disconnects on unmount.

### 3.4 MEDIUM — URL-password verification re-ran repeatedly

- **Where:** `app/room/[roomId]/page.tsx`
- **Problem:** With `?password=` in the URL, the verify effect re-ran on every SWR mutation (e.g., participant updates), firing redundant verification requests.
- **Fix:** Guarded with a ref so verification runs once; successful verification hydrates the SWR cache with the full room returned by the verify endpoint.

### 3.5 LOW — Chat "Show more" button did nothing

- **Where:** `components/room/MessageList.tsx`
- **Problem:** The button had no click handler or state.
- **Fix:** Per-message expand/collapse state; button toggles between "Show more" / "Show less" without triggering the message's load-into-editor action.

---

## 4. Code hygiene

- Deleted dead code: `hooks/useRoomTimer.ts` (unused duplicate of `Timer` logic).
- Removed an unused `Badge` import, unused `MessageModel` import, unused prop (`RoomHeader.roomPassword`), and unused catch bindings.
- Fixed all pre-existing lint errors: `any` types in `api/rooms/route.ts`, `lib/rate-limit.ts` (also removed reliance on the removed `request.ip` property), `hooks/useYjsEditor.ts`; refs no longer exposed during render from `useYjsEditor`; replaced `@ts-ignore global.io` with the typed singleton.
- Updated `README.md` env var documentation (`NEXT_PUBLIC_APP_URL` is the actual variable used).
- Removed the vestigial `app/api/socket/route.ts` status stub (shadowed by engine.io anyway).

---

## 5. Behavior changes worth knowing (breaking-ish)

1. **`PATCH /api/rooms/[roomId]` requires the room password** — previously open to anyone.
2. **`GET /api/rooms/[roomId]` returns limited metadata for private rooms** until authenticated — clients must treat `requiresPassword: true` as authoritative.
3. **Socket joins to private rooms without a password are rejected** — legitimate clients already send the password after API verification.
4. **`POST /api/notify/room-deleted`** replaces the old (never-functional) `/api/socket/room-deleted`.

---

## 6. How this was verified

After applying fixes, the following suite was executed against a running dev server:

**REST**
- Create public/private rooms → success, no `passwordHash` in responses
- GET private room without password → metadata-only payload (confirmed keys)
- GET private room with `?password=` → full room, no hash
- PATCH without/wrong/right password → 403 / 403 / success
- Verify wrong/right password → 403 / 200 + full room
- Message create + fetch roundtrip (encrypted at rest, decrypted in transit)
- DELETE with password → success; subsequent GET → 404

**Socket.IO**
- Join private room without password → blocked
- Join with wrong password → rejected
- Join with correct password → joined (participants broadcast received)
- Outsider `text:change` dropped; member `text:change` broadcast
- API delete while connected → `room:deleted` received

**Tooling**
- `tsc --noEmit` clean · `eslint .` 0 problems · `next build` green · pages 200

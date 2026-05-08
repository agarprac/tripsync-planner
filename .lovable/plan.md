# TripSync AI — Build Plan

A real-time collaborative trip planner. Organizers create a trip and share a link. Guests join with just a nickname (anonymous auth). AI pre-loads activity suggestions, everyone votes, and one click generates a fair itinerary with a Group Harmony Score.

## Stack mapping

The PRD targets React + Vite + Supabase. This project is TanStack Start (React 19) on Lovable Cloud (Supabase under the hood) — the implementation maps cleanly:
- Tailwind v4 design tokens (`oklch`) for the indigo/amber palette
- TanStack Router file-based routes for `/`, `/create`, `/join/$tripId`, `/trip/$tripId`, `/demo`
- Lovable Cloud for Postgres, RLS, Realtime, Auth (email + anonymous), and Edge Functions
- Lovable AI Gateway (`google/gemini-2.5-flash`) replaces direct OpenAI — no API key needed, free during promo, same JSON-mode prompts

## Routes

```
src/routes/
  __root.tsx        shared providers (QueryClient, Toaster)
  index.tsx         landing page
  create.tsx        organizer trip creation (email auth gate)
  join.$tripId.tsx  guest join (anonymous auth)
  trip.$tripId.tsx  3-column collaboration board
  demo.tsx          pre-seeded Barcelona demo (no auth)
```

## Database (migration)

Tables: `profiles`, `trips`, `members`, `activities`, `votes`, `itineraries`, `destination_suggestions` — exactly per PRD §Database Schema, with RLS policies from §Row-Level Security and Realtime enabled on `activities`, `votes`, `trips`, `itineraries`, `members`. Auto-create profile trigger on `auth.users`.

## Edge Functions

1. `generate-destination-suggestions` — called after trip creation; checks cache, calls Lovable AI Gateway for 8 activity suggestions, inserts as AI activities.
2. `generate-itinerary` — called by any member to generate (organizer-only to regenerate); aggregates votes, calls AI, upserts itinerary, sets trip status to `itinerary_generated`.

Both use Lovable AI Gateway (`LOVABLE_API_KEY` is auto-provisioned), with try/catch returning empty/error so client falls back to `BARCELONA_FALLBACK`.

## Screens

1. **Landing** — hero, 3 feature cards, sticky header with Sign In + Create Trip
2. **Create Trip** — single-screen form: name, Photon city autocomplete, dates, vibe multi-chips, budget chips, submit → insert trip + member, invoke suggestions function, redirect to board
3. **Join Trip** — shows trip header + nickname input; signs in anonymously with `display_name` metadata, inserts member, redirects to board
4. **Board** — 3-column: left trip details + member avatars; center AI Suggestions + Group Activities + inline Add form; right panel empty until Generate, then Harmony bars + day-by-day itinerary + Regenerate/Finalize. Realtime subscription for activities/votes/trip/itinerary/members. Toasts on new cards, presence avatars in header, copy invite button.
5. **Finalized view** — same `/trip/$tripId` route but locked: votes/add disabled, dismissible upgrade banner.
6. **Demo** — pre-seeded local state Barcelona trip with 4 simulated guests + Simulate Live Collaboration button.

## Design system

Update `src/styles.css` with PRD palette as oklch tokens: indigo primary (`#4F46E5`), amber accent, harmony green/amber/red, gray scale. Inter font via Google Fonts. Card / button / input / badge / toast specs from PRD §Key Component Specs.

## Components

- `ActivityCard`, `AddActivityForm`, `VoteButtons`
- `CityAutocomplete` (Photon API, 300ms debounce)
- `HarmonyBars`, `ItineraryPanel`
- `MemberAvatars`, `StatusBadge`, `InviteButton`
- `BarcelonaFallback` constant

## Auth

- Organizer: Supabase email/password
- Guest: `signInAnonymously` with `display_name` in user metadata
- Auto-redirect unauthenticated `/create` visitors to a sign-up form (inline on `/create`)

## Build order

1. Enable Lovable Cloud
2. Migration: tables + RLS + trigger + realtime publications
3. Design system tokens + Inter font + base UI components
4. Auth helpers + Supabase client wrapper
5. Landing + Create + Join + Demo routes
6. Board route with Realtime + voting + add activity
7. Edge functions (suggestions + itinerary)
8. Generate flow + Harmony bars + itinerary panel + Finalize

## Out of scope for v1

- Email upgrade flow for guests (banner is dismissible only)
- Itinerary reorder ↑/↓ (mention as future; PRD says local state only)
- Mobile <768px polish (desktop-first per PRD)

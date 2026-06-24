---
name: goski-supabase
description: Supabase schema, client config, RLS policies, and edge functions used in GOSKI Mobile.
---

## Client setup
- Initialized in `lib/supabase.ts` with `db: { schema: 'laravel' }`
- Uses `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` env vars
- Falls back to a noop client if env vars are missing (prevents crashes during dev)
- Has `ensureProfile(userId)` helper that tries to insert into `laravel.users` — handles RLS errors silently

## Schema: `laravel`
- `users` — id (uuid, FK auth.users), username, email, profile_photo_url
- `posts` — id, user_id, image_url, description, moderation_status, is_nsfw
- `likes` — id, user_id, post_id
- `follows` — id, follower_id, followed_id
- `post_tag` — post_id, tag_id
- `tags` — id, name

## RLS policies on `laravel.posts`
- "Posts aprovados públicos": SELECT WHERE moderation_status IN ('VERY_UNLIKELY', 'UNLIKELY', 'UNKNOWN')
- "Dono ve posts pendentes": SELECT WHERE auth.uid() = user_id (covers null/own posts)

## Moderation flow
1. Post created with moderation_status = null
2. DB trigger notifies `image-moderator` edge function
3. Edge function calls Google Vision API -> sets moderation_status + is_nsfw
4. App filter: `moderation_status.is.null,moderation_status.in.(UNKNOWN,VERY_UNLIKELY,UNLIKELY)`
5. Posts with 'POSSIBLE' are blocked by RLS (need admin review)
6. Explicit content (score >= 4) has image deleted from storage, post remains

## Anon key rules
- Mobile app uses anon key, respects RLS
- INSERT into laravel.users with anon key is blocked by RLS — handle error silently
- Laravel backend uses service_role key (bypasses RLS)

## Storage
- Buckets are in `public` schema, not affected by `db.schema` config

## Query patterns
- Always use schema-qualified table names via config (not in queries)
- Avoid PostgREST nested joins (`.select('*, users(...)')`) — fetch related data in separate parallel queries
- Avoid `!foreign_key` join hints — schema cache may not have constraint names

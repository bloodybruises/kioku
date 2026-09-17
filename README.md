# kioku — archives of salience

A soft pink / black / light-gray visual archive with Pinterest-like masonry placement.

## Uploading to GitHub Pages
Keep this structure:

- index.html
- style.css
- app.js
- assets/
  - clouds.jpg
  - purple-glow.jpg
  - purple-architecture.jpg
  - night-trails.jpg
  - night-sky.jpg
  - night-blue.jpg

GitHub Pages can host the static version for free.

## What this version does
- Pinterest-like masonry photo grid
- search and tag filters
- favorites saved in the browser
- local photo adding
- local profile customization with display name, username, bio, avatar and background
- soft pastel pink / black / gray visual theme

## Important: public profiles
GitHub Pages is static hosting. A profile saved with localStorage exists only on the device/browser that created it. It is **not** a real account system and another visitor cannot see it.

For real public accounts, profiles, avatars/backgrounds and cross-device persistence, connect the site to a backend such as Supabase. Supabase can provide authentication, a database and file storage. Do not put a Supabase service-role key in this website; only use the browser-safe publishable/anon key with Row Level Security enabled.

The next backend version can add:
- sign up / sign in
- public profile pages
- editable profile backgrounds and avatars
- user-owned photo uploads
- boards/collections
- follows and saves
- public profile URLs

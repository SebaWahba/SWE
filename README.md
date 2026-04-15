# Supabase CLI

[![Coverage Status](https://coveralls.io/repos/github/supabase/cli/badge.svg?branch=develop)](https://coveralls.io/github/supabase/cli?branch=develop) [![Bitbucket Pipelines](https://img.shields.io/bitbucket/pipelines/supabase-cli/setup-cli/master?style=flat-square&label=Bitbucket%20Canary)](https://bitbucket.org/supabase-cli/setup-cli/pipelines) [![Gitlab Pipeline Status](https://img.shields.io/gitlab/pipeline-status/sweatybridge%2Fsetup-cli?label=Gitlab%20Canary)
](https://gitlab.com/sweatybridge/setup-cli/-/pipelines)

[Supabase](https://supabase.io) is an open source Firebase alternative. We're building the features of Firebase using enterprise-grade open source tools.

This repository contains all the functionality for Supabase CLI.

- [x] Running Supabase locally
- [x] Managing database migrations
- [x] Creating and deploying Supabase Functions
- [x] Generating types directly from your database schema
- [x] Making authenticated HTTP requests to [Management API](https://supabase.com/docs/reference/api/introduction)

## Getting started

### Install the CLI

Available via [NPM](https://www.npmjs.com) as dev dependency. To install:

- **START_HERE.md** - Quick start and common fixes
- **TROUBLESHOOTING_GUIDE.md** - Comprehensive problem-solving guide
- **QUICK_DEBUG_SCRIPT.md** - Automated diagnostic script
- **FIXES_APPLIED.md** - Recent changes and improvements

## 🛠️ Built-in Diagnostic Tools

### 1. Status Indicator (Top-Right)
Real-time server health monitoring:
- 🟢 Green = All systems operational
- 🟡 Yellow = Some issues detected
- 🔴 Red = Server down

### 2. Diagnostic Panel (Bottom-Right)
Comprehensive system checks:
- ✅ Server connectivity
- ✅ Video endpoints
- ✅ Search functionality
- ✅ Google OAuth config

### 3. Enhanced Error Messages
Every error includes:
- Clear description of what went wrong
- Step-by-step fix instructions
- Links to relevant documentation

## 🔐 Authentication

### Email/Password (Works Immediately ✅)
- No setup required
- Create account and sign in
- Full feature access

### Google Sign-In (Requires Setup ⚙️)
Follow the complete guide in `TROUBLESHOOTING_GUIDE.md` → Section "Issue 2"

**Quick version:**
1. Set up OAuth in Google Cloud Console
2. Configure provider in Supabase Dashboard
3. Add redirect URLs
4. Test sign-in

**Or just use email/password** - it's much simpler!

## 🎥 Features

### Core Features
- 📺 200+ curated videos across 8 categories
- 🎬 High-quality streaming playback
- 📱 Responsive design (desktop & mobile)
- 🔍 AI-powered content search
- 📊 Personalized recommendations
- 👤 User profiles and authentication

### AI Search
Search by:
- Video title
- Description
- AI summary
- Tags
- **Actual video content** (dialogue, narration)

Example searches:
- "AirPods" → Finds tech video about wireless earbuds
- "polar bear" → Finds Arctic wildlife documentary
- "jaguar hunting" → Finds nature footage

### Recommendations
Netflix-style personalization based on:
- ✅ Watch history
- ✅ Video categories
- ✅ Tags and themes
- ✅ Completion rate
- ✅ Watch duration

**Note:** Requires sign-in and watching 1-2 videos first.

## 🗂️ Categories

1. **Nature & Wildlife** - Animals, forests, oceans
2. **Science & Space** - Cosmos, physics, exploration
3. **Technology** - AI, gadgets, innovation
4. **Travel & Adventure** - Destinations, cultures, exploration
5. **Food & Cooking** - Culinary arts, recipes, culture
6. **Education** - Learning, tutorials, knowledge
7. **History** - Past events, civilizations, stories
8. **Health & Wellness** - Fitness, mental health, lifestyle

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Motion** (Framer Motion) - Animations
- **React Router v7** - Navigation
- **Lucide Icons** - Icon library
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Backend platform
- **Deno** - Edge Functions runtime
- **Hono** - Web server framework
- **PostgreSQL** - Database (via Supabase)

### Authentication
- **Supabase Auth** - User management
- **OAuth 2.0** - Google Sign-In
- **PKCE Flow** - Secure authentication

### Storage
- **KV Store** - Key-value database
- **Supabase Storage** - (Available for future video uploads)

## 📋 Quick Start

1. **Open the app** in your browser
2. **Check status indicator** (top-right) - should be green
3. **Browse videos** - works without sign-in
4. **Create account** - use email/password (easiest)
5. **Watch videos** - recommendations appear after watching
6. **Try AI search** - search for "AirPods", "polar bear", etc.

## 🔧 Development

### Running Locally
The app is deployed and ready to use. No local setup needed!

### Database
Uses Supabase KV store:
- `videos_database` - All videos (200+)
- `user_preferences:{userId}` - User viewing preferences
- `watch_history:{userId}` - User watch history

## 🐛 Debugging

### Browser Console
Press **F12** to see:
- Detailed error messages
- API call logs
- OAuth flow debugging
- Auth state changes

### Diagnostic Tools
1. **Status Indicator** - Live health check (top-right)
2. **Diagnostic Panel** - Full system test (bottom-right)
3. **Debug Script** - Automated testing (see QUICK_DEBUG_SCRIPT.md)

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Videos not loading | Server down | Check status indicator, redeploy |
| Google Sign-In fails | Not configured | See TROUBLESHOOTING_GUIDE.md |
| No recommendations | Not logged in / No watch history | Sign in and watch videos |

## 📊 Project Structure

```
/
├── src/app/
│   ├── App.tsx                 # Main app component
│   ├── routes.ts              # Route configuration
│   ├── pages/                 # Page components
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Browse.tsx
│   │   ├── Watch.tsx
│   │   └── AISearch.tsx
│   ├── components/            # Reusable components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── VideoRow.tsx
│   │   ├── DiagnosticPanel.tsx
│   │   └── StatusIndicator.tsx
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx
│   │   └── RecommendationContext.tsx
│   └── lib/
│       └── api.ts             # API client
├── utils/supabase/
│   └── info.tsx               # Supabase config
└── docs/
    ├── START_HERE.md
    ├── TROUBLESHOOTING_GUIDE.md
    ├── QUICK_DEBUG_SCRIPT.md
    └── FIXES_APPLIED.md
```

When installing with yarn 4, you need to disable experimental fetch with the following nodejs config.

```
NODE_OPTIONS=--no-experimental-fetch yarn add supabase
```

**Your URLs:**
- App: [Your deployment URL]
- Supabase: https://supabase.com/dashboard/project/ydywwijhmjvtkgxkugnx

<details>
  <summary><b>macOS</b></summary>

  Available via [Homebrew](https://brew.sh). To install:

  ```sh
  brew install supabase/tap/supabase
  ```

  To install the beta release channel:
  
  ```sh
  brew install supabase/tap/supabase-beta
  brew link --overwrite supabase-beta
  ```
  
  To upgrade:

  ```sh
  brew upgrade supabase
  ```
</details>

<details>
  <summary><b>Windows</b></summary>

  Available via [Scoop](https://scoop.sh). To install:

  ```powershell
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase
  ```

  To upgrade:

  ```powershell
  scoop update supabase
  ```
</details>

<details>
  <summary><b>Linux</b></summary>

  Available via [Homebrew](https://brew.sh) and Linux packages.

  #### via Homebrew

  To install:

  ```sh
  brew install supabase/tap/supabase
  ```

  To upgrade:

  ```sh
  brew upgrade supabase
  ```

  #### via Linux packages

  Linux packages are provided in [Releases](https://github.com/supabase/cli/releases). To install, download the `.apk`/`.deb`/`.rpm`/`.pkg.tar.zst` file depending on your package manager and run the respective commands.

  ```sh
  sudo apk add --allow-untrusted <...>.apk
  ```

  ```sh
  sudo dpkg -i <...>.deb
  ```

  ```sh
  sudo rpm -i <...>.rpm
  ```

  ```sh
  sudo pacman -U <...>.pkg.tar.zst
  ```
</details>

<details>
  <summary><b>Other Platforms</b></summary>

  You can also install the CLI via [go modules](https://go.dev/ref/mod#go-install) without the help of package managers.

  ```sh
  go install github.com/supabase/cli@latest
  ```

  Add a symlink to the binary in `$PATH` for easier access:

  ```sh
  ln -s "$(go env GOPATH)/bin/cli" /usr/bin/supabase
  ```

  This works on other non-standard Linux distros.
</details>

<details>
  <summary><b>Community Maintained Packages</b></summary>

  Available via [pkgx](https://pkgx.sh/). Package script [here](https://github.com/pkgxdev/pantry/blob/main/projects/supabase.com/cli/package.yml).
  To install in your working directory:

  ```bash
  pkgx install supabase
  ```

  Available via [Nixpkgs](https://nixos.org/). Package script [here](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/tools/supabase-cli/default.nix).
</details>

### Run the CLI

```bash
supabase bootstrap
```

Or using npx:

```bash
npx supabase bootstrap
```

The bootstrap command will guide you through the process of setting up a Supabase project using one of the [starter](https://github.com/supabase-community/supabase-samples/blob/main/samples.json) templates.

## Docs

Command & config reference can be found [here](https://supabase.com/docs/reference/cli/about).

## Breaking changes

We follow semantic versioning for changes that directly impact CLI commands, flags, and configurations.

However, due to dependencies on other service images, we cannot guarantee that schema migrations, seed.sql, and generated types will always work for the same CLI major version. If you need such guarantees, we encourage you to pin a specific version of CLI in package.json.

## Developing

To run from source:

```sh
# Go >= 1.22
go run . help
```

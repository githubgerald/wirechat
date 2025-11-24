# Wirechat Documentation

> Developer guide and reference for Wirechat, a React + Vite chat application with Flask backend. Organized by common workflows and detailed technical reference.

## Quick Navigation

- [Getting Started](#getting-started) — Installation and first steps
- [Architecture](#architecture) — System design and key decisions
- [Frontend Guide](#frontend-guide) — React components, contexts, and styling
- [Backend API](#backend-api) — Endpoints, authentication, data models
- [How-to Guides](#how-to-guides) — Common development tasks
- [Troubleshooting](#troubleshooting) — Known issues and solutions

---

## Getting Started

### Installation

Prerequisites:
- Node.js 16+ and npm/pnpm
- Python 3.7+
- Git

**Step 1: Clone and install dependencies**

```bash
git clone <repo-url>
cd wirechat
npm install
```

**Step 2: Run the dev backend**

The Flask dev server handles authentication, user data, and static assets.

```bash
python cserver.py
```

Server runs on `http://localhost:5000` by default.

**Step 3: Start the frontend dev server**

```bash
npm run dev
```

Vite will open a browser to `http://localhost:5173` (or next available port).

**Step 4: Log in**

Use credentials from `data/users/users.json`:
- Username: `anri`, Password: `password`
- Username: `cam`, Password: `password`

The logged-in user's profile picture (from `public/user_pfp/`) will appear in the top-left corner.

---

## Architecture

### Overview

**Frontend:** React app built with Vite, styled with SCSS. Components are organized by feature area (chat, layout, settings, etc.). State is managed via React Context.

**Backend:** Flask development server provides:
- Authentication (`/api/v0/auth/login`)
- User data endpoints (`/api/v0/users/<username>`)
- Static file serving (assets, user profile pictures)

**Data:** User profiles and settings stored in `data/users/users.json` (dev only).

```
┌─────────────────────┐
│   React (Vite)      │ port 5173
│  - Components       │
│  - Contexts         │ ←→ REST API
│  - Hooks            │
└─────────────────────┘
          ↑
          │ HTTP
          ↓
┌─────────────────────┐
│ Flask (cserver.py)  │ port 5000
│  - Auth endpoint    │
│  - User endpoint    │ ←→ data/users/users.json
│  - Static serving   │
└─────────────────────┘
```

### Key Decisions

1. **Profile pictures served from `/user_pfp/`** — Separate route for user content (not UI assets).
2. **localStorage for session state** — Client stores `username`, `userProfile`, `settings`, `permissions` after login.
3. **SCSS + CSS theme system** — Modular styles in `src/styles/`; themes applied via CSS custom properties.
4. **Contexts for shared state** — ChatContext, SettingsContext, ThemeContext manage app-wide data.

---

## Frontend Guide

### Project Structure

```
src/
├── App.jsx                    # Main app component
├── main.jsx                   # Entry point
├── index.css                  # Global styles
├── components/
│   ├── auth/
│   │   └── LoginPage.jsx      # Authentication UI
│   ├── layout/
│   │   ├── TopBar.jsx         # Header with profile, settings, channel name
│   │   ├── Navbar.jsx         # Sidebar with chat list
│   │   ├── ChatsSection.jsx   # Chat list container
│   │   ├── TextSection.jsx    # Message display area
│   │   └── TextInputSection.jsx
│   ├── chat/
│   │   ├── Message.jsx        # Single message component
│   │   ├── MessageList.jsx    # Message list + typing indicator
│   │   ├── TypingIndicator.jsx
│   │   └── ProfilePopup.jsx   # User profile popup
│   ├── media/
│   │   ├── MediaWrapper.jsx   # Video/media container
│   │   └── VideoControls.jsx
│   ├── settings/
│   │   ├── SettingsMenu.jsx   # Settings modal
│   │   ├── SettingsSection.jsx # Settings group
│   │   └── ColorSlider.jsx    # Color picker
│   └── ui/
│       ├── Button.jsx
│       ├── Modal.jsx
│       └── ContextMenu.jsx
├── context/
│   ├── ChatContext.jsx        # Messages, chats, current user
│   ├── SettingsContext.jsx    # App settings (theme, notifications)
│   └── ThemeContext.jsx       # Theme switching
├── hooks/
│   ├── useChat.jsx            # Access ChatContext
│   ├── useSettings.jsx        # Access SettingsContext
│   ├── useLocalStorage.jsx    # Persistent state
│   ├── useMedia.jsx           # Media (camera, etc.)
│   └── useNotifications.jsx  # Browser notifications
├── utils/
│   ├── colorUtils.js
│   ├── dateUtils.js
│   ├── fileUtils.js
│   └── notificationUtils.js
├── styles/
│   ├── styles.scss            # Main styles (source)
│   ├── styles.css             # Compiled CSS
│   ├── theme.css              # Theme overrides
│   ├── settings-styles.scss   # Settings-specific
│   ├── globals.css            # Global resets
│   ├── _variables.scss        # SCSS variables
│   └── index.css              # App entry style
└── assets/
    └── images/                # UI assets (icons, backgrounds)
```

### Key Components

#### TopBar

Located: `src/components/layout/TopBar.jsx`

Displays:
- Top-left profile picture (32×32) — user's pfp from `/user_pfp/`
- Clicking opens a profile popup
- Channel name display
- Clock showing current time
- Settings icon (right side)

**Usage:**
```jsx
<TopBar />
```

#### ProfilePopup

Located: `src/components/chat/ProfilePopup.jsx`

Shows detailed user profile:
- Larger profile picture (96×96)
- Username, role, bio
- Permissions count
- Mention and Profile buttons

**Props:**
```jsx
<ProfilePopup
  position={{ x: number, y: number }}  // popup position (pixels)
  profile={profile}                      // { username, profile: {...}, permissions: [...] }
  onClose={() => {...}}                 // callback to close popup
/>
```

#### SettingsMenu

Located: `src/components/settings/SettingsMenu.jsx`

Modal dialog for user settings:
- Theme switcher (light/dark/oled)
- Color customization
- Notification toggles
- Message display mode (compact/cozy/spacious)

---

## Context API

### ChatContext

**Location:** `src/context/ChatContext.jsx`

**Exposed state:**
```jsx
{
  currentUsername,      // logged-in user's username (string)
  userProfile,          // { pfp, bio, color }
  currentChatId,        // active chat UUID
  messages,             // [{ id, user, text, timestamp }, ...]
  chats,                // { [id]: { name, users, ... }, ... }
  channelNames,         // { [id]: string, ... }
  // ... other state and setters
}
```

**Usage:**
```jsx
import { useChat } from '../hooks/useChat';

function MyComponent() {
  const { currentUsername, userProfile } = useChat();
  return <div>{currentUsername}</div>;
}
```

### SettingsContext

**Location:** `src/context/SettingsContext.jsx`

Manages:
- Theme (light/dark/oled)
- Font size, message display mode
- Notification preferences
- Color scheme

---

## Styling Guide

### Overview

Styles are managed with **SCSS + CSS themes**. The canonical source is `src/styles/styles.scss`; do **not** manually edit `styles.css`.

### File Organization

| File | Purpose |
|------|---------|
| `_variables.scss` | SCSS variables (spacing, colors, sizes) |
| `styles.scss` | Main component styles (compiled to `styles.css`) |
| `theme.css` | Theme overrides applied via CSS custom properties |
| `globals.css` | Global resets and utility classes |
| `settings-styles.scss` | Settings modal styles |

### How Theming Works

1. Base styles in `styles.scss` use CSS variables (e.g., `var(--bg-primary)`).
2. `theme.css` defines theme-specific values:
   ```css
   body.theme-light {
     --bg-primary: #ffffff;
     --text-primary: #000000;
   }
   
   body.theme-dark {
     --bg-primary: #1e1e1e;
     --text-primary: #ffffff;
   }
   ```
3. SettingsContext applies theme class to `<body>` element.

### Known Issues

**Duplicate style definitions (CRITICAL):**
- `oldWebsite/static/` contains legacy copies of `.scss` and `.css` files — archived but not removed.
- `src/styles/styles.css` is compiled; changes should only be made in `styles.scss`.
- `dist/` contains production build artifacts (minified CSS); should be ignored in source control.

**Hardcoded background images removed:**
- `.pfpImage` used to have `background: url(/assets/images/ado.jpg)`, which overrode dynamic images. Removed.
- Profile pictures now load from `/user_pfp/` URLs set dynamically in components.

### Best Practices

1. Edit `styles.scss`, not `styles.css`.
2. Use SCSS variables and nesting for maintainability.
3. Keep theme-specific rules in `theme.css`.
4. Test all three themes (light/dark/oled).

---

## Backend API

### Authentication

**Endpoint:** `POST /api/v0/auth/login`

**Request:**
```json
{
  "username": "anri",
  "password": "password"
}
```

**Response (on success):**
```json
{
  "success": true,
  "token": "dev_token_xyz",
  "username": "anri",
  "profile": {
    "pfp": "anri.svg",
    "bio": "Anri's profile",
    "color": "#66CCDA"
  },
  "settings": { ... },
  "permissions": ["send_messages", "read_messages", ...]
}
```

**Frontend usage** (`LoginPage.jsx`):
```jsx
const response = await fetch('http://localhost:5000/api/v0/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});
const data = await response.json();
localStorage.setItem('username', data.username);
localStorage.setItem('userProfile', JSON.stringify(data.profile));
// ...
```

### User Data

**Endpoint:** `GET /api/v0/users/<username>`

**Response:**
```json
{
  "success": true,
  "username": "anri",
  "profile": {
    "pfp": "anri.svg",
    "bio": "Anri's profile",
    "color": "#66CCDA"
  },
  "settings": { ... },
  "permissions": ["send_messages", "read_messages", ...]
}
```

Used by `TopBar` and `ProfilePopup` to fetch user details on demand.

### Static Assets

**Endpoint:** `GET /user_pfp/<filename>`

Serves profile pictures from `public/user_pfp/`.

Example: `/user_pfp/anri.svg` → returns `public/user_pfp/anri.svg`

### Asset Serving

**Endpoint:** `GET /assets/<type>/<file>`

Serves UI assets from `src/assets/`.

Example: `/assets/images/icon.webp` → returns `src/assets/images/icon.webp`

---

## Profile System

### How It Works

1. **User data:** Stored in `data/users/users.json` with a `profile.pfp` field:
   ```json
   {
     "username": "anri",
     "profile": {
       "pfp": "anri.svg",
       "bio": "Anri's profile",
       "color": "#66CCDA"
     }
   }
   ```

2. **Image storage:** Profile pictures live in `public/user_pfp/`:
   - `public/user_pfp/anri.svg`
   - `public/user_pfp/cam.svg`

3. **Login flow:**
   - LoginPage calls `/api/v0/auth/login`
   - Backend returns `profile` object
   - LoginPage saves to localStorage

4. **Display:**
   - TopBar reads `userProfile` from ChatContext (loaded from localStorage)
   - TopBar builds URL: `/user_pfp/${userProfile.pfp}`
   - Clicking TopBar opens ProfilePopup (fetches from `/api/v0/users/<username>`)

---

## How-to Guides

### Add a new user

Edit `data/users/users.json`:

```json
{
  "username": "newuser",
  "password": "password",
  "profile": {
    "pfp": "newuser.svg",
    "bio": "New user's bio",
    "color": "#FF6B6B"
  },
  "settings": { /* copy from existing user */ },
  "permissions": ["send_messages", "read_messages", ...]
}
```

Create profile picture at `public/user_pfp/newuser.svg` (or .jpg/.png).

### Customize a user's theme color

Edit `data/users/users.json`, set `profile.color` to a hex value:

```json
"color": "#3a3af8"  // blue
```

The ProfilePopup will show this color as the role badge background.

### Add a new component

1. Create file in `src/components/<category>/NewComponent.jsx`
2. Add styles to `src/styles/styles.scss` (or a new partial imported by `styles.scss`)
3. Import and use in parent component
4. Test against all themes

### Modify the settings menu

Edit `src/components/settings/SettingsMenu.jsx` or `SettingsSection.jsx`. Changes are persisted via `SettingsContext` and localStorage.

### Change the app theme

Themes are defined in `src/styles/theme.css`. To add a new theme:

1. Add CSS variables block (e.g., `body.theme-custom { ... }`)
2. Add theme option to SettingsContext
3. Update SettingsSection to include new theme choice
4. Test all components in new theme

---

## Troubleshooting

### Profile picture not showing (green circle instead)

**Cause:** Usually a wrong image URL path or missing file.

**Check:**
1. User's `pfp` in `data/users/users.json` matches a file in `public/user_pfp/`
2. URL in TopBar/ProfilePopup is `/user_pfp/...` (not `/assets/images/...`)
3. Backend is running (Flask server) to serve `/user_pfp/` route
4. Browser console shows no 404 errors

### Settings not persisting

**Cause:** localStorage may be disabled or settings key is wrong.

**Fix:**
- Check browser's storage settings
- Verify SettingsContext is using `useLocalStorage` correctly
- Clear localStorage and try again: `localStorage.clear()`

### Styles not applying

**Cause:** Compiled CSS out of sync with SCSS source.

**Fix:**
1. Verify you edited `styles.scss`, not `styles.css`
2. Check that Vite is running and recompiling styles
3. Hard-refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser DevTools for CSS overrides or specificity issues

### Login fails with "Cannot POST /api/v0/auth/login"

**Cause:** Flask backend not running or CORS not configured.

**Fix:**
1. Ensure Flask is running: `python cserver.py`
2. Check Flask output for errors
3. Verify frontend is calling correct URL (`http://localhost:5000/api/v0/auth/login`)

---

## Development Checklist

Before pushing to production or sharing:

- [ ] Remove legacy `oldWebsite/static/` or archive properly
- [ ] Add `dist/` to `.gitignore` (build artifacts)
- [ ] Consolidate all SCSS edits; do not manually edit compiled CSS
- [ ] Test login with both users (`anri` and `cam`)
- [ ] Check profile pictures display in TopBar and ProfilePopup
- [ ] Verify all three themes (light/dark/oled) apply correctly
- [ ] Test settings persistence across page reloads
- [ ] Check browser console for errors and warnings

---

## Next Steps & Improvements

- [ ] Migrate auth to use robust JSON validation and better error messages
- [ ] Add unit tests for components and contexts
- [ ] Set up automated SCSS → CSS compilation in build pipeline
- [ ] Create a settings documentation file (USER_GUIDE.md)
- [ ] Document WebSocket or real-time chat implementation
- [ ] Add deployment guide (Vercel/Netlify for frontend, hosting for Flask)

---

**Last Updated:** November 2025  
**Maintainers:** Development team
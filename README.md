# Instagzam

A minimal, anti-distraction Instagram web enhancement userscript designed for mobile & desktop browser use (Tampermonkey / Violentmonkey).

[![Install with Tampermonkey](https://img.shields.io/badge/Install%20with-Tampermonkey-00485B?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://raw.githubusercontent.com/mehuljain866/Instagzam/main/instagzam.user.js)

---

## ⚡ 1-Click Direct Install / Update Link

If you already have Tampermonkey or Violentmonkey installed, click the button above or copy this direct raw script URL:

```text
https://raw.githubusercontent.com/mehuljain866/Instagzam/main/instagzam.user.js
```

### 📌 How to install via URL in Tampermonkey (Mobile & Desktop):
1. Open Tampermonkey **Dashboard**.
2. Tap/Click the **Utilities** tab.
3. Under **"Install from URL"**, paste:
   ```text
   https://raw.githubusercontent.com/mehuljain866/Instagzam/main/instagzam.user.js
   ```
4. Tap **Install**.

*(Automatic updates: Tampermonkey will automatically check this repository for updates and keep your script up to date!)*

---

## ✨ Key Features

### 1. Unified Notes + Stories Strip (DMs Page)
- **Merged Strip**: Replaces the notes row with a single horizontal scroll strip showing notes (floating pill above) and stories (gradient ring) together.
- **Your Bubble (#1)**: Always appears first with your avatar, your note (if posted), and a **`+` badge**.
  - **Tap `+` badge**: Opens the quick action sheet to **Add to Your Story**, **Share Note**, **Create Post / Reel**, or **View Your Profile**.
  - **Tap your avatar**: Views your story (if active) or opens the create menu.
  - **Tap your label**: Takes you directly to your own profile page (`/username/`).
- **Contact Bubbles**:
  - **Tap avatar / story ring**: Opens their story (`/stories/username/`).
  - **Tap note pill**: Opens your DM thread with them.
  - **Tap label / avatar (if no story)**: Opens your DM thread with them.
  - Contacts with neither notes nor stories are not shown.

### 2. 🚫 Anti-Doomscroll Reels Lock (Single Reel Viewer)
- When someone shares a reel with you in DMs, tapping it opens the reel.
- **Scrolling / swiping to other videos is completely disabled** (wheel, touch vertical swipe gestures, down/up arrow keys are locked).
- **Auto-advance is blocked**: The shared video loops continuously.
- **Full interaction preserved**: You can still **Like**, **Comment**, **Share**, **Save**, adjust audio, view creator profile, and pause/play.
- **Comments drawer scrolling is preserved**: You can read and scroll through all comments without triggering reel scrolling.

### 3. 🛡️ Auto-Dismiss "Open in App" Popups
- Automatically cleans up and hides intrusive "Open in Instagram App" banners and bottom-sheet overlays on mobile web.

---

## 📲 How to Install from Scratch

### On Android (Firefox - Recommended & Secure)
1. Install **[Firefox for Android](https://play.google.com/store/apps/details?id=org.mozilla.firefox)** from Google Play Store.
2. In Firefox, open: `https://addons.mozilla.org/en-US/android/addon/tampermonkey/`
3. Tap **Add to Firefox**.
4. Open the Firefox menu (three dots `⋮`) -> **Extensions** -> **Tampermonkey** -> **Dashboard**.
5. Go to the **Utilities** tab -> Paste `https://raw.githubusercontent.com/mehuljain866/Instagzam/main/instagzam.user.js` under **"Install from URL"** -> Tap **Install**.
6. Go to `https://www.instagram.com/direct/inbox/` and log in!

> **Tip for Mobile**: Bookmark `https://www.instagram.com/direct/inbox/` in Firefox for instant 1-tap access. In Firefox Settings -> Customize, enable "Scroll to hide toolbar" to get a full-screen native app look.

---

### On Desktop (Chrome / Firefox / Edge / Brave)
1. Install the [Tampermonkey Extension](https://www.tampermonkey.net/).
2. Click this direct link: [Install instagzam.user.js](https://raw.githubusercontent.com/mehuljain866/Instagzam/main/instagzam.user.js)
3. Tampermonkey will prompt you to click **Install**.
4. Open `https://www.instagram.com/direct/inbox/`.

---

## 🛠️ File Structure

```
Instagzam/
├── instagzam.user.js   # The main userscript
└── README.md           # Documentation & installation guide
```

---

## 🔄 Maintenance & Contributions

To update the userscript, edit `instagzam.user.js`, commit, and push to `main`. Users who installed via URL will automatically receive updates through Tampermonkey's built-in script updater.

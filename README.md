# Instagzam

A minimal, anti-distraction Instagram web enhancement userscript designed for mobile & desktop browser use (Tampermonkey).

## ✨ Key Features

### 1. Unified Notes + Stories Strip (DMs page)
- **Merged Strip**: Replaces the notes row with a single horizontal scroll strip showing notes (floating pill above) and stories (gradient ring) together.
- **Your Bubble (#1)**: Always appears first with your avatar, your note (if posted), and a **"+"** badge.
  - **Tap "+" badge**: Opens the quick action sheet to **Add to Your Story**, **Share Note**, **Create Post / Reel**, or **View Your Profile**.
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

---

## 📲 How to Install

### On Android (Mobile)

#### Option A: Firefox for Android (Recommended)
1. Install **Firefox for Android** from Google Play Store.
2. In Firefox, open: `addons.mozilla.org/en-US/firefox/addon/tampermonkey/`
3. Tap **Add to Firefox**.
4. Open the Firefox menu (three dots) -> **Add-ons** -> **Tampermonkey** -> **Dashboard**.
5. Tap the **+** (Create new script) tab.
6. Select all and paste the entire contents of `instagzam.user.js`.
7. Tap **File** -> **Save** (or Ctrl+S).
8. Go to `instagram.com` and log in. Navigate to DMs (`/direct/inbox/`).

> **Tip for Mobile**: Bookmark `https://www.instagram.com/direct/inbox/` for instant access. (Avoid standard browser PWA "Add to Home Screen" on Firefox as standalone PWAs disable extension scripts; instead use Lemur/Quetta browser or keep it bookmarked in Firefox).

#### Option B: Lemur Browser / Quetta Browser (Chromium with PWA Extensions)
1. Install **Lemur Browser** from Play Store.
2. Install Tampermonkey from the Chrome Web Store inside Lemur.
3. Paste `instagzam.user.js` into Tampermonkey and save.

---

### On Desktop (Chrome / Firefox / Edge / Brave)
1. Install the [Tampermonkey Extension](https://www.tampermonkey.net/).
2. Click Tampermonkey icon -> **Create a new script...**
3. Replace the default template with `instagzam.user.js` and press `Ctrl + S`.
4. Open `instagram.com/direct/inbox/`.

---

## 🛠️ File Structure

```
C:\Users\mehul\D\Projects\Instagzam\
├── instagzam.user.js   ← The complete userscript (install this)
└── README.md           ← Documentation & guide
```

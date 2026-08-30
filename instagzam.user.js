// ==UserScript==
// @name         Instagzam — Unified Notes + Stories & Anti-Doomscroll Reels
// @namespace    instagzam
// @version      2.1.0
// @description  Redirects home to DMs, unifies stories + notes into one strip, adds create shortcuts, and locks reels so you can watch shared reels without doomscrolling.
// @author       personal
// @match        *://*.instagram.com/*
// @match        *://instagram.com/*
// @updateURL    https://raw.githubusercontent.com/mehuljain866/Instagzam/main/instagzam.user.js
// @downloadURL  https://raw.githubusercontent.com/mehuljain866/Instagzam/main/instagzam.user.js
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// ==/UserScript==

;(function () {
  'use strict';

  console.log('%c[Instagzam] v2.1.0 ACTIVE', 'background: #0095f6; color: white; font-weight: bold; padding: 3px 6px; border-radius: 3px;');

  // ─── 1. Instant Redirect Home Feed -> DMs ──────────────────────────────────
  function checkHomeRedirect () {
    const p = location.pathname;
    if (p === '/' || p === '' || p === '/index.php' || p === '/index.html') {
      console.log('[Instagzam] Redirecting from home feed to /direct/inbox/...');
      location.replace('https://www.instagram.com/direct/inbox/');
    }
  }
  checkHomeRedirect();

  // ─── 2. State & Storage ───────────────────────────────────────────────────

  const CACHE_STORIES_KEY = 'igzam_stories_cache_v2';
  const CACHE_VIEWER_KEY = 'igzam_viewer_cache_v2';

  let cachedStories = [];
  try {
    const raw = (typeof GM_getValue === 'function') ? GM_getValue(CACHE_STORIES_KEY, '[]') : localStorage.getItem(CACHE_STORIES_KEY);
    cachedStories = JSON.parse(raw || '[]');
  } catch {}

  let cachedViewer = null;
  try {
    const rawV = (typeof GM_getValue === 'function') ? GM_getValue(CACHE_VIEWER_KEY, 'null') : localStorage.getItem(CACHE_VIEWER_KEY);
    cachedViewer = JSON.parse(rawV || 'null');
  } catch {}

  const STATE = {
    capturedHeaders: {},
    notes: [],
    myNote: null,
    stories: Array.isArray(cachedStories) ? cachedStories : [],
    myStory: null,
    viewer: cachedViewer,
    rendered: false,
    fetching: false,
  };

  // ─── 3. Global CSS via GM_addStyle ─────────────────────────────────────────

  const STRIP_CSS = `
    /* Auto-kill Open in App popups */
    [role="dialog"]:has(a[href*="instagram://"]),
    [role="dialog"]:has(a[href*="play.google.com"]),
    div[data-nosnippet]:has(a[href*="instagram://"]),
    div:has(> a[href*="instagram://"]),
    .open-in-app,
    #app-banner {
      display: none !important;
    }
    html, body {
      overflow-y: auto !important;
      position: static !important;
    }

    /* Unified Strip Container */
    #igzam-strip {
      display: flex !important;
      flex-direction: row !important;
      overflow-x: auto !important;
      overflow-y: visible !important;
      -webkit-overflow-scrolling: touch !important;
      scroll-snap-type: x proximity;
      scrollbar-width: none;
      padding: 16px 12px 10px !important;
      gap: 14px !important;
      background: #000 !important;
      box-sizing: border-box !important;
      width: 100% !important;
      position: relative !important;
      z-index: 9999 !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    #igzam-strip::-webkit-scrollbar { display: none !important; }

    .igzam-bubble {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      flex-shrink: 0 !important;
      width: 66px !important;
      scroll-snap-align: start;
      position: relative !important;
      padding-top: 32px !important;
      box-sizing: border-box !important;
    }

    .igzam-pill {
      position: absolute !important;
      top: 0 !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background: rgba(36, 36, 36, 0.95) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      border-radius: 12px !important;
      padding: 3px 8px !important;
      font-size: 11px !important;
      line-height: 1.3 !important;
      color: #fff !important;
      white-space: nowrap !important;
      max-width: 115px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      cursor: pointer !important;
      user-select: none !important;
      z-index: 15 !important;
      text-align: center !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.7) !important;
    }
    .igzam-pill:active {
      transform: translateX(-50%) scale(0.95) !important;
      opacity: 0.8 !important;
    }

    .igzam-ring {
      width: 58px !important;
      height: 58px !important;
      border-radius: 50% !important;
      padding: 2.5px !important;
      background: #2a2a2a !important;
      cursor: pointer !important;
      flex-shrink: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative !important;
      box-sizing: border-box !important;
    }
    .igzam-ring.has-story {
      background: conic-gradient(
        #f7b733 0%, #f09433 15%, #e6683c 30%,
        #dc2743 45%, #cc2366 65%, #bc1888 80%, #f7b733 100%
      ) !important;
    }
    .igzam-ring:active { transform: scale(0.95) !important; }

    .igzam-avatar-shell {
      width: 100% !important;
      height: 100% !important;
      border-radius: 50% !important;
      border: 2.5px solid #000 !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      background: #181818 !important;
      position: relative !important;
    }
    .igzam-avatar-shell img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      border-radius: 50% !important;
      display: block !important;
    }

    .igzam-plus-badge {
      position: absolute !important;
      right: -2px !important;
      bottom: -2px !important;
      width: 19px !important;
      height: 19px !important;
      border-radius: 50% !important;
      background: #0095f6 !important;
      border: 2px solid #000 !important;
      color: #fff !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      cursor: pointer !important;
      z-index: 12 !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.6) !important;
    }
    .igzam-plus-badge:active { transform: scale(0.9) !important; }

    .igzam-label {
      margin-top: 5px !important;
      font-size: 10.5px !important;
      color: #999 !important;
      text-align: center !important;
      width: 66px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      cursor: pointer !important;
    }

    #igzam-modal-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(0, 0, 0, 0.75) !important;
      backdrop-filter: blur(4px) !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: flex-end !important;
      justify-content: center !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transition: opacity 0.2s ease !important;
    }
    #igzam-modal-overlay.active {
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    #igzam-action-sheet {
      background: #262626 !important;
      width: 100% !important;
      max-width: 440px !important;
      border-radius: 20px 20px 0 0 !important;
      padding: 16px 16px 32px !important;
      box-sizing: border-box !important;
      transform: translateY(100%) !important;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
    }
    #igzam-modal-overlay.active #igzam-action-sheet { transform: translateY(0) !important; }
    .igzam-sheet-title {
      font-size: 13px !important;
      font-weight: 600 !important;
      color: #8e8e8e !important;
      text-align: center !important;
      padding-bottom: 8px !important;
      border-bottom: 1px solid rgba(255,255,255,0.1) !important;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
    }
    .igzam-sheet-btn {
      display: flex !important;
      align-items: center !important;
      gap: 14px !important;
      width: 100% !important;
      padding: 13px 16px !important;
      background: #333 !important;
      border: none !important;
      border-radius: 12px !important;
      color: #fff !important;
      font-size: 15px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      text-align: left !important;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
    }
    .igzam-sheet-btn:active { background: #444 !important; }
    .igzam-sheet-btn.cancel {
      background: transparent !important;
      color: #ed4956 !important;
      justify-content: center !important;
    }

    body.igzam-reel-locked {
      overflow: hidden !important;
      touch-action: pan-x pinch-zoom !important;
    }
  `;

  if (typeof GM_addStyle === 'function') {
    GM_addStyle(STRIP_CSS);
  } else {
    const el = document.createElement('style');
    el.id = 'igzam-css';
    el.textContent = STRIP_CSS;
    (document.head || document.documentElement).appendChild(el);
  }

  // ─── 4. Helpers ────────────────────────────────────────────────────────────

  function getCsrfToken () {
    const m = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    return m ? m[1] : (STATE.capturedHeaders['X-CSRFToken'] || '');
  }

  function getViewerPkFromCookie () {
    const m = document.cookie.match(/(?:^|;\s*)ds_user_id=([^;]+)/);
    return m ? m[1] : '';
  }

  function isDMsPage () {
    return /^\/direct($|\/)/.test(location.pathname);
  }

  function isReelPage () {
    return /^\/(reel|reels)\//.test(location.pathname) || (location.pathname.includes('/p/') && !!document.querySelector('video'));
  }

  function dismissAppPopups () {
    const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
    for (const b of buttons) {
      const txt = (b.textContent || '').trim().toLowerCase();
      if (['not now', 'cancel', 'dismiss', 'continue as web'].includes(txt)) {
        const dialog = b.closest('[role="dialog"]');
        if (dialog && (dialog.textContent || '').toLowerCase().includes('app')) {
          b.click();
        }
      }
    }
  }

  // ─── 5. Fetch Interception & GM_xmlhttpRequest ─────────────────────────────

  const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  if (win && win.fetch) {
    const _origFetch = win.fetch;
    win.fetch = async function (...args) {
      const url = (typeof args[0] === 'string') ? args[0] : (args[0]?.url ?? '');

      if (args[1]?.headers) {
        try {
          const h = args[1].headers;
          if (h instanceof Headers) {
            h.forEach((v, k) => { STATE.capturedHeaders[k] = v; });
          } else if (typeof h === 'object') {
            Object.assign(STATE.capturedHeaders, h);
          }
        } catch {}
      }

      const res = await _origFetch.apply(this, args);

      if (url.includes('reels_tray')) {
        res.clone().json().then(json => {
          if (json?.tray && Array.isArray(json.tray)) {
            STATE.stories = json.tray;
            if (typeof GM_setValue === 'function') GM_setValue(CACHE_STORIES_KEY, JSON.stringify(json.tray));
            if (json.my_week || json.my_story) STATE.myStory = json.my_week || json.my_story;
            renderStrip();
          }
        }).catch(() => {});
      }

      if (url.includes('/notes/') && url.includes('get_notes')) {
        res.clone().json().then(json => {
          const raw = json.notes ?? json.data ?? [];
          STATE.notes = Array.isArray(raw) ? raw : [];
          const myNotes = json.my_notes ?? json.self_notes ?? [];
          if (Array.isArray(myNotes) && myNotes.length > 0) STATE.myNote = myNotes[0];
          renderStrip();
        }).catch(() => {});
      }

      return res;
    };
  }

  async function loadData () {
    if (STATE.fetching) return;
    STATE.fetching = true;

    try {
      const headers = {
        'X-CSRFToken': getCsrfToken(),
        'X-IG-App-ID': STATE.capturedHeaders['X-IG-App-ID'] || '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': '*/*',
        ...STATE.capturedHeaders,
      };

      if (typeof GM_xmlhttpRequest === 'function') {
        GM_xmlhttpRequest({
          method: 'GET',
          url: 'https://www.instagram.com/api/v1/feed/reels_tray/',
          headers,
          onload: (r) => {
            try {
              const json = JSON.parse(r.responseText);
              if (json?.tray && Array.isArray(json.tray)) {
                STATE.stories = json.tray;
                if (typeof GM_setValue === 'function') GM_setValue(CACHE_STORIES_KEY, JSON.stringify(json.tray));
                if (json.my_week || json.my_story) STATE.myStory = json.my_week || json.my_story;
                renderStrip();
              }
            } catch {}
          }
        });
      } else {
        const res = await fetch('https://www.instagram.com/api/v1/feed/reels_tray/', {
          method: 'GET',
          credentials: 'include',
          headers,
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.tray && Array.isArray(json.tray)) {
            STATE.stories = json.tray;
            if (json.my_week || json.my_story) STATE.myStory = json.my_week || json.my_story;
            renderStrip();
          }
        }
      }
    } catch (e) {
      console.warn('[Instagzam] loadData error:', e);
    } finally {
      STATE.fetching = false;
      renderStrip();
    }
  }

  // ─── 6. Detect Viewer ──────────────────────────────────────────────────────

  function detectViewerInfo () {
    if (STATE.viewer?.username && STATE.viewer?.profilePic && STATE.viewer.username !== 'Your note') return;
    const cookiePk = getViewerPkFromCookie();

    const imgs = Array.from(document.querySelectorAll('img'));
    for (const img of imgs) {
      const a = img.closest('a');
      if (a) {
        const href = a.getAttribute('href') || '';
        const username = href.replace(/\//g, '');
        if (username && username.length > 2 && !['direct', 'explore', 'reels', 'stories', 'p', 'settings', 'accounts'].includes(username.toLowerCase())) {
          if (img.src && !img.src.includes('data:image')) {
            STATE.viewer = {
              pk: cookiePk || username,
              username: username,
              profilePic: img.src,
            };
            if (typeof GM_setValue === 'function') GM_setValue(CACHE_VIEWER_KEY, JSON.stringify(STATE.viewer));
            return;
          }
        }
      }
    }

    if (!STATE.viewer && cookiePk) {
      STATE.viewer = {
        pk: cookiePk,
        username: 'Your note',
        profilePic: 'https://static.cdninstagram.com/rsrc.php/v3/y6/r/5q5t7-x7y4H.png',
      };
    }
  }

  // ─── 7. Build Merged Contact List ──────────────────────────────────────────

  function buildMergedList () {
    detectViewerInfo();
    const viewerPk = String(STATE.viewer?.pk || getViewerPkFromCookie() || 'self');
    const map = new Map();

    const selfNoteText = STATE.myNote?.note_text ?? STATE.myNote?.text ?? '';
    const hasMyStory = !!STATE.myStory || (STATE.myStory?.items?.length > 0);

    const selfEntry = {
      isSelf: true,
      pk: viewerPk,
      username: STATE.viewer?.username && STATE.viewer?.username !== 'Your note' ? STATE.viewer.username : 'Your note',
      profilePic: STATE.viewer?.profilePic || 'https://static.cdninstagram.com/rsrc.php/v3/y6/r/5q5t7-x7y4H.png',
      noteText: selfNoteText,
      threadId: null,
      hasStory: hasMyStory,
    };

    STATE.notes.forEach(n => {
      if (!n?.user?.pk) return;
      const pk = String(n.user.pk);
      if (pk === viewerPk || n.user.is_self) {
        selfEntry.noteText = n.note_text ?? n.text ?? '';
        if (n.user.profile_pic_url) selfEntry.profilePic = n.user.profile_pic_url;
        if (n.user.username) selfEntry.username = n.user.username;
        return;
      }
      map.set(pk, {
        isSelf: false,
        pk: pk,
        username: n.user.username ?? '',
        profilePic: n.user.profile_pic_url ?? '',
        noteText: n.note_text ?? n.text ?? '',
        threadId: n.thread_id ?? null,
        hasStory: false,
      });
    });

    STATE.stories.forEach(s => {
      if (!s?.user?.pk) return;
      const pk = String(s.user.pk);
      if (pk === viewerPk || s.user.is_self) {
        selfEntry.hasStory = true;
        if (s.user.profile_pic_url) selfEntry.profilePic = s.user.profile_pic_url;
        if (s.user.username) selfEntry.username = s.user.username;
        return;
      }
      if (map.has(pk)) {
        map.get(pk).hasStory = true;
      } else {
        map.set(pk, {
          isSelf: false,
          pk: pk,
          username: s.user.username ?? '',
          profilePic: s.user.profile_pic_url ?? '',
          noteText: '',
          threadId: null,
          hasStory: true,
        });
      }
    });

    const contacts = Array.from(map.values()).filter(e => e.noteText || e.hasStory);
    return [selfEntry, ...contacts];
  }

  // ─── 8. Modal Action Sheet ─────────────────────────────────────────────────

  function showCreateActionSheet (selfEntry) {
    let overlay = document.getElementById('igzam-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'igzam-modal-overlay';
      overlay.innerHTML = `
        <div id="igzam-action-sheet">
          <div class="igzam-sheet-title">Create & Profile</div>
          <button class="igzam-sheet-btn" id="igzam-btn-story">
            <span style="font-size: 20px;">📸</span> Add to Your Story
          </button>
          <button class="igzam-sheet-btn" id="igzam-btn-note">
            <span style="font-size: 20px;">✍️</span> Share a Note
          </button>
          <button class="igzam-sheet-btn" id="igzam-btn-post">
            <span style="font-size: 20px;">➕</span> Create Post / Reel
          </button>
          <button class="igzam-sheet-btn" id="igzam-btn-profile">
            <span style="font-size: 20px;">👤</span> View Your Profile
          </button>
          <button class="igzam-sheet-btn cancel" id="igzam-btn-cancel">Cancel</button>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.addEventListener('click', e => {
        if (e.target === overlay) hideCreateActionSheet();
      });
      overlay.querySelector('#igzam-btn-cancel').addEventListener('click', hideCreateActionSheet);

      overlay.querySelector('#igzam-btn-story').addEventListener('click', () => {
        hideCreateActionSheet();
        window.location.href = 'https://www.instagram.com/stories/create/';
      });

      overlay.querySelector('#igzam-btn-note').addEventListener('click', () => {
        hideCreateActionSheet();
        const nativeNoteBtn = document.querySelector('[aria-label*="Note"], [aria-label*="note"]');
        if (nativeNoteBtn) {
          nativeNoteBtn.click();
        } else {
          alert('Tap on your note pill or use the Instagram app to post a note.');
        }
      });

      overlay.querySelector('#igzam-btn-post').addEventListener('click', () => {
        hideCreateActionSheet();
        const nativeCreate = document.querySelector('[aria-label="New post"], [aria-label="Create"], svg[aria-label="New post"]');
        if (nativeCreate) {
          nativeCreate.closest('a, button, div[role="button"]')?.click();
        } else {
          window.location.href = 'https://www.instagram.com/create/style/';
        }
      });

      overlay.querySelector('#igzam-btn-profile').addEventListener('click', () => {
        hideCreateActionSheet();
        if (selfEntry.username && selfEntry.username !== 'Your note') {
          window.location.href = `https://www.instagram.com/${selfEntry.username}/`;
        } else {
          const cookiePk = getViewerPkFromCookie();
          window.location.href = cookiePk ? `https://www.instagram.com/${cookiePk}/` : 'https://www.instagram.com/';
        }
      });
    }

    setTimeout(() => overlay.classList.add('active'), 10);
  }

  function hideCreateActionSheet () {
    const overlay = document.getElementById('igzam-modal-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  function navigateToDM (item) {
    if (item.threadId) {
      window.location.href = `https://www.instagram.com/direct/t/${item.threadId}/`;
    } else {
      window.location.href = `https://www.instagram.com/direct/new/?username=${encodeURIComponent(item.username)}`;
    }
  }

  // ─── 9. Build Strip DOM ────────────────────────────────────────────────────

  function buildStrip (items) {
    const strip = document.createElement('div');
    strip.id = 'igzam-strip';

    items.forEach(item => {
      const bubble = document.createElement('div');
      bubble.className = 'igzam-bubble' + (item.isSelf ? ' is-self' : '');

      if (item.noteText) {
        const pill = document.createElement('div');
        pill.className = 'igzam-pill';
        pill.textContent = item.noteText;
        pill.title = item.noteText;
        pill.addEventListener('click', e => {
          e.stopPropagation();
          if (item.isSelf) {
            showCreateActionSheet(item);
          } else {
            navigateToDM(item);
          }
        });
        bubble.appendChild(pill);
      }

      const ring = document.createElement('div');
      ring.className = 'igzam-ring' + (item.hasStory ? ' has-story' : '');
      ring.addEventListener('click', () => {
        if (item.isSelf) {
          if (item.hasStory && item.username && item.username !== 'Your note') {
            window.location.href = `https://www.instagram.com/stories/${item.username}/`;
          } else {
            showCreateActionSheet(item);
          }
        } else {
          if (item.hasStory) {
            window.location.href = `https://www.instagram.com/stories/${item.username}/`;
          } else {
            navigateToDM(item);
          }
        }
      });

      const shell = document.createElement('div');
      shell.className = 'igzam-avatar-shell';

      const img = document.createElement('img');
      img.src = item.profilePic;
      img.alt = item.username;
      img.loading = 'lazy';
      img.onerror = () => {
        img.src = 'https://static.cdninstagram.com/rsrc.php/v3/y6/r/5q5t7-x7y4H.png';
      };

      shell.appendChild(img);
      ring.appendChild(shell);

      if (item.isSelf) {
        const plus = document.createElement('div');
        plus.className = 'igzam-plus-badge';
        plus.textContent = '+';
        plus.title = 'Add Story or Post';
        plus.addEventListener('click', e => {
          e.stopPropagation();
          showCreateActionSheet(item);
        });
        ring.appendChild(plus);
      }

      bubble.appendChild(ring);

      const label = document.createElement('div');
      label.className = 'igzam-label';
      label.textContent = item.isSelf ? 'Your note' : item.username;
      label.addEventListener('click', e => {
        e.stopPropagation();
        if (item.isSelf) {
          if (item.username && item.username !== 'Your note') {
            window.location.href = `https://www.instagram.com/${item.username}/`;
          } else {
            showCreateActionSheet(item);
          }
        } else {
          navigateToDM(item);
        }
      });
      bubble.appendChild(label);

      strip.appendChild(bubble);
    });

    return strip;
  }

  // ─── 10. Mount Strip into DMs ──────────────────────────────────────────────

  function renderStrip () {
    if (!isDMsPage()) return;

    const items = buildMergedList();
    if (!items.length) return;

    const existing = document.getElementById('igzam-strip');
    const newStrip = buildStrip(items);

    if (existing) {
      existing.replaceWith(newStrip);
      return;
    }

    const main = document.querySelector('main') || document.querySelector('section') || document.body;
    if (!main) return;

    const header = main.querySelector('header') || main.querySelector('h1')?.closest('div');
    const threadList = main.querySelector('a[href^="/direct/t/"]')?.closest('div[style*="overflow"]') || main.querySelector('div[role="list"]');

    if (header && header.parentNode) {
      header.parentNode.insertBefore(newStrip, header.nextSibling);
    } else if (threadList && threadList.parentNode) {
      threadList.parentNode.insertBefore(newStrip, threadList);
    } else {
      main.prepend(newStrip);
    }

    STATE.rendered = true;
    console.log(`[Instagzam] Mounted strip with ${items.length} bubbles`);
  }

  // ─── 11. Anti-Doomscroll Reels Lock ────────────────────────────────────────

  let isTouchInsideComments = false;
  let touchStartY = 0;
  let touchStartX = 0;

  function checkReelLock () {
    const onReel = isReelPage();
    if (onReel) {
      if (!document.body.classList.contains('igzam-reel-locked')) {
        document.body.classList.add('igzam-reel-locked');
      }

      const videos = document.querySelectorAll('video');
      videos.forEach(v => {
        if (!v.dataset.igzamLooped) {
          v.dataset.igzamLooped = 'true';
          v.loop = true;
          v.addEventListener('ended', () => {
            v.currentTime = 0;
            v.play().catch(() => {});
          });
        }
      });
    } else {
      if (document.body.classList.contains('igzam-reel-locked')) {
        document.body.classList.remove('igzam-reel-locked');
      }
    }
  }

  window.addEventListener('wheel', e => {
    if (!isReelPage()) return;
    const inComments = e.target.closest('[role="dialog"], [aria-label*="Comment"], [aria-label*="comment"], ul[class*="comment"]');
    if (inComments) return;

    if (Math.abs(e.deltaY) > 0) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { passive: false, capture: true });

  window.addEventListener('touchstart', e => {
    if (!isReelPage()) return;
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
    isTouchInsideComments = !!e.target.closest('[role="dialog"], [aria-label*="Comment"], [aria-label*="comment"], ul[class*="comment"]');
  }, { passive: true, capture: true });

  window.addEventListener('touchmove', e => {
    if (!isReelPage() || isTouchInsideComments) return;
    const touch = e.touches[0];
    const dy = Math.abs(touch.clientY - touchStartY);
    const dx = Math.abs(touch.clientX - touchStartX);

    if (dy > dx && dy > 6) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { passive: false, capture: true });

  window.addEventListener('keydown', e => {
    if (!isReelPage()) return;
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;

    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key)) {
      const inComments = e.target.closest('[role="dialog"], [aria-label*="Comment"]');
      if (!inComments) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, { capture: true });

  // ─── 12. Observers & Lifecycle ─────────────────────────────────────────────

  function startObserver () {
    const observer = new MutationObserver(() => {
      checkHomeRedirect();
      dismissAppPopups();
      checkReelLock();
      if (isDMsPage() && !document.getElementById('igzam-strip')) {
        renderStrip();
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function onNavigate () {
    checkHomeRedirect();
    dismissAppPopups();
    checkReelLock();

    if (isDMsPage()) {
      renderStrip();
      loadData();
    }
  }

  const _pushState = history.pushState;
  history.pushState = function (...a) { _pushState.apply(this, a); onNavigate(); };
  const _replaceState = history.replaceState;
  history.replaceState = function (...a) { _replaceState.apply(this, a); onNavigate(); };
  window.addEventListener('popstate', onNavigate);

  function boot () {
    checkHomeRedirect();
    startObserver();
    dismissAppPopups();
    checkReelLock();

    if (isDMsPage()) {
      renderStrip();
      loadData();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
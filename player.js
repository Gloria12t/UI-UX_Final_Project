/* ==============================
  CUSTOM CURSOR
============================== */

const cursorOptions = [
  { emoji: "🌸", label: "Sakura" },
  { emoji: "🐱", label: "Cat"    },
  { emoji: "👀", label: "Eyes"   },
  { emoji: "🍵", label: "Matcha" },
  { emoji: "⚡", label: "Bolt"   },
  { emoji: "👻", label: "Ghost"  },
  { emoji: "🤍", label: "Heart"  },
];

const cursorEl = document.createElement("div");
cursorEl.id = "custom-cursor";
document.body.appendChild(cursorEl);

const sparkleChars = ["✦", "✧", "⋆", "✿", "·"];

function setActiveCursor(emoji) {
  cursorEl.textContent = emoji;
  localStorage.setItem("lofi-cursor", emoji);
  document.querySelectorAll(".cursor-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.emoji === emoji);
  });
}

// build picker options
const cursorOptionsEl = document.getElementById("cursor-options");
cursorOptions.forEach(({ emoji, label }) => {
  const btn = document.createElement("div");
  btn.classList.add("cursor-option");
  btn.dataset.emoji = emoji;
  btn.textContent = emoji;
  btn.title = label;
  btn.addEventListener("click", () => setActiveCursor(emoji));
  cursorOptionsEl.appendChild(btn);
});

// restore saved cursor or default to sakura
const savedCursor = localStorage.getItem("lofi-cursor") || "🌸";
setActiveCursor(savedCursor);

// toggle picker open/close
const toggleCursorBtn = document.getElementById("toggle-cursor-picker");
toggleCursorBtn.addEventListener("click", () => {
  const isOpen = cursorOptionsEl.classList.toggle("open");
  toggleCursorBtn.classList.toggle("open", isOpen);
});

// mouse tracking + sparkle trail
document.addEventListener("mousemove", (e) => {
  cursorEl.style.left = e.clientX + "px";
  cursorEl.style.top  = e.clientY + "px";

  if (Math.random() < 0.25) {
    const s = document.createElement("div");
    s.classList.add("cursor-sparkle");
    s.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
    s.style.left  = (e.clientX + (Math.random() - 0.5) * 16) + "px";
    s.style.top   = (e.clientY + (Math.random() - 0.5) * 16) + "px";
    s.style.color = Math.random() > 0.5 ? "#00ff88" : "white";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 700);
  }
});

document.addEventListener("mouseleave", () => { cursorEl.style.opacity = "0"; });
document.addEventListener("mouseenter", () => { cursorEl.style.opacity = "1"; });
document.addEventListener("mousedown", () => { cursorEl.style.animationDuration = "0.6s"; });
document.addEventListener("mouseup",   () => { cursorEl.style.animationDuration = "6s";   });

let player;

// hide-ui-mode
let hideModeEnabled = false;
let inactivityTimer = null;
const INACTIVITY_DELAY = 15000;
let fadeInterval = null;

// playlist
const playlist = [
  "AZals4U6Z_I",
  "QA9FpizKFeU",
  "WRhH-0rL5hw",

  "HGl75kurxok",
  "9kzE8isXlQY",
  "gGOpElxqlQw",

  "lTRiuFIWV54",
  "UJs6__K7gSY",
  "AAbK---4bB4",

  "iYesXBFWtls",
  "Rik8YhvH09M",
  "lrE8fWHHyW4",

  "iYesXBFWtls",
  "I140iNpx1xM",
  "wshfwlnT1lc",

  "4VXErA63_eg",
  "CzVNX_fErcE",
  "bXABghLhGGQ",

  "JdqL89ZZwFw",
  "ivdPyFUPbAk",
  "sF80I-TQiW0",

  "1fueZCTYkpA",
  "zhDwjnYZiCo",

];

// gif list
const gifs = [
  "gif/gif1.gif",
  "gif/gif2.gif",
  "gif/gif3.gif",
  "gif/gif4.gif",
  "gif/gif5.gif",
  "gif/gif6.gif",
  "gif/gif7.gif",
  "gif/gif8.gif",
  "gif/gif9.gif",
  "gif/gif10.gif",
  "gif/gif11.gif",
  "gif/gif12.gif",
  "gif/gif13.gif",
  "gif/gif14.gif",
  "gif/gif15.gif",
  "gif/gif16.gif",
  "gif/gif17.gif",
  "gif/gif18.gif",
  "gif/gif19.gif",
  "gif/gif20.gif",
  "gif/gif21.gif",
  "gif/gif22.gif",
  "gif/gif23.gif",
];

let currentIndex = 0;
let gifIndex = 0;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: '0',
    width: '0',
    videoId: playlist[currentIndex],
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerReady() {
  updateVolume();
  player.playVideo();
  updateSongTitle();
  updateBackground();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    setTimeout(updateSongTitle, 300);
    updatePlayPauseButton(true);
  }
  if (event.data === YT.PlayerState.PAUSED) {
    updatePlayPauseButton(false);
  }
  if (event.data === YT.PlayerState.ENDED) {
    playNextSong();
  }
}

// ── Custom playlist state (in-memory, resets on close/refresh) ──
let playlistMode = "default";           // "default" or "custom"
const customPlaylist = [];              // array of { id, title }
let customIndex = 0;

function activeList() {
  return playlistMode === "custom" ? customPlaylist.map(t => t.id) : playlist;
}

function activeIndexRef() {
  return playlistMode === "custom" ? "custom" : "default";
}

function getActiveIndex() {
  return playlistMode === "custom" ? customIndex : currentIndex;
}

function setActiveIndex(idx) {
  if (playlistMode === "custom") customIndex = idx;
  else currentIndex = idx;
}

function randomIndex() {
  const list = activeList();
  const cur = getActiveIndex();
  let idx;
  do { idx = Math.floor(Math.random() * list.length); }
  while (idx === cur && list.length > 1);
  return idx;
}

function playNextSong() {
  const list = activeList();
  if (list.length === 0) return;
  setActiveIndex((getActiveIndex() + 1) % list.length);
  player.loadVideoById(list[getActiveIndex()]);
  if (playlistMode === "default") updateBackground();
  else cycleRandomGif();
}

function updateBackground() {
  const img = document.getElementById("background-gif");
  if (!img) return;
  img.src = gifs[gifIndex];  // ← was gifs[currentIndex]
}

function cycleRandomGif() {
  const img = document.getElementById("background-gif");
  if (!img) return;
  const currentSrc = img.getAttribute("src");
  let pick;
  do { pick = gifs[Math.floor(Math.random() * gifs.length)]; }
  while (pick === currentSrc && gifs.length > 1);
  img.src = pick;
}

function togglePlayPause() {
  if (!player) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function updatePlayPauseButton(isPlaying) {
  const btn = document.getElementById("play-pause");
  if (!btn) return;
  btn.innerText = isPlaying ? "⏸" : "▶";
}

function previous() {
  if (!player) return;
  const list = activeList();
  if (list.length === 0) return;
  setActiveIndex((getActiveIndex() - 1 + list.length) % list.length);
  player.loadVideoById(list[getActiveIndex()]);
  if (playlistMode === "default") updateBackground();
  else cycleRandomGif();
}

function next() {
  if (!player) return;
  const list = activeList();
  if (list.length === 0) return;
  setActiveIndex((getActiveIndex() + 1) % list.length);
  player.loadVideoById(list[getActiveIndex()]);
  if (playlistMode === "default") updateBackground();
  else cycleRandomGif();
}

function updateSongTitle() {
  const data = player.getVideoData();
  const titleEl = document.getElementById("song-title");
  if (!data || !data.title) return;

  const span = titleEl.querySelector("span");
  span.classList.remove("scrolling");
  span.textContent = data.title;

  if (span.scrollWidth > titleEl.clientWidth) {
    const separator = "   •   ";
    span.textContent = data.title + separator + data.title + separator;
    const duration = span.scrollWidth / 2 / 80;
    span.style.animationDuration = `${duration}s`;
    span.classList.add("scrolling");
  }
}

// button event listeners
document.getElementById("play-pause").addEventListener("click", togglePlayPause);
document.getElementById("prev").addEventListener("click", previous);
document.getElementById("next").addEventListener("click", next);

document.body.addEventListener('click', function(event) {
  if (
    event.target.tagName === 'BUTTON' ||
    event.target.tagName === 'INPUT' ||
    event.target.closest('.controls') ||
    event.target.closest('.picker-card') ||
    event.target.closest('#bottom-center-controls') ||
    event.target.closest('#top-right-controls') ||
    event.target.closest('#pomodoro-card') ||
    event.target.closest('#ambient-panel')
  ) return;
  togglePlayPause();
});

addEventListener('keydown', function(event) {
  if (event.code === 'Space') {
    event.preventDefault();
    togglePlayPause();
  }
  if (event.code === 'ArrowRight') {
    event.preventDefault();
    next();
  }
  if (event.code === 'ArrowLeft') {
    event.preventDefault();
    previous();
  }
  if (event.code === 'KeyM') {
    event.preventDefault();
    if (!player) return;
    const currentVolume = player.getVolume();
    player.setVolume(currentVolume > 0 ? 0 : 100);
  }
  if (event.code === 'KeyF') {
    event.preventDefault();
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  }
  if (event.code === 'KeyS') {
    event.preventDefault();
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }
  if (event.code === 'KeyH') {
    event.preventDefault();
    toggleUI();
  }
});

function toggleUI() {
  const els = [
    document.querySelector('.app'),
    document.querySelector('#top-right-controls'),
    document.querySelector('#ambient-panel'),
    document.querySelector('#weather-widget'),
    document.querySelector('#bottom-center-controls'),
    document.querySelector('#pomodoro-card'),
  ];
  els.forEach(el => {
    if (el) el.classList.toggle('hidden');
  });
}
/* ==============================
  HIDE UI MODE
============================== */

const hideableIds = [
  "ui-layer",
  "ambient-panel",
  "bottom-center-controls",
  "top-right-controls",
  "pomodoro-card",
];

function hideUI() {
  if (!hideModeEnabled) return;
  hideableIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden-ui");
  });
}

function showUI() {
  hideableIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("hidden-ui");
  });
}

function resetInactivityTimer() {
  if (!hideModeEnabled) return;
  clearTimeout(inactivityTimer);
  showUI();
  inactivityTimer = setTimeout(hideUI, INACTIVITY_DELAY);
}

["mousemove", "keydown", "click"].forEach(eventType => {
  document.addEventListener(eventType, resetInactivityTimer);
});

const toggleBtn = document.getElementById("toggle-hide-ui");
toggleBtn.addEventListener("click", () => {
  hideModeEnabled = !hideModeEnabled;
  toggleBtn.innerText = hideModeEnabled ? "◑" : "◐";
  const dimmer = document.getElementById("dimmer");

  if (hideModeEnabled) {
    resetInactivityTimer();
    dimmer.style.opacity = 0.7;
    previousVolumeLevel = currentVolumeLevel;
    fadeToVolume(1);
    updateVolume();
  } else {
    showUI();
    clearTimeout(inactivityTimer);
    dimmer.style.opacity = 0.3;
    fadeToVolume(previousVolumeLevel);
    updateVolume();
  }
});

/* ==============================
  VOLUME LOGIC
============================== */

const volumeBarsContainer = document.getElementById("volume-bars");
const muteBtn = document.getElementById("mute-btn");

const TOTAL_BARS = 10;
let currentVolumeLevel = 5;
let previousVolumeLevel = 5;

for (let i = 0; i < TOTAL_BARS; i++) {
  const bar = document.createElement("div");
  bar.classList.add("volume-bar");
  bar.addEventListener("click", () => {
    if (fadeInterval) { clearInterval(fadeInterval); fadeInterval = null; }
    currentVolumeLevel = i + 1;
    updateVolume();
  });
  volumeBarsContainer.appendChild(bar);
}

function updateVolume() {
  if (!player) return;
  const volume = (currentVolumeLevel / TOTAL_BARS) * 100;
  player.setVolume(volume);
  const bars = document.querySelectorAll(".volume-bar");
  bars.forEach((bar, index) => {
    bar.classList.toggle("active", index < currentVolumeLevel);
  });
  muteBtn.textContent = volume === 0 ? "×" : "≡";
}

muteBtn.addEventListener("click", () => {
  if (!player) return;
  if (fadeInterval) { clearInterval(fadeInterval); fadeInterval = null; }
  currentVolumeLevel = currentVolumeLevel === 0 ? 5 : 0;
  updateVolume();
});

function animateBars() {
  const bars = document.querySelectorAll(".volume-bar");
  bars.forEach((bar) => {
    const scale = Math.random() * 1.5 + 0.3;
    bar.style.transform = `scaleY(${scale})`;
  });
}
setInterval(animateBars, 150);

/* ==============================
  ENCOURAGEMENT TYPEWRITER
============================== */

const encouragements = [
  "Hey, you're doing great! Keep going...",
  "One step at a time. You've got this.",
  "Keep working, keep trying. You'll get there!",
  "Small progress is still progress.",
  "Take a deep breath. You're doing amazing.",
  "Believe in yourself. The best is yet to come.",
  "Stay focused. Your hard work will pay off.",
  "Proud of you for showing up today.",
  "It's okay to rest. Then keep going.",
  "You are capable of more than you know.",
];

let encIndex = 0;
let encChar = 0;
let encDeleting = false;

function typeEncouragement() {
  const el  = document.getElementById("encouragement-text");
  const msg = encouragements[encIndex];

  if (!encDeleting) {
    el.textContent = msg.slice(0, encChar + 1);
    encChar++;
    if (encChar === msg.length) {
      encDeleting = true;
      setTimeout(typeEncouragement, 3800);
      return;
    }
    setTimeout(typeEncouragement, 65);
  } else {
    el.textContent = msg.slice(0, encChar - 1);
    encChar--;
    if (encChar === 0) {
      encDeleting = false;
      encIndex = (encIndex + 1) % encouragements.length;
      setTimeout(typeEncouragement, 400);
      return;
    }
    setTimeout(typeEncouragement, 28);
  }
}
typeEncouragement();

/* ==============================
  WEATHER WIDGET
============================== */

function weatherIcon(code) {
  if (code === 113) return "☀️";
  if (code === 116) return "⛅";
  if (code === 119 || code === 122) return "☁️";
  if (code === 143 || code === 248 || code === 260) return "🌫️";
  if (code >= 263 && code <= 281) return "🌦️";
  if (code >= 293 && code <= 321) return "🌧️";
  if (code >= 323 && code <= 377) return "🌨️";
  if (code >= 386 && code <= 395) return "⛈️";
  return "🌡️";
}

function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  document.getElementById("weather-time").textContent = timeStr;
  document.getElementById("weather-date").textContent = dateStr;
}
updateClock();
setInterval(updateClock, 1000);

async function fetchWeather() {
  try {
    const res  = await fetch("https://wttr.in/?format=j1");
    const data = await res.json();
    const condition = data.current_condition[0];
    const area = data.nearest_area[0];
    const city    = area.areaName[0].value;
    const country = area.country[0].value;
    const tempC   = condition.temp_C;
    const tempF   = condition.temp_F;
    const code    = parseInt(condition.weatherCode);
    document.getElementById("weather-location").textContent = `${city}, ${country}`;
    document.getElementById("weather-icon").textContent     = weatherIcon(code);
    document.getElementById("weather-temp").textContent     = `${tempC}°C / ${tempF}°F`;
  } catch (e) {
    // silently fail — weather is decorative
  }
}
fetchWeather();
setInterval(fetchWeather, 10 * 60 * 1000);

function fadeToVolume(targetLevel) {
  if (fadeInterval) clearInterval(fadeInterval);
  const step = targetLevel > currentVolumeLevel ? 1 : -1;
  fadeInterval = setInterval(() => {
    if (currentVolumeLevel === targetLevel) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    } else {
      currentVolumeLevel += step;
      updateVolume();
    }
  }, 5000);
}

/* ==============================
  AMBIENT SOUNDS
  Files expected in ambient-sounds/ folder:
  rain.mp3 · waves.mp3 · birds.mp3 · campfire.mp3 · cafe.mp3
============================== */

const ambientSources = {
  rain:     "ambient-sounds/rain.mp3",
  waves:    "ambient-sounds/waves.mp3",
  birds:    "ambient-sounds/birds.mp3",
  campfire: "ambient-sounds/campfire.mp3",
  cafe:     "ambient-sounds/cafe.mp3",
};

const ambientAudios = {};

Object.entries(ambientSources).forEach(([key, src]) => {
  const audio = new Audio(src);
  audio.loop   = true;
  audio.volume = 0;
  ambientAudios[key] = audio;
});

function setSliderFill(slider) {
  const pct = (slider.value / slider.max) * 100;
  slider.style.background =
    `linear-gradient(to right, #00ff88 ${pct}%, rgba(0,255,136,0.15) ${pct}%)`;
}

// initialise all sliders at 0
document.querySelectorAll(".ambient-slider").forEach(slider => setSliderFill(slider));

// slider input → set volume + fill
document.querySelectorAll(".ambient-slider").forEach(slider => {
  const sound = slider.dataset.sound;

  slider.addEventListener("input", () => {
    const vol   = slider.value / 100;
    const audio = ambientAudios[sound];
    audio.volume = vol;
    setSliderFill(slider);

    if (vol > 0 && audio.paused) {
      audio.play().catch(() => {});
    } else if (vol === 0) {
      audio.pause();
    }
  });
});

/* ==============================
  GIF & PLAYLIST PICKER
============================== */

const playlistLabels = [
  
 "chill / relax / study music | studio ghibli lo-fi jazz mix",
  "Paris Cafe French Instrumental Music — Coffee Playlist | Guitar, Piano & Accordion",
  "Ghibili & Lofi| Relaxing Studio Ghibli Lo-Fi Music Playlist",

  "Piano Ghibli Collection",
  "Less talk.... more action. / Lo-fi for study, work ( with Rain sounds)",
  "High-Energy Lofi Hip Hop Beats for a Powerful Workout",

  "1 A.M Study Session [lofi hip hop]",
  "Bedtime Lofi 8 hours of relaxing beats to sleep to",
  "Matcha Cafe Relaxing Vintage Jazz for Studying & Reading | Animal Crossing Ambience",

  "nostalgic minecraft music for sleeping or studying...",
  "Cozy Fireplace Ambiance & Lofi Music | Relaxing Study and Chill",
  "winter _____ . | peaceful acoustic",

  "nostalgic minecraft music for sleeping or studying...",
  "Lofi HipHop Mix Happy and Uplifting Beats for a Beautiful Day",
  "Action is the foundational key. Deep Focus | Jazz LoFi for Productivity",

  "Interstellar - Hans Zimmer (Soft Version) Sleep, Study, Relax - 1 Hour",
  "Coldplay - Soft Piano [sleep, study, relax, calm, chill, no mid-roll ads, instrumental]",
  "Ed Sheeran - Soft Piano [sleep, study, relax, calm, chill, no mid-roll ads, instrumental]",

  "Quiet  Lofi Keep You Safe  Serenity to Deep focus work, relax [ Lofi hip hop - Lofi Summer ]",
  "4 Hours Deep Focus | 50/10 Pomodoro (Lofi Study and Work)",
  "90's Chill Lofi Study Music Lofi Rain Chillhop Beats Lofi Rain Playlist",

  "Morning Coffee  [lofi hip hop]",
  "Ghibli Coffee Shop Music to put you in a better mood  lofi hip hop - lofi songs | study / relax",

];

const gifPickerCard      = document.getElementById("gif-picker-card");
const playlistPickerCard = document.getElementById("playlist-picker-card");
const openGifBtn         = document.getElementById("open-gif-picker");
const openPlaylistBtn    = document.getElementById("open-playlist-picker");

function openCard(card, btn) {
  // close all cards first
  document.querySelectorAll(".picker-card").forEach(c => c.classList.add("hidden-card"));
  document.querySelectorAll(".bottom-icon-btn").forEach(b => b.classList.remove("active"));
  card.classList.remove("hidden-card");
  btn.classList.add("active");
}

function closeCard(card, btn) {
  card.classList.add("hidden-card");
  if (btn) btn.classList.remove("active");
}

// ── Build GIF grid ──
const gifGrid = document.getElementById("gif-grid");
gifs.forEach((src, i) => {
  const el = document.createElement("div");
  el.classList.add("gif-option");
  if (i === currentIndex) el.classList.add("active");
  el.innerHTML = `<img src="${src}" loading="lazy" /><span class="gif-active-badge">▶</span>`;
  el.addEventListener("click", () => {
    gifIndex = i;
    updateBackground();
    syncPickerStates();
  });
  gifGrid.appendChild(el);
});

// ── Build Playlist list ──
const playlistList = document.getElementById("playlist-list");
playlist.forEach((id, i) => {
  const el = document.createElement("div");
  el.classList.add("playlist-option");
  if (i === currentIndex) el.classList.add("active");
  el.innerHTML = `
    <span class="playlist-num">${String(i + 1).padStart(2, "0")}</span>
    <span class="playlist-name">${playlistLabels[i] || id}</span>
    <span class="playlist-playing-icon">▶</span>
  `;
  el.addEventListener("click", () => {
    playlistMode = "default";
    currentIndex = i;
    if (player) player.loadVideoById(playlist[currentIndex]);
    updateBackground();
    syncPickerStates();
    closeCard(playlistPickerCard, openPlaylistBtn);
  });
  playlistList.appendChild(el);
});

// keep both pickers in sync whenever the track changes
function syncPickerStates() {
  document.querySelectorAll(".gif-option").forEach((el, i) =>
    el.classList.toggle("active", i === gifIndex));
  document.querySelectorAll("#playlist-list .playlist-option").forEach((el, i) =>
    el.classList.toggle("active", playlistMode === "default" && i === currentIndex));
  document.querySelectorAll("#custom-playlist-list .playlist-option").forEach((el, i) =>
    el.classList.toggle("active", playlistMode === "custom" && i === customIndex));
}

// patch updateBackground so prev/next also syncs picker state
const _origUpdateBg = updateBackground;
updateBackground = function() {
  _origUpdateBg();
  syncPickerStates();
};

// ── Button listeners ──
openGifBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  gifPickerCard.classList.contains("hidden-card")
    ? openCard(gifPickerCard, openGifBtn)
    : closeCard(gifPickerCard, openGifBtn);
});

openPlaylistBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  playlistPickerCard.classList.contains("hidden-card")
    ? openCard(playlistPickerCard, openPlaylistBtn)
    : closeCard(playlistPickerCard, openPlaylistBtn);
});

// close-button (✕) on each card
document.querySelectorAll(".picker-card-close").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const card  = btn.closest(".picker-card");
    const isGif = card.id === "gif-picker-card";
    closeCard(card, isGif ? openGifBtn : openPlaylistBtn);
  });
});

// click outside closes both cards
document.addEventListener("click", (e) => {
  if (!e.target.closest(".picker-card") && !e.target.closest(".bottom-icon-btn")) {
    closeCard(gifPickerCard, openGifBtn);
    closeCard(playlistPickerCard, openPlaylistBtn);
  }
});

/* ==============================
  CUSTOM PLAYLIST (session-only)
============================== */

const customListEl  = document.getElementById("custom-playlist-list");
const customInput   = document.getElementById("custom-url-input");
const customAddBtn  = document.getElementById("custom-add-btn");
const emptyStateEl  = document.getElementById("custom-empty-state");

function extractYouTubeId(url) {
  const regex = /(?:youtube\.com\/(?:.*[?&]v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function fetchVideoTitle(id) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    if (!res.ok) return id;
    const data = await res.json();
    return data.title || id;
  } catch {
    return id;
  }
}

function renderCustomList() {
  // remove all existing track rows
  customListEl.querySelectorAll(".playlist-option").forEach(el => el.remove());

  if (customPlaylist.length === 0) {
    emptyStateEl.style.display = "";
    return;
  }
  emptyStateEl.style.display = "none";

  customPlaylist.forEach((track, i) => {
    const el = document.createElement("div");
    el.classList.add("playlist-option");
    if (playlistMode === "custom" && i === customIndex) el.classList.add("active");
    el.innerHTML = `
      <span class="playlist-num">${String(i + 1).padStart(2, "0")}</span>
      <span class="playlist-name">${track.title}</span>
      <span class="playlist-playing-icon">▶</span>
      <button class="playlist-remove" title="Remove">✕</button>
    `;
    el.addEventListener("click", (e) => {
      if (e.target.classList.contains("playlist-remove")) {
        e.stopPropagation();
        removeCustomTrack(i);
        return;
      }
      playlistMode = "custom";
      customIndex = i;
      if (player) player.loadVideoById(track.id);
      cycleRandomGif();
      syncPickerStates();
      closeCard(playlistPickerCard, openPlaylistBtn);
    });
    customListEl.appendChild(el);
  });
}

async function addCustomTrack(url) {
  const id = extractYouTubeId(url.trim());
  if (!id) {
    customInput.classList.add("invalid");
    setTimeout(() => customInput.classList.remove("invalid"), 700);
    return;
  }
  customInput.value = "";
  // optimistic placeholder while we fetch the title
  const track = { id, title: "Loading..." };
  customPlaylist.push(track);
  renderCustomList();

  track.title = await fetchVideoTitle(id);
  renderCustomList();
}

function removeCustomTrack(i) {
  customPlaylist.splice(i, 1);

  // keep customIndex sensible
  if (playlistMode === "custom") {
    if (customIndex === i) {
      // the currently playing custom track was removed
      customIndex = Math.min(customIndex, customPlaylist.length - 1);
    } else if (customIndex > i) {
      customIndex--;
    }
  }
  renderCustomList();
}

customAddBtn.addEventListener("click", () => addCustomTrack(customInput.value));
customInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addCustomTrack(customInput.value);
});

// ── Tab switching ──
document.querySelectorAll(".playlist-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const mode = tab.dataset.mode;
    document.querySelectorAll(".playlist-tab").forEach(t =>
      t.classList.toggle("active", t === tab));
    document.querySelectorAll(".playlist-mode-list").forEach(list =>
      list.classList.toggle("hidden-mode", list.dataset.mode !== mode));
  });
});

renderCustomList();

/* ==============================
  POMODORO TIMER
============================== */

let pomSeconds  = 25 * 60;
let pomRunning  = false;
let pomInterval = null;

const pomDisplay   = document.getElementById("pomodoro-display");
const pomCard      = document.getElementById("pomodoro-card");
const pomToggleBtn = document.getElementById("toggle-pomodoro");

function pomRender() {
  const m = Math.floor(pomSeconds / 60);
  const s = pomSeconds % 60;
  pomDisplay.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  // turn red in the last 60 seconds
  pomDisplay.classList.toggle("pom-ending", pomSeconds <= 60 && pomRunning);
}

function pomStart() {
  if (pomRunning) return;
  pomRunning = true;
  document.getElementById("pom-start").classList.add("pom-active");
  pomInterval = setInterval(() => {
    if (pomSeconds > 0) {
      pomSeconds--;
      pomRender();
    } else {
      clearInterval(pomInterval);
      pomRunning = false;
      document.getElementById("pom-start").classList.remove("pom-active");
      pomDisplay.classList.remove("pom-ending");
    }
  }, 1000);
}

function pomPause() {
  clearInterval(pomInterval);
  pomRunning = false;
  document.getElementById("pom-start").classList.remove("pom-active");
  pomDisplay.classList.remove("pom-ending");
}

function pomStop() {
  clearInterval(pomInterval);
  pomRunning  = false;
  pomSeconds  = 25 * 60;
  document.getElementById("pom-start").classList.remove("pom-active");
  pomDisplay.classList.remove("pom-ending");
  pomRender();
}

function pomAdd5() {
  pomSeconds += 5 * 60;
  pomRender();
}

// toggle card open/close
pomToggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isHidden = pomCard.classList.toggle("hidden-pomodoro");
  pomToggleBtn.classList.toggle("active", !isHidden);
});

// close when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest("#pomodoro-card") && !e.target.closest("#toggle-pomodoro")) {
    pomCard.classList.add("hidden-pomodoro");
    pomToggleBtn.classList.remove("active");
  }
});

document.getElementById("pom-start").addEventListener("click", pomStart);
document.getElementById("pom-pause").addEventListener("click", pomPause);
document.getElementById("pom-stop").addEventListener("click",  pomStop);
document.getElementById("pom-add5").addEventListener("click",  pomAdd5);

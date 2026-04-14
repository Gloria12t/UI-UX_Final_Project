/* ==============================
  CUSTOM CURSOR
============================== */

const cursorOptions = [
  { emoji: "🌸", label: "Sakura" },
  { emoji: "🐱", label: "Cat"    },
  { emoji: "🎵", label: "Music"  },
  { emoji: "🌙", label: "Moon"   },
  { emoji: "🍵", label: "Matcha" },
  { emoji: "⭐", label: "Star"   },
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
const INACTIVITY_DELAY = 15000; // delay for 15 seconds
let fadeInterval = null;

// playlist 
// using ID of video on youtube
const playlist = [
  "AZals4U6Z_I",
  "yVPvYq4CNV4",
  "WRhH-0rL5hw",
  "HGl75kurxok",
  "9kzE8isXlQY",
  "gGOpElxqlQw",
];

// gif list
const gifs = [
  "gif/gif1.gif",
  "gif/gif2.gif",
  "gif/gif3.gif",
  "gif/gif4.gif",
  "gif/gif5.gif",
  "gif/gif6.gif"
];

let currentIndex = 0;

// this function create a Player objects.
// Will be excuted as soon as player API code downloads
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

// called when the player is ready
function onPlayerReady() {
  updateVolume();

  player.playVideo();
  updateSongTitle();
  updateBackground();
}

// loop playlist upon the end, update song's name
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        setTimeout(updateSongTitle, 300);
        updatePlayPauseButton(true); // Update button to show pause icon
    }
    if (event.data === YT.PlayerState.PAUSED) {
        updatePlayPauseButton(false); // Update button to show play icon
    }
    if (event.data === YT.PlayerState.ENDED) {
        playNextSong();
    }    
}
 
let shuffleEnabled = false;

function randomIndex() {
  let idx;
  do { idx = Math.floor(Math.random() * playlist.length); }
  while (idx === currentIndex && playlist.length > 1);
  return idx;
}

function playNextSong() {
  currentIndex = shuffleEnabled ? randomIndex() : (currentIndex + 1) % playlist.length;
  player.loadVideoById(playlist[currentIndex]);
  updateBackground();
}

// update background
function updateBackground() {
  var img = document.getElementById("background-gif");
  if (!img) return;

  img.src = gifs[currentIndex]
}

// toggle play/pause
function togglePlayPause() {
  if (!player) return;
  
  const state = player.getPlayerState();
  
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

// update play/pause button icon
function updatePlayPauseButton(isPlaying) {
  const btn = document.getElementById("play-pause");
  if (!btn) return;
  
  btn.innerText = isPlaying ? "⏸" : "▶";
}


// prev button
function previous() {
    if (!player) return;
    
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length; // wrap around playlist
    player.loadVideoById(playlist[currentIndex]);
    updateBackground();
}

// next button
function next() {
  if (!player) return;

  currentIndex = shuffleEnabled ? randomIndex() : (currentIndex + 1) % playlist.length;
  player.loadVideoById(playlist[currentIndex]);
  updateBackground();
}

// Update song title
function updateSongTitle() {
  const data = player.getVideoData();
  const titleEl = document.getElementById("song-title");
  if (!data || !data.title) return;

  const span = titleEl.querySelector("span");
  span.classList.remove("scrolling");
  span.textContent = data.title;

  // if text overflows, duplicate it for a seamless loop
  if (span.scrollWidth > titleEl.clientWidth) {
    const separator = "   •   ";
    span.textContent = data.title + separator + data.title + separator;
    // speed: ~80px/s so longer titles don't drag
    const duration = span.scrollWidth / 2 / 80;
    span.style.animationDuration = `${duration}s`;
    span.classList.add("scrolling");
  }
}

// button event listeners
document.getElementById("play-pause").addEventListener("click", togglePlayPause);
document.getElementById("prev").addEventListener("click", previous);
document.getElementById("next").addEventListener("click", next);
document.getElementById("shuffle").addEventListener("click", () => {
  shuffleEnabled = !shuffleEnabled;
  document.getElementById("shuffle").style.textShadow = shuffleEnabled ? "0 0 6px #00ff88" : "";
  document.getElementById("shuffle").style.color = shuffleEnabled ? "#00ff88" : "";
});
document.body.addEventListener('click', function(event) {
  // Don't toggle if clicking on buttons or controls
  if (event.target.tagName === 'BUTTON' || 
      event.target.closest('.controls')) {
    return;
  }
  togglePlayPause();
});

addEventListener('keydown', function(event) {
  if (event.code === 'Space') {
    event.preventDefault(); // Prevent default spacebar behavior (scrolling)
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
    player.setVolume(currentVolume > 0 ? 0 : 100); // Toggle mute/unmute
  }
  if (event.code === 'KeyF') {
    event.preventDefault();
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
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
  const app = document.querySelector('.app');
  app.classList.toggle('hidden');
}

/* ==============================
  HIDE UI MODE
============================== */

// function to hide UI in night-mode
function hideUI() {
  if (!hideModeEnabled) return;

  const ui = document.getElementById("ui-layer");
  ui.classList.add("hidden-ui");
}

// function to show UI in day-mode
function showUI() {
  const ui = document.getElementById("ui-layer");
  ui.classList.remove("hidden-ui");
}

// function to reset inactivity timer
function resetInactivityTimer() {
  if (!hideModeEnabled) return;

  clearTimeout(inactivityTimer);
  showUI();

  inactivityTimer = setTimeout(hideUI, INACTIVITY_DELAY);
}

// detect user activity
["mousemove", "keydown", "click"].forEach(eventType => {
  document.addEventListener(eventType, resetInactivityTimer);
});

// toggle hide-ui button on/off
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
let currentVolumeLevel = 5; // default
let previousVolumeLevel = 5;

//create bars
for (let i = 0; i < TOTAL_BARS ; i++) {
  const bar =document.createElement("div");
  bar.classList.add("volume-bar");

  bar.addEventListener("click", () => {
    if (fadeInterval) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }

    currentVolumeLevel = i + 1;
    updateVolume();
  });

  volumeBarsContainer.appendChild(bar);
}

// volume change 
function updateVolume() {
  if (!player) return;

  const volume = (currentVolumeLevel / TOTAL_BARS) * 100;
  player.setVolume(volume);

  // update UI
  const bars = document.querySelectorAll(".volume-bar");
  bars.forEach((bar, index) => {
    bar.classList.toggle("active", index < currentVolumeLevel);
  });

  muteBtn.textContent = volume === 0 ? "×" : "≡";
}

// mute button
muteBtn.addEventListener("click", () => {
  if (!player) return;

  if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }

  if (currentVolumeLevel === 0) {
    currentVolumeLevel = 5;
  } else {
    currentVolumeLevel = 0;
  }
  updateVolume();
});

// dancing volume bars
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
let encChar  = 0;
let encDeleting = false;

function typeEncouragement() {
  const el   = document.getElementById("encouragement-text");
  const msg  = encouragements[encIndex];

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
    const res = await fetch("https://wttr.in/?format=j1");
    const data = await res.json();

    const condition = data.current_condition[0];
    const area = data.nearest_area[0];

    const city = area.areaName[0].value;
    const country = area.country[0].value;
    const tempC = condition.temp_C;
    const tempF = condition.temp_F;
    const code = parseInt(condition.weatherCode);
    const desc = weatherIcon(code);

    document.getElementById("weather-location").textContent = `${city}, ${country}`;
    document.getElementById("weather-icon").textContent = desc;
    document.getElementById("weather-temp").textContent = `${tempC}°C / ${tempF}°F`;
  } catch (e) {
    // silently fail — weather is decorative
  }
}

fetchWeather();
setInterval(fetchWeather, 10 * 60 * 1000); // refresh every 10 minutes

// reduce volume gradually in night mode
function fadeToVolume(targetLevel) {
  if (fadeInterval) {
    clearInterval(fadeInterval);
  }
  const step = targetLevel > currentVolumeLevel ? 1 : -1;

  fadeInterval = setInterval(() => {
    if (currentVolumeLevel === targetLevel) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    } else {
      currentVolumeLevel += step;
      updateVolume();
    }
  }, 5000); // volume reduce 1 level after every 5s
}
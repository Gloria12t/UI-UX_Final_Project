let player;

// hide-ui-mode
let hideModeEnabled = false;
let inactivityTimer = null;
const INACTIVITY_DELAY = 5000; // delay for 5 seconds

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
  player.setVolume(50);   // set volume level to 50 as default
  currentVolumeLevel = 5;
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
 
function playNextSong() {
    currentIndex = (currentIndex+1) % playlist.length;
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

    currentIndex = (currentIndex + 1) % playlist.length;
    player.loadVideoById(playlist[currentIndex]);
    updateBackground();
}

// Update song title
function updateSongTitle() {
  const data = player.getVideoData();
  const titleEl = document.getElementById("song-title");

  if (data && data.title) {
    titleEl.innerText = data.title;
  }
}

// button event listeners
document.getElementById("play-pause").addEventListener("click", togglePlayPause);
document.getElementById("prev").addEventListener("click", previous);
document.getElementById("next").addEventListener("click", next);
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
  if (hideModeEnabled) {
    resetInactivityTimer();
  } else {
    showUI();
    clearTimeout(inactivityTimer);
  }
});

/* ==============================
  VOLUME LOGIC
============================== */

const volumeBarsContainer = document.getElementById("volume-bars");
const muteBtn = document.getElementById("mute-btn");

const TOTAL_BARS = 10;
let currentVolumeLevel = 5; // default

//create bars
for (let i = 0; i < TOTAL_BARS ; i++) {
  const bar =document.createElement("div");
  bar.classList.add("volume-bar");

  bar.addEventListener("click", () => {
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

  if (currentVolumeLevel === 0) {
    currentVolumeLevel = 5;
  } else {
    currentVolumeLevel = 0;
  }
  updateVolume();
});


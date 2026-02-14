let player;

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
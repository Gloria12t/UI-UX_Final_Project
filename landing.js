/* custom cursor */
const cursorEl = document.createElement("div");
cursorEl.id = "custom-cursor";
cursorEl.textContent = localStorage.getItem("lofi-cursor") || "🌸";
document.body.appendChild(cursorEl);

const sparkleChars = ["✦", "✧", "⋆", "✿", "·"];

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

/* spacebar to enter */
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    window.location.href = "player.html";
  }
});

const taglines = [
  "your cozy corner for focus & relaxation.",
  "beats to study, work, and dream to.",
  "slow down. breathe. let the music play.",
  "a quiet place for a busy mind.",
];

let lineIndex = 0;
let charIndex = 0;
let deleting  = false;

function typeTagline() {
  const el  = document.getElementById("tagline-text");
  const msg = taglines[lineIndex];

  if (!deleting) {
    el.textContent = msg.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === msg.length) {
      deleting = true;
      setTimeout(typeTagline, 3200);
      return;
    }
    setTimeout(typeTagline, 60);
  } else {
    el.textContent = msg.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      deleting   = false;
      lineIndex  = (lineIndex + 1) % taglines.length;
      setTimeout(typeTagline, 400);
      return;
    }
    setTimeout(typeTagline, 25);
  }
}

typeTagline();

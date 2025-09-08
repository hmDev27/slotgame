const ROWS = 3,
  COLS = 3;
const SYMBOLS_COUNT = { A: 3, B: 6, C: 9, D: 12 };
const SYMBOLS_VALUES = { A: 30, B: 20, C: 5, D: 2 };
const SYMBOLS = ["A", "B", "C", "D"];

let balance = 0;

const depositInput = document.getElementById("deposit");
const startGameButton = document.getElementById("startGame");
const gameSection = document.querySelector(".game-section");
const balanceDisplay = document.getElementById("balanceDisplay");
const linesInput = document.getElementById("lines");
const betInput = document.getElementById("bet");
const spinButton = document.getElementById("spinButton");
const resetButton = document.getElementById("resetButton");
const winningsDisplay = document.getElementById("winningsDisplay");
const reelsDOM = [0, 1, 2].map((i) => document.getElementById("reel" + i));
const spinSound = document.getElementById("spinSound");
const winSound = document.getElementById("winSound");

// Start game
startGameButton.addEventListener("click", () => {
  const amt = parseFloat(depositInput.value);
  if (isNaN(amt) || amt <= 0) return alert("Enter a valid deposit amount!");
  balance = amt;
  balanceDisplay.textContent = `Balance: $${balance}`;
  gameSection.classList.remove("hidden");
});

// Reset
resetButton.addEventListener("click", () => {
  balance = 0;
  depositInput.value = "";
  linesInput.value = 1;
  betInput.value = 1;
  winningsDisplay.textContent = "";
  reelsDOM.forEach((r) => (r.innerHTML = ""));
  gameSection.classList.add("hidden");
});

// Spin
spinButton.addEventListener("click", () => {
  const lines = parseInt(linesInput.value);
  const bet = parseFloat(betInput.value);
  if (lines < 1 || lines > 3 || bet <= 0 || bet * lines > balance)
    return alert("Invalid bet or insufficient balance!");
  balance -= bet * lines;
  balanceDisplay.textContent = `Balance: $${balance}`;

  const reels = spinReels();
  spinSound.currentTime = 0;
  spinSound.loop = true;
  spinSound.play();

  reelsDOM.forEach((r, i) => {
    r.innerHTML = "";
    for (let j = 0; j < 20; j++) {
      const d = document.createElement("div");
      d.className = "symbol";
      d.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      r.appendChild(d);
    }
    for (let j = 0; j < ROWS; j++) {
      const d = document.createElement("div");
      d.className = "symbol";
      d.textContent = reels[i][j];
      r.appendChild(d);
    }
    const totalScroll = 60 * 20,
      duration = 1000 + i * 300,
      start = performance.now();
    (function animate(time) {
      const progress = Math.min((time - start) / duration, 1);
      r.scrollTop = progress * totalScroll;
      if (progress < 1) requestAnimationFrame(animate);
      else if (i === COLS - 1) {
        spinSound.pause();
        spinSound.currentTime = 0;
      }
    })(performance.now());
  });

  setTimeout(() => {
    let winnings = 0;
    for (let row = 0; row < lines; row++) {
      const first = reels[0][row];
      if (reels.every((c) => c[row] === first)) {
        winnings += bet * SYMBOLS_VALUES[first];
        for (let col = 0; col < COLS; col++) {
          const s = reelsDOM[col].querySelectorAll(".symbol");
          s[s.length - ROWS + row].classList.add("winning");
        }
      }
    }
    balance += winnings;
    balanceDisplay.textContent = `Balance: $${balance}`;
    winningsDisplay.textContent = `You won $${winnings}`;
    if (winnings > 0) {
      winSound.pause();
      winSound.currentTime = 0;
      winSound.play();
      setTimeout(() => winSound.pause(), 2500);
    }
    setTimeout(
      () =>
        document
          .querySelectorAll(".symbol.winning")
          .forEach((el) => el.classList.remove("winning")),
      2000
    );
    if (balance <= 0) alert("You ran out of money!");
  }, 1500);
});

function spinReels() {
  return Array.from({ length: COLS }, () => {
    const pool = [];
    for (const [s, c] of Object.entries(SYMBOLS_COUNT))
      for (let i = 0; i < c; i++) pool.push(s);
    return Array.from(
      { length: ROWS },
      () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
    );
  });
}

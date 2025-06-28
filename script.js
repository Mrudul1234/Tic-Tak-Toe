/* ----------  Tic Tac Toe  ----------- */

// ── DOM references ────────────────────
const startScreen       = document.getElementById("startScreen");
const sideScreen        = document.getElementById("sideScreen");
const gameScreen        = document.getElementById("gameScreen");
const board             = document.getElementById("board");
const statusDiv         = document.getElementById("status");
const playerLabel       = document.getElementById("playerLabel");
const playerSymbolEl    = document.getElementById("playerSymbol");
const computerSymbolEl  = document.getElementById("computerSymbol");
const playerScoreEl     = document.getElementById("playerScore");
const computerScoreEl   = document.getElementById("computerScore");
const scoreHistory      = document.getElementById("scoreHistory");
const reviewList        = document.getElementById("reviewList");
const winSound          = document.getElementById("winSound");
const loseSound         = document.getElementById("loseSound");

// ── dynamic “Play Again” button ───────
const playAgainBtn = document.createElement("button");
playAgainBtn.textContent = "Play Again";
playAgainBtn.className   = "control-btn";
playAgainBtn.style.display = "none";
playAgainBtn.onclick = () => {
  currentRound  = 1;
  roundResults  = [];
  playerScore   = 0;
  computerScore = 0;
  updateScores();
  statusDiv.textContent = `${playerName}'s turn...`;
  playAgainBtn.style.display = "none";
  resetGame();
};
gameScreen.appendChild(playAgainBtn);

// ── game-state variables ──────────────
let cells          = [];
let playerSymbol   = "X";
let computerSymbol = "O";
let gameActive     = true;
let playerScore    = 0;
let computerScore  = 0;
let playerName     = "You";
let currentRound   = 1;      // 5-round session
let roundResults   = [];     // 'player' | 'computer' | 'draw'

// ──────────────────────────────────────
//  Navigation
// ──────────────────────────────────────
function goToSideSelection() {
  const nameInput = document.getElementById("playerName").value.trim();
  if (nameInput) playerName = nameInput;
  startScreen.classList.add("hidden");
  sideScreen.classList.remove("hidden");
}

function goToStart() {
  location.reload();        // simplest reset
}

// ──────────────────────────────────────
//  Side selection
// ──────────────────────────────────────
function chooseSide(symbol) {
  playerSymbol   = symbol;
  computerSymbol = symbol === "X" ? "O" : "X";

  sideScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  playerSymbolEl.textContent   = playerSymbol;
  computerSymbolEl.textContent = computerSymbol;
  playerLabel.textContent      = playerName;

  resetGame();
}

// ──────────────────────────────────────
//  Board creation / reset
// ──────────────────────────────────────
function createBoard() {
  board.innerHTML = "";
  cells = [];

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className      = "cell";
    cell.dataset.index  = i;
    cell.addEventListener("click", () => handlePlayerMove(i));
    board.appendChild(cell);
    cells.push(cell);
  }
}

function resetGame() {
  createBoard();
  gameActive           = true;
  statusDiv.textContent = `${playerName}'s turn... (Round ${currentRound}/5)`;
}

// ──────────────────────────────────────
//  Player move
// ──────────────────────────────────────
function handlePlayerMove(index) {
  if (!gameActive || cells[index].textContent) return;

  cells[index].textContent = playerSymbol;

  if (checkWinner(playerSymbol)) {
    winSound.play();
    highlightWinner(playerSymbol);
    statusDiv.textContent = `${playerName} wins this round!`;
    playerScore++;
    updateScores();
    gameActive = false;
    endRound("player");
    return;
  }

  if (isDraw()) {
    statusDiv.textContent = "It's a draw!";
    gameActive = false;
    endRound("draw");
    return;
  }

  statusDiv.textContent = "Computer's turn...";
  setTimeout(computerMove, 500);
}

// ──────────────────────────────────────
//  Computer (minimax) move
// ──────────────────────────────────────
function computerMove() {
  const bestMove = findBestMove();
  cells[bestMove].textContent = computerSymbol;

  if (checkWinner(computerSymbol)) {
    loseSound.play();
    highlightWinner(computerSymbol);
    statusDiv.textContent = "Computer wins this round!";
    computerScore++;
    updateScores();
    gameActive = false;
    endRound("computer");
    return;
  }

  if (isDraw()) {
    statusDiv.textContent = "It's a draw!";
    gameActive = false;
    endRound("draw");
    return;
  }

  statusDiv.textContent = `${playerName}'s turn...`;
}

// ── minimax helpers ───────────────────
function findBestMove() {
  let bestScore = -Infinity;
  let move      = -1;

  for (let i = 0; i < 9; i++) {
    if (!cells[i].textContent) {
      cells[i].textContent = computerSymbol;
      const score = minimax(0, false);
      cells[i].textContent = "";
      if (score > bestScore) {
        bestScore = score;
        move      = i;
      }
    }
  }
  return move;
}

function minimax(depth, isMaximizing) {
  if (checkWinner(computerSymbol)) return  10 - depth;
  if (checkWinner(playerSymbol))   return depth - 10;
  if (isDraw())                    return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!cells[i].textContent) {
        cells[i].textContent = computerSymbol;
        const score = minimax(depth + 1, false);
        cells[i].textContent = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore =  Infinity;
    for (let i = 0; i < 9; i++) {
      if (!cells[i].textContent) {
        cells[i].textContent = playerSymbol;
        const score = minimax(depth + 1, true);
        cells[i].textContent = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// ──────────────────────────────────────
//  Win / draw checks
// ──────────────────────────────────────
function checkWinner(sym) {
  const combos = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return combos.some(c => c.every(i => cells[i].textContent === sym));
}

function highlightWinner(sym) {
  const combos = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  combos.forEach(combo => {
    if (combo.every(i => cells[i].textContent === sym)) {
      combo.forEach(i => {
        cells[i].classList.add(sym === computerSymbol ? "computer-winner" : "winner");
      });
    }
  });
}

const isDraw = () => cells.every(c => c.textContent);

// ──────────────────────────────────────
//  Round / session management
// ──────────────────────────────────────
function endRound(winner) {
  roundResults.push(winner);
  saveScore();

  if (currentRound >= 5) {
    const playerWins   = roundResults.filter(r => r === "player").length;
    const computerWins = roundResults.filter(r => r === "computer").length;

    setTimeout(() => {
      if (playerWins > computerWins) {
        statusDiv.textContent = `${playerName} wins the game!`;
      } else if (computerWins > playerWins) {
        statusDiv.textContent = "Computer wins the game!";
      } else {
        statusDiv.textContent = "The game is a draw!";
      }
      playAgainBtn.style.display = "inline-block";
    }, 1000);

  } else {
    currentRound++;
    setTimeout(resetGame, 1500);
  }
}

// ──────────────────────────────────────
//  UI helpers
// ──────────────────────────────────────
function updateScores() {
  playerScoreEl.textContent   = playerScore;
  computerScoreEl.textContent = computerScore;
}

function saveScore() {
  const entry = `Round ${currentRound}: ${playerName}: ${playerScore} – Computer: ${computerScore}`;
  const li    = document.createElement("li");
  li.textContent = entry;
  scoreHistory.appendChild(li);
}

function saveReview() {
  const review = document.getElementById("reviewText").value.trim();
  if (review) {
    const p = document.createElement("p");
    p.textContent = `${playerName}: ${review}`;
    reviewList.appendChild(p);
    document.getElementById("reviewText").value = "";
  }
}

// ──────────────────────────────────────
//  Initialize
// ──────────────────────────────────────
createBoard();   // (optional) pre-create board for faster first load
// 2048 Game Logic
const GRID_SIZE = 4;
let board = [];
let score = 0;
let highScore = 0;
let soundEnabled = true;
let hasWon = false;

// UI Elements
const gameBoard = document.getElementById('gameBoard');
const startBtn = document.getElementById('startBtn');
const muteBtn = document.getElementById('muteBtn');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highscore');

// Initialize game
function init() {
  loadHighScore();
  createBoard();
  newGame();
}

// Create board HTML
function createBoard() {
  gameBoard.innerHTML = '';
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.id = `tile-${i}`;
    gameBoard.appendChild(tile);
  }
}

// Load high score
function loadHighScore() {
  const saved = localStorage.getItem('ww-2048-highscore');
  highScore = saved ? parseInt(saved) : 0;
  highScoreDisplay.textContent = highScore;
}

// Save high score
function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('ww-2048-highscore', highScore.toString());
    highScoreDisplay.textContent = highScore;
  }
}

// Start new game
function newGame() {
  board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
  score = 0;
  hasWon = false;
  scoreDisplay.textContent = score;
  
  addRandomTile();
  addRandomTile();
  updateBoard();
}

// Add random tile (2 or 4)
function addRandomTile() {
  const empty = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 0) {
        empty.push({ r, c });
      }
    }
  }
  
  if (empty.length > 0) {
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
}

// Update board display
function updateBoard() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const tile = document.getElementById(`tile-${r * GRID_SIZE + c}`);
      const value = board[r][c];
      
      if (value === 0) {
        tile.textContent = '';
        tile.removeAttribute('data-value');
      } else {
        tile.textContent = value;
        tile.setAttribute('data-value', value);
      }
    }
  }
  
  saveHighScore();
}

// Check if game is over
function isGameOver() {
  // Check for empty cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  
  // Check for possible merges
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const current = board[r][c];
      if (c < GRID_SIZE - 1 && board[r][c + 1] === current) return false;
      if (r < GRID_SIZE - 1 && board[r + 1][c] === current) return false;
    }
  }
  
  return true;
}

// Move tiles
function move(direction) {
  let moved = false;
  const oldBoard = board.map(row => [...row]);
  
  if (direction === 'left') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = board[r].filter(x => x !== 0);
      const merged = [];
      
      for (let i = 0; i < row.length; i++) {
        if (i < row.length - 1 && row[i] === row[i + 1]) {
          const newValue = row[i] * 2;
          merged.push(newValue);
          score += newValue;
          i++;
          
          // Check for win
          if (newValue === 2048 && !hasWon) {
            hasWon = true;
            setTimeout(() => showWinMessage(), 300);
          }
        } else {
          merged.push(row[i]);
        }
      }
      
      board[r] = merged.concat(Array(GRID_SIZE - merged.length).fill(0));
    }
  } else if (direction === 'right') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = board[r].filter(x => x !== 0);
      const merged = [];
      
      for (let i = row.length - 1; i >= 0; i--) {
        if (i > 0 && row[i] === row[i - 1]) {
          const newValue = row[i] * 2;
          merged.unshift(newValue);
          score += newValue;
          i--;
          
          if (newValue === 2048 && !hasWon) {
            hasWon = true;
            setTimeout(() => showWinMessage(), 300);
          }
        } else {
          merged.unshift(row[i]);
        }
      }
      
      board[r] = Array(GRID_SIZE - merged.length).fill(0).concat(merged);
    }
  } else if (direction === 'up') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const col = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        if (board[r][c] !== 0) col.push(board[r][c]);
      }
      
      const merged = [];
      for (let i = 0; i < col.length; i++) {
        if (i < col.length - 1 && col[i] === col[i + 1]) {
          const newValue = col[i] * 2;
          merged.push(newValue);
          score += newValue;
          i++;
          
          if (newValue === 2048 && !hasWon) {
            hasWon = true;
            setTimeout(() => showWinMessage(), 300);
          }
        } else {
          merged.push(col[i]);
        }
      }
      
      for (let r = 0; r < GRID_SIZE; r++) {
        board[r][c] = merged[r] || 0;
      }
    }
  } else if (direction === 'down') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const col = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        if (board[r][c] !== 0) col.push(board[r][c]);
      }
      
      const merged = [];
      for (let i = col.length - 1; i >= 0; i--) {
        if (i > 0 && col[i] === col[i - 1]) {
          const newValue = col[i] * 2;
          merged.unshift(newValue);
          score += newValue;
          i--;
          
          if (newValue === 2048 && !hasWon) {
            hasWon = true;
            setTimeout(() => showWinMessage(), 300);
          }
        } else {
          merged.unshift(col[i]);
        }
      }
      
      for (let r = 0; r < GRID_SIZE; r++) {
        board[r][c] = merged[GRID_SIZE - 1 - r] || 0;
      }
    }
  }
  
  // Check if board changed
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] !== oldBoard[r][c]) {
        moved = true;
        break;
      }
    }
    if (moved) break;
  }
  
  if (moved) {
    addRandomTile();
    scoreDisplay.textContent = score;
    playMoveSound();
    updateBoard();
    
    if (isGameOver()) {
      setTimeout(() => showGameOverMessage(), 300);
    }
  }
}

// Show win message
function showWinMessage() {
  const message = confirm('🎉 Congratulations! You reached 2048!\n\nKeep playing to get a higher score?');
  if (!message) {
    newGame();
  }
}

// Show game over message
function showGameOverMessage() {
  alert(`Game Over!\n\nFinal Score: ${score}\nHigh Score: ${highScore}`);
}

// Play sound effect
function playMoveSound() {
  if (!soundEnabled) return;
  
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.value = 400;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    // Silently fail
  }
}

// Toggle sound
function toggleSound() {
  soundEnabled = !soundEnabled;
  muteBtn.textContent = soundEnabled ? '🔊 Sound' : '🔇 Muted';
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      move('up');
      e.preventDefault();
      break;
    case 'ArrowDown':
      move('down');
      e.preventDefault();
      break;
    case 'ArrowLeft':
      move('left');
      e.preventDefault();
      break;
    case 'ArrowRight':
      move('right');
      e.preventDefault();
      break;
  }
});

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

gameBoard.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

gameBoard.addEventListener('touchend', (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
    move(dx > 0 ? 'right' : 'left');
  } else if (Math.abs(dy) > 30) {
    move(dy > 0 ? 'down' : 'up');
  }
});

// Button listeners
startBtn.addEventListener('click', newGame);
muteBtn.addEventListener('click', toggleSound);

// Initialize game
init();

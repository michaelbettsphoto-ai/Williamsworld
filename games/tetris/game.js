// Tetris Game Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
  '#7dffb4', // I - Green
  '#ffd36e', // O - Gold
  '#ff9d5c', // T - Orange
  '#7c3aed', // S - Purple
  '#d4a530', // Z - Blue
  '#5ac99a', // J - Teal
  '#ff7b3d'  // L - Red
];

// Tetromino shapes
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
  [[1, 0, 0], [1, 1, 1]], // J
  [[0, 0, 1], [1, 1, 1]]  // L
];

// Game state
let board = [];
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let score = 0;
let lines = 0;
let highScore = 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop = null;
let soundEnabled = true;
let dropInterval = 1000;
let lastDrop = Date.now();

// UI Elements
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const muteBtn = document.getElementById('muteBtn');
const scoreDisplay = document.getElementById('score');
const linesDisplay = document.getElementById('lines');
const highScoreDisplay = document.getElementById('highscore');

// Initialize board
function initBoard() {
  board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

// Load high score
function loadHighScore() {
  const saved = localStorage.getItem('ww-tetris-highscore');
  highScore = saved ? parseInt(saved) : 0;
  highScoreDisplay.textContent = highScore;
}

// Save high score
function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('ww-tetris-highscore', highScore.toString());
    highScoreDisplay.textContent = highScore;
  }
}

// Create new piece
function newPiece() {
  const shapeIndex = Math.floor(Math.random() * SHAPES.length);
  currentPiece = {
    shape: SHAPES[shapeIndex],
    color: COLORS[shapeIndex]
  };
  currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
  currentY = 0;
  
  // Check if game over
  if (collides()) {
    gameOver();
  }
}

// Check collision
function collides(offsetX = 0, offsetY = 0, shape = currentPiece.shape) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = currentX + x + offsetX;
        const newY = currentY + y + offsetY;
        
        if (newX < 0 || newX >= COLS || newY >= ROWS) {
          return true;
        }
        
        if (newY >= 0 && board[newY][newX]) {
          return true;
        }
      }
    }
  }
  return false;
}

// Rotate piece
function rotate() {
  const newShape = currentPiece.shape[0].map((_, i) =>
    currentPiece.shape.map(row => row[i]).reverse()
  );
  
  if (!collides(0, 0, newShape)) {
    currentPiece.shape = newShape;
    draw();
  }
}

// Move piece
function move(dir) {
  if (!gameRunning || gamePaused) return;
  
  if (dir === 'left' && !collides(-1, 0)) {
    currentX--;
    draw();
  } else if (dir === 'right' && !collides(1, 0)) {
    currentX++;
    draw();
  } else if (dir === 'down') {
    if (!collides(0, 1)) {
      currentY++;
      draw();
    } else {
      freeze();
    }
  }
}

// Freeze piece in place
function freeze() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        const boardY = currentY + y;
        const boardX = currentX + x;
        if (boardY >= 0) {
          board[boardY][boardX] = currentPiece.color;
        }
      }
    }
  }
  
  clearLines();
  newPiece();
}

// Clear complete lines
function clearLines() {
  let linesCleared = 0;
  
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      linesCleared++;
      y++; // Check same row again
    }
  }
  
  if (linesCleared > 0) {
    lines += linesCleared;
    score += linesCleared * 100 * linesCleared; // Bonus for multiple lines
    linesDisplay.textContent = lines;
    scoreDisplay.textContent = score;
    playClearSound();
    
    // Speed up game
    dropInterval = Math.max(200, 1000 - lines * 20);
  }
}

// Draw game
function draw() {
  // Clear canvas
  ctx.fillStyle = 'rgba(30, 15, 40, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  ctx.strokeStyle = 'rgba(200, 148, 42, 0.1)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * BLOCK_SIZE, 0);
    ctx.lineTo(x * BLOCK_SIZE, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * BLOCK_SIZE);
    ctx.lineTo(canvas.width, y * BLOCK_SIZE);
    ctx.stroke();
  }
  
  // Draw board
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        ctx.fillStyle = board[y][x];
        ctx.fillRect(
          x * BLOCK_SIZE + 1,
          y * BLOCK_SIZE + 1,
          BLOCK_SIZE - 2,
          BLOCK_SIZE - 2
        );
      }
    }
  }
  
  // Draw current piece
  if (currentPiece) {
    ctx.fillStyle = currentPiece.color;
    ctx.shadowColor = currentPiece.color;
    ctx.shadowBlur = 10;
    
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          ctx.fillRect(
            (currentX + x) * BLOCK_SIZE + 1,
            (currentY + y) * BLOCK_SIZE + 1,
            BLOCK_SIZE - 2,
            BLOCK_SIZE - 2
          );
        }
      }
    }
    ctx.shadowBlur = 0;
  }
}

// Game update
function update() {
  if (!gameRunning || gamePaused) return;
  
  const now = Date.now();
  if (now - lastDrop > dropInterval) {
    move('down');
    lastDrop = now;
  }
}

// Start game
function startGame() {
  initBoard();
  score = 0;
  lines = 0;
  dropInterval = 1000;
  scoreDisplay.textContent = score;
  linesDisplay.textContent = lines;
  
  gameRunning = true;
  gamePaused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  
  newPiece();
  draw();
  
  lastDrop = Date.now();
  gameLoop = setInterval(update, 16);
}

// Pause game
function pauseGame() {
  if (!gameRunning) return;
  
  gamePaused = !gamePaused;
  pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
  
  if (gamePaused) {
    // Draw pause overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffd36e';
    ctx.font = 'bold 32px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  } else {
    lastDrop = Date.now();
    draw();
  }
}

// Restart game
function restartGame() {
  if (gameRunning) {
    gameRunning = false;
    clearInterval(gameLoop);
  }
  startGame();
}

// Game over
function gameOver() {
  gameRunning = false;
  clearInterval(gameLoop);
  
  saveHighScore();
  
  // Show game over message
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#ffd36e';
  ctx.font = 'bold 32px Cinzel, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 40);
  
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#fff5e6';
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
  ctx.fillText(`Lines: ${lines}`, canvas.width / 2, canvas.height / 2 + 30);
  
  if (score === highScore && score > 0) {
    ctx.fillStyle = '#7dffb4';
    ctx.fillText('New High Score! 🎉', canvas.width / 2, canvas.height / 2 + 70);
  }
  
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

// Sound effects
function playClearSound() {
  if (!soundEnabled) return;
  
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.2);
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
  if (!gameRunning || gamePaused) return;
  
  switch (e.key) {
    case 'ArrowLeft':
      move('left');
      e.preventDefault();
      break;
    case 'ArrowRight':
      move('right');
      e.preventDefault();
      break;
    case 'ArrowDown':
      move('down');
      e.preventDefault();
      break;
    case 'ArrowUp':
    case ' ':
      rotate();
      e.preventDefault();
      break;
  }
});

// Button listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);
muteBtn.addEventListener('click', toggleSound);

// Initialize
loadHighScore();
initBoard();
draw();

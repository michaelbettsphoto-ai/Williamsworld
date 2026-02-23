// Snake Game Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRID_SIZE = 20;
const TILE_SIZE = canvas.width / GRID_SIZE;

// Game state
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 15, y: 15 };
let score = 0;
let highScore = 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop = null;
let soundEnabled = true;
let speed = 150; // milliseconds per frame

// UI Elements
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const muteBtn = document.getElementById('muteBtn');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highscore');

// Load high score from localStorage
function loadHighScore() {
  const saved = localStorage.getItem('ww-snake-highscore');
  highScore = saved ? parseInt(saved) : 0;
  highScoreDisplay.textContent = highScore;
}

// Save high score to localStorage
function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('ww-snake-highscore', highScore.toString());
    highScoreDisplay.textContent = highScore;
  }
}

// Generate random food position
function generateFood() {
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    attempts++;
    
    // Check if food is on snake
    let onSnake = false;
    for (let segment of snake) {
      if (segment.x === food.x && segment.y === food.y) {
        onSnake = true;
        break;
      }
    }
    
    if (!onSnake) break;
  } while (attempts < maxAttempts);
}

// Draw game
function draw() {
  // Clear canvas with themed background
  ctx.fillStyle = 'rgba(30, 15, 40, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  ctx.strokeStyle = 'rgba(200, 148, 42, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * TILE_SIZE, 0);
    ctx.lineTo(i * TILE_SIZE, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i * TILE_SIZE);
    ctx.lineTo(canvas.width, i * TILE_SIZE);
    ctx.stroke();
  }

  // Draw food (golden)
  ctx.fillStyle = '#ffd36e';
  ctx.shadowColor = '#ffd36e';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(
    food.x * TILE_SIZE + TILE_SIZE / 2,
    food.y * TILE_SIZE + TILE_SIZE / 2,
    TILE_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Draw snake
  snake.forEach((segment, index) => {
    // Head is brighter
    if (index === 0) {
      ctx.fillStyle = '#7dffb4';
      ctx.shadowColor = '#7dffb4';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = '#5ac99a';
      ctx.shadowBlur = 0;
    }
    
    ctx.fillRect(
      segment.x * TILE_SIZE + 1,
      segment.y * TILE_SIZE + 1,
      TILE_SIZE - 2,
      TILE_SIZE - 2
    );
    ctx.shadowBlur = 0;
  });
}

// Update game state
function update() {
  if (!gameRunning || gamePaused) return;

  // Calculate new head position
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  // Check wall collision
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    gameOver();
    return;
  }

  // Check self collision
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      gameOver();
      return;
    }
  }

  // Add new head
  snake.unshift(head);

  // Check food collision
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreDisplay.textContent = score;
    generateFood();
    if (soundEnabled && window.GameSounds) GameSounds.snake.eat();
    
    // Increase speed slightly
    speed = Math.max(80, speed - 2);
    clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, speed);
  } else {
    // Remove tail if no food eaten
    snake.pop();
  }

  draw();
}

// Game step
function gameStep() {
  update();
}

// Game over
function gameOver() {
  gameRunning = false;
  clearInterval(gameLoop);
  
  saveHighScore();
  if (soundEnabled && window.GameSounds) GameSounds.snake.die();
  
  // Show game over message
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#ffd36e';
  ctx.font = 'bold 32px Cinzel, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
  
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#fff5e6';
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
  
  if (score === highScore && score > 0) {
    ctx.fillStyle = '#7dffb4';
    ctx.fillText('New High Score! 🎉', canvas.width / 2, canvas.height / 2 + 50);
  }
  
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

// Start game
function startGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  score = 0;
  speed = 150;
  scoreDisplay.textContent = score;
  
  generateFood();
  gameRunning = true;
  gamePaused = false;
  
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  
  draw();
  gameLoop = setInterval(gameStep, speed);
  if (window.GameSounds) GameSounds.unlock();
}

// Pause game
function pauseGame() {
  if (!gameRunning) return;
  
  gamePaused = !gamePaused;
  pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
  
  if (gamePaused) {
    clearInterval(gameLoop);
    
    // Show pause overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffd36e';
    ctx.font = 'bold 32px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  } else {
    gameLoop = setInterval(gameStep, speed);
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

// Toggle sound
function toggleSound() {
  soundEnabled = !soundEnabled;
  muteBtn.textContent = soundEnabled ? '🔊 Sound' : '🔇 Muted';
  if (window.GameSounds) GameSounds.setEnabled(soundEnabled);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (!gameRunning || gamePaused) return;
  
  switch (e.key) {
    case 'ArrowUp':
      if (direction.y === 0) direction = { x: 0, y: -1 };
      e.preventDefault();
      break;
    case 'ArrowDown':
      if (direction.y === 0) direction = { x: 0, y: 1 };
      e.preventDefault();
      break;
    case 'ArrowLeft':
      if (direction.x === 0) direction = { x: -1, y: 0 };
      e.preventDefault();
      break;
    case 'ArrowRight':
      if (direction.x === 0) direction = { x: 1, y: 0 };
      e.preventDefault();
      break;
  }
});

// Button event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);
muteBtn.addEventListener('click', toggleSound);

// D-Pad on-screen controls
function dpadPress(dir) {
  if (!gameRunning || gamePaused) return;
  switch (dir) {
    case 'up':    if (direction.y === 0) direction = { x: 0, y: -1 }; break;
    case 'down':  if (direction.y === 0) direction = { x: 0, y: 1 };  break;
    case 'left':  if (direction.x === 0) direction = { x: -1, y: 0 }; break;
    case 'right': if (direction.x === 0) direction = { x: 1, y: 0 };  break;
  }
}
const dpadUp    = document.getElementById('dpadUp');
const dpadDown  = document.getElementById('dpadDown');
const dpadLeft  = document.getElementById('dpadLeft');
const dpadRight = document.getElementById('dpadRight');
if (dpadUp) {
  ['touchstart', 'mousedown'].forEach(ev => {
    dpadUp.addEventListener(ev,    e => { e.preventDefault(); dpadPress('up');    }, { passive: false });
    dpadDown.addEventListener(ev,  e => { e.preventDefault(); dpadPress('down');  }, { passive: false });
    dpadLeft.addEventListener(ev,  e => { e.preventDefault(); dpadPress('left');  }, { passive: false });
    dpadRight.addEventListener(ev, e => { e.preventDefault(); dpadPress('right'); }, { passive: false });
  });
}

// Touch swipe controls on canvas
let touchStartX = 0, touchStartY = 0;
canvas.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });
canvas.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    dpadPress(dx > 0 ? 'right' : 'left');
  } else {
    dpadPress(dy > 0 ? 'down' : 'up');
  }
}, { passive: true });

// Initialize
loadHighScore();
draw();

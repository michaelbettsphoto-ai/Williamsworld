// Checkers Game Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const BOARD_SIZE = 8;
const SQUARE_SIZE = canvas.width / BOARD_SIZE;
const PIECE_RADIUS = SQUARE_SIZE * 0.35;

// Colors
const LIGHT_SQUARE = '#e6d4b8';
const DARK_SQUARE = '#8b7355';
const RED_PIECE = '#dc2626';
const BLACK_PIECE = '#1a1a1a';
const KING_CROWN = '#ffd36e';
const SELECTED_HIGHLIGHT = 'rgba(125, 255, 180, 0.5)';
const VALID_MOVE_HIGHLIGHT = 'rgba(255, 211, 110, 0.4)';

// Game state
let board = [];
let selectedPiece = null;
let currentPlayer = 'red'; // 'red' or 'black'
let validMoves = [];
let wins = 0;
let mustCapture = false;

// UI Elements
const newGameBtn = document.getElementById('newGameBtn');
const resetStatsBtn = document.getElementById('resetStatsBtn');
const turnDisplay = document.getElementById('turnDisplay');
const winsDisplay = document.getElementById('wins');

// Initialize board
function initBoard() {
  board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
  
  // Place red pieces (top)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'red', king: false };
      }
    }
  }
  
  // Place black pieces (bottom)
  for (let row = 5; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'black', king: false };
      }
    }
  }
  
  selectedPiece = null;
  currentPlayer = 'red';
  validMoves = [];
  mustCapture = false;
  updateTurnDisplay();
}

// Load wins
function loadWins() {
  const saved = localStorage.getItem('ww-checkers-wins');
  wins = saved ? parseInt(saved) : 0;
  winsDisplay.textContent = wins;
}

// Save wins
function saveWins() {
  localStorage.setItem('ww-checkers-wins', wins.toString());
  winsDisplay.textContent = wins;
}

// Update turn display
function updateTurnDisplay() {
  if (currentPlayer === 'red') {
    turnDisplay.textContent = "Red's Turn";
    turnDisplay.style.color = '#dc2626';
  } else {
    turnDisplay.textContent = "Black's Turn";
    turnDisplay.style.color = '#1a1a1a';
  }
}

// Draw board
function drawBoard() {
  // Draw squares
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? LIGHT_SQUARE : DARK_SQUARE;
      ctx.fillRect(col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    }
  }
  
  // Draw selected piece highlight
  if (selectedPiece) {
    ctx.fillStyle = SELECTED_HIGHLIGHT;
    ctx.fillRect(
      selectedPiece.col * SQUARE_SIZE,
      selectedPiece.row * SQUARE_SIZE,
      SQUARE_SIZE,
      SQUARE_SIZE
    );
  }
  
  // Draw valid moves
  for (const move of validMoves) {
    ctx.fillStyle = VALID_MOVE_HIGHLIGHT;
    ctx.fillRect(
      move.col * SQUARE_SIZE,
      move.row * SQUARE_SIZE,
      SQUARE_SIZE,
      SQUARE_SIZE
    );
  }
  
  // Draw pieces
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece) {
        drawPiece(row, col, piece);
      }
    }
  }
}

// Draw a piece
function drawPiece(row, col, piece) {
  const x = col * SQUARE_SIZE + SQUARE_SIZE / 2;
  const y = row * SQUARE_SIZE + SQUARE_SIZE / 2;
  
  // Draw piece shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.arc(x + 2, y + 2, PIECE_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw piece
  ctx.fillStyle = piece.color === 'red' ? RED_PIECE : BLACK_PIECE;
  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw piece outline
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw king crown
  if (piece.king) {
    ctx.fillStyle = KING_CROWN;
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♔', x, y);
  }
}

// Get valid moves for a piece
function getValidMoves(row, col) {
  const piece = board[row][col];
  if (!piece || piece.color !== currentPlayer) return [];
  
  const moves = [];
  const directions = piece.king 
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] // King can move all directions
    : piece.color === 'red' 
      ? [[1, -1], [1, 1]] // Red moves down
      : [[-1, -1], [-1, 1]]; // Black moves up
  
  // Check for captures first
  for (const [dRow, dCol] of directions) {
    const jumpRow = row + dRow * 2;
    const jumpCol = col + dCol * 2;
    const middleRow = row + dRow;
    const middleCol = col + dCol;
    
    if (jumpRow >= 0 && jumpRow < BOARD_SIZE && jumpCol >= 0 && jumpCol < BOARD_SIZE) {
      const middle = board[middleRow][middleCol];
      const target = board[jumpRow][jumpCol];
      
      if (middle && middle.color !== piece.color && !target) {
        moves.push({ row: jumpRow, col: jumpCol, capture: { row: middleRow, col: middleCol } });
      }
    }
  }
  
  // If captures available, only return captures
  if (moves.length > 0) return moves;
  
  // If we must capture but no captures available for this piece, return empty
  if (mustCapture) return [];
  
  // Otherwise check normal moves
  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
      if (!board[newRow][newCol]) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }
  
  return moves;
}

// Check if current player has any captures available
function hasAnyCaptures() {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        const moves = getValidMoves(row, col);
        if (moves.some(m => m.capture)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Move piece
function movePiece(fromRow, fromCol, toRow, toCol, capture) {
  const piece = board[fromRow][fromCol];
  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = null;
  
  // Remove captured piece
  if (capture) {
    board[capture.row][capture.col] = null;
  }
  
  // Check for king promotion
  if (!piece.king) {
    if (piece.color === 'red' && toRow === BOARD_SIZE - 1) {
      piece.king = true;
    } else if (piece.color === 'black' && toRow === 0) {
      piece.king = true;
    }
  }
  
  // Check for additional captures
  if (capture) {
    const additionalMoves = getValidMoves(toRow, toCol).filter(m => m.capture);
    if (additionalMoves.length > 0) {
      // Must continue capturing
      selectedPiece = { row: toRow, col: toCol };
      validMoves = additionalMoves;
      drawBoard();
      return;
    }
  }
  
  // Switch player
  selectedPiece = null;
  validMoves = [];
  currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
  mustCapture = hasAnyCaptures();
  updateTurnDisplay();
  
  // Check for winner
  checkWinner();
}

// Check for winner
function checkWinner() {
  const redPieces = [];
  const blackPieces = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.color === 'red') redPieces.push({ row, col });
        else blackPieces.push({ row, col });
      }
    }
  }
  
  let winner = null;
  if (redPieces.length === 0) winner = 'Black';
  else if (blackPieces.length === 0) winner = 'Red';
  else {
    // Check if current player has any valid moves
    let hasValidMove = false;
    for (const { row, col } of currentPlayer === 'red' ? redPieces : blackPieces) {
      if (getValidMoves(row, col).length > 0) {
        hasValidMove = true;
        break;
      }
    }
    if (!hasValidMove) {
      winner = currentPlayer === 'red' ? 'Black' : 'Red';
    }
  }
  
  if (winner) {
    wins++;
    saveWins();
    
    setTimeout(() => {
      alert(`${winner} wins! 🎉\n\nTotal wins: ${wins}`);
    }, 100);
  }
}

// Handle click
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const col = Math.floor(x / SQUARE_SIZE);
  const row = Math.floor(y / SQUARE_SIZE);
  
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;
  
  // Check if clicking on a valid move
  const validMove = validMoves.find(m => m.row === row && m.col === col);
  if (validMove && selectedPiece) {
    movePiece(selectedPiece.row, selectedPiece.col, row, col, validMove.capture);
    drawBoard();
    return;
  }
  
  // Select piece
  const piece = board[row][col];
  if (piece && piece.color === currentPlayer) {
    selectedPiece = { row, col };
    validMoves = getValidMoves(row, col);
    drawBoard();
  } else {
    selectedPiece = null;
    validMoves = [];
    drawBoard();
  }
});

// New game
function newGame() {
  initBoard();
  drawBoard();
}

// Reset stats
function resetStats() {
  if (confirm('Reset all win statistics?')) {
    wins = 0;
    saveWins();
  }
}

// Button listeners
newGameBtn.addEventListener('click', newGame);
resetStatsBtn.addEventListener('click', resetStats);

// Initialize
loadWins();
initBoard();
drawBoard();

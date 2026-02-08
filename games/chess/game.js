// Simple Chess Game Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const BOARD_SIZE = 8;
const SQUARE_SIZE = canvas.width / BOARD_SIZE;
const PIECE_SIZE = SQUARE_SIZE * 0.7;

// Colors
const LIGHT_SQUARE = '#e6d4b8';
const DARK_SQUARE = '#8b7355';
const SELECTED_HIGHLIGHT = 'rgba(125, 255, 180, 0.5)';
const VALID_MOVE_HIGHLIGHT = 'rgba(255, 211, 110, 0.4)';
const CHECK_HIGHLIGHT = 'rgba(220, 38, 38, 0.5)';

// Unicode chess pieces
const PIECES = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙', // White
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'  // Black
};

// Game state
let board = [];
let selectedSquare = null;
let validMoves = [];
let currentPlayer = 'white';
let wins = 0;
let moveHistory = [];
let capturedWhite = [];
let capturedBlack = [];
let whiteKingPos = null;
let blackKingPos = null;
let isCheck = false;

// UI Elements
const newGameBtn = document.getElementById('newGameBtn');
const undoBtn = document.getElementById('undoBtn');
const resetStatsBtn = document.getElementById('resetStatsBtn');
const turnDisplay = document.getElementById('turnDisplay');
const winsDisplay = document.getElementById('wins');
const gameStatus = document.getElementById('gameStatus');
const whiteCapturedDiv = document.getElementById('whiteCaptured');
const blackCapturedDiv = document.getElementById('blackCaptured');

// Initialize board
function initBoard() {
  // Standard chess starting position
  board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];
  
  selectedSquare = null;
  validMoves = [];
  currentPlayer = 'white';
  moveHistory = [];
  capturedWhite = [];
  capturedBlack = [];
  whiteKingPos = { row: 7, col: 4 };
  blackKingPos = { row: 0, col: 4 };
  isCheck = false;
  
  updateDisplay();
}

// Load wins
function loadWins() {
  const saved = localStorage.getItem('ww-chess-wins');
  wins = saved ? parseInt(saved) : 0;
  winsDisplay.textContent = wins;
}

// Save wins
function saveWins() {
  localStorage.setItem('ww-chess-wins', wins.toString());
  winsDisplay.textContent = wins;
}

// Update display
function updateDisplay() {
  turnDisplay.textContent = currentPlayer === 'white' ? "White's Turn" : "Black's Turn";
  turnDisplay.style.color = currentPlayer === 'white' ? '#fff5e6' : '#1a1a1a';
  
  whiteCapturedDiv.textContent = capturedWhite.map(p => PIECES[p]).join(' ');
  blackCapturedDiv.textContent = capturedBlack.map(p => PIECES[p]).join(' ');
  
  if (isCheck) {
    gameStatus.textContent = `${currentPlayer === 'white' ? 'White' : 'Black'} is in Check!`;
    gameStatus.style.color = '#dc2626';
  } else {
    gameStatus.textContent = '';
  }
}

// Is piece white
function isWhite(piece) {
  return piece && piece === piece.toUpperCase();
}

// Is own piece
function isOwnPiece(piece) {
  if (!piece) return false;
  return currentPlayer === 'white' ? isWhite(piece) : !isWhite(piece);
}

// Is opponent piece
function isOpponentPiece(piece) {
  if (!piece) return false;
  return currentPlayer === 'white' ? !isWhite(piece) : isWhite(piece);
}

// Get valid moves for a piece
function getValidMoves(row, col, checkForCheck = true) {
  const piece = board[row][col];
  if (!piece || !isOwnPiece(piece)) return [];
  
  const moves = [];
  const type = piece.toLowerCase();
  
  // Pawn moves
  if (type === 'p') {
    const direction = isWhite(piece) ? -1 : 1;
    const startRow = isWhite(piece) ? 6 : 1;
    
    // Move forward
    const forwardSquare = board[row + direction]?.[col];
    if (forwardSquare !== undefined && forwardSquare === null) {
      moves.push({ row: row + direction, col });
      
      // Double move from start
      if (row === startRow && board[row + 2 * direction]?.[col] === null) {
        moves.push({ row: row + 2 * direction, col });
      }
    }
    
    // Capture diagonally
    [-1, 1].forEach(dc => {
      const newRow = row + direction;
      const newCol = col + dc;
      if (board[newRow]?.[newCol] && isOpponentPiece(board[newRow][newCol])) {
        moves.push({ row: newRow, col: newCol });
      }
    });
  }
  
  // Rook moves
  else if (type === 'r') {
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
      for (let i = 1; i < BOARD_SIZE; i++) {
        const newRow = row + dr * i;
        const newCol = col + dc * i;
        if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
        
        const target = board[newRow][newCol];
        if (!target) {
          moves.push({ row: newRow, col: newCol });
        } else {
          if (isOpponentPiece(target)) moves.push({ row: newRow, col: newCol });
          break;
        }
      }
    });
  }
  
  // Knight moves
  else if (type === 'n') {
    [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = board[newRow][newCol];
        if (!target || isOpponentPiece(target)) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    });
  }
  
  // Bishop moves
  else if (type === 'b') {
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
      for (let i = 1; i < BOARD_SIZE; i++) {
        const newRow = row + dr * i;
        const newCol = col + dc * i;
        if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
        
        const target = board[newRow][newCol];
        if (!target) {
          moves.push({ row: newRow, col: newCol });
        } else {
          if (isOpponentPiece(target)) moves.push({ row: newRow, col: newCol });
          break;
        }
      }
    });
  }
  
  // Queen moves (combination of rook and bishop)
  else if (type === 'q') {
    [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
      for (let i = 1; i < BOARD_SIZE; i++) {
        const newRow = row + dr * i;
        const newCol = col + dc * i;
        if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
        
        const target = board[newRow][newCol];
        if (!target) {
          moves.push({ row: newRow, col: newCol });
        } else {
          if (isOpponentPiece(target)) moves.push({ row: newRow, col: newCol });
          break;
        }
      }
    });
  }
  
  // King moves
  else if (type === 'k') {
    [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        const target = board[newRow][newCol];
        if (!target || isOpponentPiece(target)) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    });
  }
  
  // Filter out moves that would put own king in check
  if (checkForCheck) {
    return moves.filter(move => !wouldBeInCheck(row, col, move.row, move.col));
  }
  
  return moves;
}

// Check if move would put own king in check
function wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
  // Make temporary move
  const piece = board[fromRow][fromCol];
  const captured = board[toRow][toCol];
  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = null;
  
  // Update king position if moved
  let kingPos = currentPlayer === 'white' ? { ...whiteKingPos } : { ...blackKingPos };
  if (piece.toLowerCase() === 'k') {
    kingPos = { row: toRow, col: toCol };
  }
  
  // Check if king is under attack
  let inCheck = false;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p && isOpponentPiece(p)) {
        const moves = getValidMoves(r, c, false);
        if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
          inCheck = true;
          break;
        }
      }
    }
    if (inCheck) break;
  }
  
  // Undo move
  board[fromRow][fromCol] = piece;
  board[toRow][toCol] = captured;
  
  return inCheck;
}

// Check if current player is in check
function checkForCheck() {
  const kingPos = currentPlayer === 'white' ? whiteKingPos : blackKingPos;
  
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && !isOwnPiece(piece)) {
        const moves = getValidMoves(r, c, false);
        if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Check for checkmate
function checkForCheckmate() {
  // Check if any piece has valid moves
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && isOwnPiece(piece)) {
        const moves = getValidMoves(r, c);
        if (moves.length > 0) {
          return false;
        }
      }
    }
  }
  
  return true;
}

// Move piece
function movePiece(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const captured = board[toRow][toCol];
  
  // Save move history
  moveHistory.push({
    from: { row: fromRow, col: fromCol },
    to: { row: toRow, col: toCol },
    piece,
    captured,
    capturedWhite: [...capturedWhite],
    capturedBlack: [...capturedBlack],
    player: currentPlayer
  });
  
  // Capture piece
  if (captured) {
    if (isWhite(captured)) {
      capturedBlack.push(captured);
    } else {
      capturedWhite.push(captured);
    }
  }
  
  // Move piece
  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = null;
  
  // Update king position
  if (piece.toLowerCase() === 'k') {
    if (currentPlayer === 'white') {
      whiteKingPos = { row: toRow, col: toCol };
    } else {
      blackKingPos = { row: toRow, col: toCol };
    }
  }
  
  // Pawn promotion
  if (piece.toLowerCase() === 'p') {
    if ((isWhite(piece) && toRow === 0) || (!isWhite(piece) && toRow === 7)) {
      board[toRow][toCol] = isWhite(piece) ? 'Q' : 'q';
    }
  }
  
  // Switch player
  selectedSquare = null;
  validMoves = [];
  currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
  
  // Check for check
  isCheck = checkForCheck();
  
  // Check for checkmate
  if (isCheck && checkForCheckmate()) {
    const winner = currentPlayer === 'white' ? 'Black' : 'White';
    wins++;
    saveWins();
    setTimeout(() => {
      alert(`Checkmate! ${winner} wins! 🎉\n\nTotal wins: ${wins}`);
    }, 100);
  }
  
  updateDisplay();
}

// Undo last move
function undoMove() {
  if (moveHistory.length === 0) return;
  
  const lastMove = moveHistory.pop();
  
  // Restore board
  board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
  board[lastMove.to.row][lastMove.to.col] = lastMove.captured;
  
  // Restore captured pieces
  capturedWhite = lastMove.capturedWhite;
  capturedBlack = lastMove.capturedBlack;
  
  // Restore player
  currentPlayer = lastMove.player;
  
  // Restore king position
  if (lastMove.piece.toLowerCase() === 'k') {
    if (currentPlayer === 'white') {
      whiteKingPos = lastMove.from;
    } else {
      blackKingPos = lastMove.from;
    }
  }
  
  selectedSquare = null;
  validMoves = [];
  isCheck = checkForCheck();
  
  updateDisplay();
  drawBoard();
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
  
  // Draw selected square
  if (selectedSquare) {
    ctx.fillStyle = SELECTED_HIGHLIGHT;
    ctx.fillRect(
      selectedSquare.col * SQUARE_SIZE,
      selectedSquare.row * SQUARE_SIZE,
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
  
  // Draw check highlight
  if (isCheck) {
    const kingPos = currentPlayer === 'white' ? whiteKingPos : blackKingPos;
    ctx.fillStyle = CHECK_HIGHLIGHT;
    ctx.fillRect(
      kingPos.col * SQUARE_SIZE,
      kingPos.row * SQUARE_SIZE,
      SQUARE_SIZE,
      SQUARE_SIZE
    );
  }
  
  // Draw pieces
  ctx.font = `${PIECE_SIZE}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece) {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText(
          PIECES[piece],
          col * SQUARE_SIZE + SQUARE_SIZE / 2 + 2,
          row * SQUARE_SIZE + SQUARE_SIZE / 2 + 2
        );
        
        // Piece
        ctx.fillStyle = isWhite(piece) ? '#fff5e6' : '#1a1a1a';
        ctx.fillText(
          PIECES[piece],
          col * SQUARE_SIZE + SQUARE_SIZE / 2,
          row * SQUARE_SIZE + SQUARE_SIZE / 2
        );
      }
    }
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
  if (validMove && selectedSquare) {
    movePiece(selectedSquare.row, selectedSquare.col, row, col);
    drawBoard();
    return;
  }
  
  // Select piece
  const piece = board[row][col];
  if (piece && isOwnPiece(piece)) {
    selectedSquare = { row, col };
    validMoves = getValidMoves(row, col);
    drawBoard();
  } else {
    selectedSquare = null;
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
undoBtn.addEventListener('click', undoMove);
resetStatsBtn.addEventListener('click', resetStats);

// Initialize
loadWins();
initBoard();
drawBoard();

// ═══════════════════════════════════════════════════════════════
//  Chess — William's World
//  Features: 1P vs AI (Easy/Medium/Hard) + 2P local mode
//  AI: Easy=random, Medium=minimax 2-ply, Hard=minimax+αβ 4-ply
//  Fixes: check highlighting, checkmate, stalemate, king-capture
// ═══════════════════════════════════════════════════════════════

// ── Canvas & Constants ──────────────────────────────────────────
const canvas   = document.getElementById('gameCanvas');
const ctx      = canvas.getContext('2d');
const BOARD_SZ = 8;
const SQ       = canvas.width / BOARD_SZ;
const PSIZ     = SQ * 0.72;

const COL_LIGHT    = '#e6d4b8';
const COL_DARK     = '#8b7355';
const COL_SEL      = 'rgba(125,255,180,0.55)';
const COL_MOVE     = 'rgba(255,211,110,0.45)';
const COL_CHECK    = 'rgba(220,38,38,0.55)';
const COL_LASTFROM = 'rgba(100,180,255,0.30)';
const COL_LASTTO   = 'rgba(100,180,255,0.45)';

const GLYPHS = {
  K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',
  k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'
};

// ── Piece-square tables (white perspective, flip for black) ─────
const PST = {
  P: [
    [ 0, 0, 0, 0, 0, 0, 0, 0],
    [50,50,50,50,50,50,50,50],
    [10,10,20,30,30,20,10,10],
    [ 5, 5,10,25,25,10, 5, 5],
    [ 0, 0, 0,20,20, 0, 0, 0],
    [ 5,-5,-10, 0, 0,-10,-5, 5],
    [ 5,10,10,-20,-20,10,10, 5],
    [ 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  N: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  B: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  R: [
    [ 0, 0, 0, 0, 0, 0, 0, 0],
    [ 5,10,10,10,10,10,10, 5],
    [-5, 0, 0, 0, 0, 0, 0,-5],
    [-5, 0, 0, 0, 0, 0, 0,-5],
    [-5, 0, 0, 0, 0, 0, 0,-5],
    [-5, 0, 0, 0, 0, 0, 0,-5],
    [-5, 0, 0, 0, 0, 0, 0,-5],
    [ 0, 0, 0, 5, 5, 0, 0, 0]
  ],
  Q: [
    [-20,-10,-10,-5,-5,-10,-10,-20],
    [-10,  0,  0, 0, 0,  0,  0,-10],
    [-10,  0,  5, 5, 5,  5,  0,-10],
    [ -5,  0,  5, 5, 5,  5,  0, -5],
    [  0,  0,  5, 5, 5,  5,  0, -5],
    [-10,  5,  5, 5, 5,  5,  0,-10],
    [-10,  0,  5, 0, 0,  0,  0,-10],
    [-20,-10,-10,-5,-5,-10,-10,-20]
  ],
  K: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

const PIECE_VAL = { p:100, n:320, b:330, r:500, q:900, k:20000 };

// ── Game State ──────────────────────────────────────────────────
let board, selectedSq, validMoves, currentPlayer;
let whiteKingPos, blackKingPos, isCheck;
let moveHistory, capturedWhite, capturedBlack;
let lastMove; // {from,to}
let wins = 0;
let gameOver = false;
let soundEnabled = true;

// Mode / AI settings
let gameMode    = null;  // '1p' | '2p'
let aiDifficulty = null; // 'easy' | 'medium' | 'hard'
let humanColor  = null;  // 'white' | 'black'
let aiColor     = null;
let aiThinking  = false;

// ── UI Elements ─────────────────────────────────────────────────
const modeScreen      = document.getElementById('modeScreen');
const gameScreen      = document.getElementById('gameScreen');
const diffRow         = document.getElementById('diffRow');
const colorRow        = document.getElementById('colorRow');
const startGameBtn    = document.getElementById('startGameBtn');
const turnDisplay     = document.getElementById('turnDisplay');
const winsDisplay     = document.getElementById('wins');
const gameStatus      = document.getElementById('gameStatus');
const whiteCapturedEl = document.getElementById('whiteCaptured');
const blackCapturedEl = document.getElementById('blackCaptured');
const undoBtn         = document.getElementById('undoBtn');
const resetStatsBtn   = document.getElementById('resetStatsBtn');
const muteBtn         = document.getElementById('muteBtn');
const aiBadge         = document.getElementById('aiBadge');
const thinkingEl      = document.getElementById('thinkingIndicator');
const gameEndModal    = document.getElementById('gameEndModal');
const gemTitle        = document.getElementById('gemTitle');
const gemSub          = document.getElementById('gemSub');
const gemWins         = document.getElementById('gemWins');

// ── Mode Select Handlers ────────────────────────────────────────
function selectMode(mode, el) {
  document.querySelectorAll('#modeScreen .mode-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  gameMode = mode;
  if (mode === '1p') {
    diffRow.classList.add('visible');
    colorRow.classList.remove('visible');
    startGameBtn.classList.remove('visible');
    aiDifficulty = null; humanColor = null;
  } else {
    diffRow.classList.remove('visible');
    colorRow.classList.remove('visible');
    aiDifficulty = null; humanColor = null;
    startGameBtn.classList.add('visible');
  }
}

function selectDiff(diff, el) {
  document.querySelectorAll('#diffRow .mode-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  aiDifficulty = diff;
  colorRow.classList.add('visible');
  startGameBtn.classList.remove('visible');
  humanColor = null;
}

function selectColor(color, el) {
  document.querySelectorAll('#colorRow .mode-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  humanColor = color;
  startGameBtn.classList.add('visible');
}

function startGame() {
  if (gameMode === '1p' && (!aiDifficulty || !humanColor)) return;
  aiColor = humanColor === 'white' ? 'black' : 'white';
  modeScreen.style.display = 'none';
  gameScreen.classList.add('visible');
  if (gameMode === '1p') {
    const labels = { easy:'🌱 Easy', medium:'⚔️ Medium', hard:'🔥 Hard' };
    aiBadge.textContent = labels[aiDifficulty];
    aiBadge.style.display = 'inline-block';
  } else {
    aiBadge.style.display = 'none';
  }
  loadWins();
  newGame();
  if (window.GameSounds) GameSounds.unlock();
}

function returnToModeScreen() {
  gameEndModal.classList.remove('visible');
  gameScreen.classList.remove('visible');
  modeScreen.style.display = 'flex';
  // reset selections
  document.querySelectorAll('#modeScreen .mode-card').forEach(c => c.classList.remove('selected'));
  diffRow.classList.remove('visible');
  colorRow.classList.remove('visible');
  startGameBtn.classList.remove('visible');
  gameMode = null; aiDifficulty = null; humanColor = null;
}

function rematch() {
  gameEndModal.classList.remove('visible');
  newGame();
}

// ── Game Init ───────────────────────────────────────────────────
function newGame() {
  board = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
  ];
  selectedSq    = null;
  validMoves    = [];
  currentPlayer = 'white';
  whiteKingPos  = { row:7, col:4 };
  blackKingPos  = { row:0, col:4 };
  isCheck       = false;
  moveHistory   = [];
  capturedWhite = [];
  capturedBlack = [];
  lastMove      = null;
  gameOver      = false;
  aiThinking    = false;
  thinkingEl.style.display = 'none';
  updateDisplay();
  drawBoard();
  // If AI goes first (human chose black)
  if (gameMode === '1p' && aiColor === 'white') {
    scheduleAiMove();
  }
}

function loadWins() {
  wins = parseInt(localStorage.getItem('ww-chess-wins') || '0');
  winsDisplay.textContent = wins;
}
function saveWins() {
  localStorage.setItem('ww-chess-wins', wins);
  winsDisplay.textContent = wins;
}

// ── Helpers ─────────────────────────────────────────────────────
const isWhitePiece = p => p && p === p.toUpperCase();
const isBlackPiece = p => p && p === p.toLowerCase();
const isOwnPiece   = (p, player) => player === 'white' ? isWhitePiece(p) : isBlackPiece(p);
const isOppPiece   = (p, player) => player === 'white' ? isBlackPiece(p) : isWhitePiece(p);

function cloneBoard(b) { return b.map(r => [...r]); }

// ── Move Generation ─────────────────────────────────────────────
function getRawMoves(b, row, col, player) {
  const piece = b[row][col];
  if (!piece || !isOwnPiece(piece, player)) return [];
  const moves = [];
  const type  = piece.toLowerCase();
  const opp   = p => isOppPiece(p, player);
  const own   = p => isOwnPiece(p, player);
  const inBounds = (r,c) => r>=0&&r<BOARD_SZ&&c>=0&&c<BOARD_SZ;

  if (type === 'p') {
    const dir = player === 'white' ? -1 : 1;
    const startR = player === 'white' ? 6 : 1;
    if (inBounds(row+dir,col) && !b[row+dir][col]) {
      moves.push({row:row+dir,col});
      if (row===startR && !b[row+2*dir][col]) moves.push({row:row+2*dir,col});
    }
    for (const dc of [-1,1]) {
      const nr=row+dir, nc=col+dc;
      if (inBounds(nr,nc) && opp(b[nr][nc])) moves.push({row:nr,col:nc});
    }
  } else if (type === 'r' || type === 'q') {
    for (const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      for (let i=1;i<BOARD_SZ;i++) {
        const nr=row+dr*i, nc=col+dc*i;
        if (!inBounds(nr,nc)) break;
        if (!b[nr][nc]) { moves.push({row:nr,col:nc}); }
        else { if (opp(b[nr][nc])) moves.push({row:nr,col:nc}); break; }
      }
    }
  }
  if (type === 'b' || type === 'q') {
    for (const [dr,dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
      for (let i=1;i<BOARD_SZ;i++) {
        const nr=row+dr*i, nc=col+dc*i;
        if (!inBounds(nr,nc)) break;
        if (!b[nr][nc]) { moves.push({row:nr,col:nc}); }
        else { if (opp(b[nr][nc])) moves.push({row:nr,col:nc}); break; }
      }
    }
  }
  if (type === 'n') {
    for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const nr=row+dr, nc=col+dc;
      if (inBounds(nr,nc) && !own(b[nr][nc])) moves.push({row:nr,col:nc});
    }
  }
  if (type === 'k') {
    for (const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const nr=row+dr, nc=col+dc;
      if (inBounds(nr,nc) && !own(b[nr][nc])) moves.push({row:nr,col:nc});
    }
  }
  return moves;
}

function findKing(b, player) {
  const k = player === 'white' ? 'K' : 'k';
  for (let r=0;r<BOARD_SZ;r++) for (let c=0;c<BOARD_SZ;c++) if (b[r][c]===k) return {row:r,col:c};
  return null;
}

function isKingInCheck(b, player) {
  const kp = findKing(b, player);
  if (!kp) return false;
  const opp = player === 'white' ? 'black' : 'white';
  for (let r=0;r<BOARD_SZ;r++) for (let c=0;c<BOARD_SZ;c++) {
    if (isOwnPiece(b[r][c], opp)) {
      const ms = getRawMoves(b,r,c,opp);
      if (ms.some(m=>m.row===kp.row&&m.col===kp.col)) return true;
    }
  }
  return false;
}

function applyMove(b, fromR, fromC, toR, toC, player) {
  const nb = cloneBoard(b);
  const piece = nb[fromR][fromC];
  nb[toR][toC] = piece;
  nb[fromR][fromC] = null;
  // Pawn promotion
  if (piece.toLowerCase()==='p') {
    if (player==='white' && toR===0) nb[toR][toC]='Q';
    if (player==='black' && toR===7) nb[toR][toC]='q';
  }
  return nb;
}

function getLegalMoves(b, row, col, player) {
  return getRawMoves(b,row,col,player).filter(m => {
    const nb = applyMove(b,row,col,m.row,m.col,player);
    return !isKingInCheck(nb, player);
  });
}

function getAllLegalMoves(b, player) {
  const all = [];
  for (let r=0;r<BOARD_SZ;r++) for (let c=0;c<BOARD_SZ;c++) {
    if (isOwnPiece(b[r][c], player)) {
      const ms = getLegalMoves(b,r,c,player);
      ms.forEach(m => all.push({fromRow:r,fromCol:c,toRow:m.row,toCol:m.col}));
    }
  }
  return all;
}

// ── Board Evaluation ────────────────────────────────────────────
function evaluateBoard(b) {
  let score = 0;
  for (let r=0;r<BOARD_SZ;r++) for (let c=0;c<BOARD_SZ;c++) {
    const p = b[r][c];
    if (!p) continue;
    const white = isWhitePiece(p);
    const type  = p.toLowerCase();
    const val   = PIECE_VAL[type] || 0;
    const pstKey = type.toUpperCase();
    const pstRow = white ? r : (7-r);
    const pstVal = PST[pstKey] ? PST[pstKey][pstRow][c] : 0;
    score += white ? (val + pstVal) : -(val + pstVal);
  }
  return score;
}

// ── Minimax with Alpha-Beta ──────────────────────────────────────
function minimax(b, depth, alpha, beta, maximizing) {
  const player = maximizing ? 'white' : 'black';
  const moves  = getAllLegalMoves(b, player);

  if (depth === 0 || moves.length === 0) {
    if (moves.length === 0) {
      if (isKingInCheck(b, player)) return maximizing ? -99999 : 99999;
      return 0; // stalemate
    }
    return evaluateBoard(b);
  }

  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      const nb = applyMove(b, m.fromRow, m.fromCol, m.toRow, m.toCol, player);
      best = Math.max(best, minimax(nb, depth-1, alpha, beta, false));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const nb = applyMove(b, m.fromRow, m.fromCol, m.toRow, m.toCol, player);
      best = Math.min(best, minimax(nb, depth-1, alpha, beta, true));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getBestMove(b, player, depth) {
  const moves = getAllLegalMoves(b, player);
  if (!moves.length) return null;
  const maximizing = player === 'white';
  let best = maximizing ? -Infinity : Infinity;
  let bestMove = moves[0];

  for (const m of moves) {
    const nb = applyMove(b, m.fromRow, m.fromCol, m.toRow, m.toCol, player);
    const score = minimax(nb, depth-1, -Infinity, Infinity, !maximizing);
    if (maximizing ? score > best : score < best) {
      best = score;
      bestMove = m;
    }
  }
  return bestMove;
}

function getAiMove() {
  const moves = getAllLegalMoves(board, aiColor);
  if (!moves.length) return null;
  if (aiDifficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }
  const depth = aiDifficulty === 'medium' ? 2 : 4;
  return getBestMove(board, aiColor, depth);
}

// ── AI Scheduling ────────────────────────────────────────────────
function scheduleAiMove() {
  if (gameOver || aiThinking) return;
  aiThinking = true;
  thinkingEl.style.display = 'block';
  setTimeout(() => {
    const m = getAiMove();
    thinkingEl.style.display = 'none';
    aiThinking = false;
    if (m) executeMove(m.fromRow, m.fromCol, m.toRow, m.toCol);
  }, aiDifficulty === 'hard' ? 200 : 80);
}

// ── Execute Move ─────────────────────────────────────────────────
function executeMove(fromR, fromC, toR, toC) {
  if (gameOver) return;
  const piece    = board[fromR][fromC];
  const captured = board[toR][toC];

  // Save history
  moveHistory.push({
    from:{row:fromR,col:fromC}, to:{row:toR,col:toC},
    piece, captured,
    capturedWhite:[...capturedWhite], capturedBlack:[...capturedBlack],
    player:currentPlayer, whiteKingPos:{...whiteKingPos}, blackKingPos:{...blackKingPos}
  });

  // ── King captured → immediate win ──────────────────────
  if (captured && captured.toLowerCase() === 'k') {
    board[toR][toC] = piece;
    board[fromR][fromC] = null;
    lastMove = {from:{row:fromR,col:fromC},to:{row:toR,col:toC}};
    wins++;
    saveWins();
    gameOver = true;
    updateDisplay();
    drawBoard();
    if (soundEnabled && window.GameSounds) GameSounds.chess.checkmate();
    const winner = currentPlayer === 'white' ? 'White' : 'Black';
    setTimeout(() => showEndModal(`${winner} wins! 👑`, `The King was captured!`), 150);
    return;
  }
  // Track captures
  if (captured) {
    isWhitePiece(captured) ? capturedBlack.push(captured) : capturedWhite.push(captured);
    if (soundEnabled && window.GameSounds) GameSounds.chess.capture();
  }

  // Apply move
  board[toR][toC] = piece;
  board[fromR][fromC] = null;

  // Update king tracking
  if (piece === 'K') whiteKingPos = {row:toR,col:toC};
  if (piece === 'k') blackKingPos = {row:toR,col:toC};

    // Pawn promotion
  const wasPromotion = (piece==='P' && toR===0) || (piece==='p' && toR===7);
  if (piece==='P' && toR===0) board[toR][toC]='Q';
  if (piece==='p' && toR===7) board[toR][toC]='q';
  if (wasPromotion && soundEnabled && window.GameSounds) GameSounds.chess.promotion();
  lastMove = {from:{row:fromR,col:fromC},to:{row:toR,col:toC}};
  selectedSq = null;
  validMoves = [];
  currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
  // Check / checkmate / stalemate
  isCheck = isKingInCheck(board, currentPlayer);
  const legalMoves = getAllLegalMoves(board, currentPlayer);
  updateDisplay();
  drawBoard();
  if (!captured && !wasPromotion && soundEnabled && window.GameSounds) GameSounds.chess.move();
  if (isCheck && legalMoves.length > 0 && soundEnabled && window.GameSounds) GameSounds.chess.check();
  if (legalMoves.length === 0) {
    gameOver = true;
    if (isCheck) {
      const winner = currentPlayer === 'white' ? 'Black' : 'White';
      wins++;
      saveWins();
      if (soundEnabled && window.GameSounds) GameSounds.chess.checkmate();
      setTimeout(() => showEndModal(`Checkmate! ${winner} wins! 🎉`, `No legal moves remain.`), 150);
    } else {
      setTimeout(() => showEndModal(`Stalemate! 🤝`, `No legal moves — it's a draw.`), 150);
    }
    return;
  }

  // AI turn
  if (gameMode === '1p' && currentPlayer === aiColor) {
    scheduleAiMove();
  }
}

// ── Show End Modal ───────────────────────────────────────────────
function showEndModal(title, sub) {
  gemTitle.textContent = title;
  gemSub.textContent   = sub;
  gemWins.textContent  = `Total wins: ${wins}`;
  gameEndModal.classList.add('visible');
}

// ── Undo ─────────────────────────────────────────────────────────
function undoMove() {
  if (gameOver || moveHistory.length === 0) return;
  // In 1P mode, undo both the AI move and the human move
  const undoCount = (gameMode === '1p' && moveHistory.length >= 2) ? 2 : 1;
  for (let i = 0; i < undoCount; i++) {
    if (!moveHistory.length) break;
    const last = moveHistory.pop();
    board[last.from.row][last.from.col] = last.piece;
    board[last.to.row][last.to.col]     = last.captured;
    capturedWhite = last.capturedWhite;
    capturedBlack = last.capturedBlack;
    currentPlayer = last.player;
    whiteKingPos  = last.whiteKingPos;
    blackKingPos  = last.blackKingPos;
  }
  lastMove   = moveHistory.length ? {from:moveHistory[moveHistory.length-1].from, to:moveHistory[moveHistory.length-1].to} : null;
  selectedSq = null;
  validMoves = [];
  isCheck    = isKingInCheck(board, currentPlayer);
  gameOver   = false;
  updateDisplay();
  drawBoard();
}

// ── Display ──────────────────────────────────────────────────────
function updateDisplay() {
  turnDisplay.textContent = currentPlayer === 'white' ? "White's Turn" : "Black's Turn";
  turnDisplay.style.color = currentPlayer === 'white' ? '#fff5e6' : '#aaa';
  whiteCapturedEl.textContent = capturedWhite.map(p=>GLYPHS[p]).join(' ');
  blackCapturedEl.textContent = capturedBlack.map(p=>GLYPHS[p]).join(' ');
  if (isCheck) {
    gameStatus.textContent = `⚠️ ${currentPlayer.charAt(0).toUpperCase()+currentPlayer.slice(1)} is in CHECK!`;
    gameStatus.style.color = '#dc2626';
  } else {
    gameStatus.textContent = '';
  }
}

// ── Draw Board ───────────────────────────────────────────────────
function drawBoard() {
  // Squares
  for (let r=0;r<BOARD_SZ;r++) for (let c=0;c<BOARD_SZ;c++) {
    ctx.fillStyle = (r+c)%2===0 ? COL_LIGHT : COL_DARK;
    ctx.fillRect(c*SQ, r*SQ, SQ, SQ);
  }
  // Last move highlight
  if (lastMove) {
    ctx.fillStyle = COL_LASTFROM;
    ctx.fillRect(lastMove.from.col*SQ, lastMove.from.row*SQ, SQ, SQ);
    ctx.fillStyle = COL_LASTTO;
    ctx.fillRect(lastMove.to.col*SQ, lastMove.to.row*SQ, SQ, SQ);
  }
  // Selected
  if (selectedSq) {
    ctx.fillStyle = COL_SEL;
    ctx.fillRect(selectedSq.col*SQ, selectedSq.row*SQ, SQ, SQ);
  }
  // Valid moves
  for (const m of validMoves) {
    ctx.fillStyle = COL_MOVE;
    ctx.fillRect(m.col*SQ, m.row*SQ, SQ, SQ);
  }
  // Check highlight
  if (isCheck) {
    const kp = currentPlayer==='white' ? whiteKingPos : blackKingPos;
    if (kp) {
      ctx.fillStyle = COL_CHECK;
      ctx.fillRect(kp.col*SQ, kp.row*SQ, SQ, SQ);
    }
  }
  // Pieces
  ctx.font = `${PSIZ}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let r=0;r<BOARD_SZ;r++) for (let c=0;c<BOARD_SZ;c++) {
    const p = board[r][c];
    if (!p) continue;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText(GLYPHS[p], c*SQ+SQ/2+2, r*SQ+SQ/2+2);
    ctx.fillStyle = isWhitePiece(p) ? '#fff5e6' : '#1a1a1a';
    ctx.fillText(GLYPHS[p], c*SQ+SQ/2, r*SQ+SQ/2);
  }
  // Rank/file labels
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const files = 'abcdefgh';
  for (let i=0;i<8;i++) {
    ctx.fillStyle = i%2===0 ? COL_DARK : COL_LIGHT;
    ctx.fillText(files[i], i*SQ+3, 7*SQ+SQ-14);
    ctx.fillStyle = i%2===0 ? COL_LIGHT : COL_DARK;
    ctx.fillText(8-i, 2, i*SQ+3);
  }
}

// ── Click Handler ────────────────────────────────────────────────
canvas.addEventListener('click', e => {
  if (gameOver || aiThinking) return;
  if (gameMode === '1p' && currentPlayer === aiColor) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const col = Math.floor((e.clientX - rect.left) * scaleX / SQ);
  const row = Math.floor((e.clientY - rect.top)  * scaleY / SQ);
  if (row<0||row>=BOARD_SZ||col<0||col>=BOARD_SZ) return;

  const vm = validMoves.find(m=>m.row===row&&m.col===col);
  if (vm && selectedSq) {
    executeMove(selectedSq.row, selectedSq.col, row, col);
    return;
  }

  const piece = board[row][col];
  if (piece && isOwnPiece(piece, currentPlayer)) {
    selectedSq = {row,col};
    validMoves = getLegalMoves(board, row, col, currentPlayer);
    drawBoard();
  } else {
    selectedSq = null;
    validMoves = [];
    drawBoard();
  }
});

// Touch support
canvas.addEventListener('touchstart', e => { e.preventDefault(); }, {passive:false});
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  canvas.dispatchEvent(new MouseEvent('click', {clientX:t.clientX, clientY:t.clientY}));
}, {passive:false});

// ── Sound Toggle ─────────────────────────────────────────────────
function toggleSound() {
  soundEnabled = !soundEnabled;
  if (muteBtn) muteBtn.textContent = soundEnabled ? '🔊 Sound' : '🔇 Muted';
  if (window.GameSounds) GameSounds.setEnabled(soundEnabled);
}
// ── Button Listeners ─────────────────────────────────────────────
undoBtn.addEventListener('click', undoMove);
resetStatsBtn.addEventListener('click', () => {
  if (confirm('Reset all win statistics?')) { wins=0; saveWins(); }
});

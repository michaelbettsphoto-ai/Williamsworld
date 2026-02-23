// Checkers — William's World
// 1P vs AI (Easy/Medium/Hard) + 2P local mode
// AI: Easy=random, Medium=minimax 4-ply, Hard=minimax+αβ 8-ply

const canvas   = document.getElementById('gameCanvas');
const ctx      = canvas.getContext('2d');
const BOARD_SZ = 8;
const SQ       = canvas.width / BOARD_SZ;

const EMPTY=0,RED=1,BLACK=2,RED_K=3,BLACK_K=4;
const C_LIGHT='#e6d4b8',C_DARK='#5c3d1e';
const C_SEL='rgba(125,255,180,0.6)',C_MOVE='rgba(255,211,110,0.55)';
const C_RED='#dc2626',C_BLK='#1a1a1a',C_KING='#ffd700';

let board,currentPlayer,selectedSq,validMoves;
let wins=0,gameOver=false,mustJumpFrom=null;
let gameMode=null,aiDifficulty=null,humanColor=null,aiColor=null,aiThinking=false;

const modeScreen   = document.getElementById('modeScreen');
const gameScreen   = document.getElementById('gameScreen');
const diffRow      = document.getElementById('diffRow');
const colorRow     = document.getElementById('colorRow');
const startGameBtn = document.getElementById('startGameBtn');
const turnDisplay  = document.getElementById('turnDisplay');
const winsDisplay  = document.getElementById('wins');
const aiBadge      = document.getElementById('aiBadge');
const thinkingEl   = document.getElementById('thinkingIndicator');
const gameEndModal = document.getElementById('gameEndModal');
const gemTitle     = document.getElementById('gemTitle');
const gemSub       = document.getElementById('gemSub');
const gemWins      = document.getElementById('gemWins');

// ── Mode Select ─────────────────────────────────────────────────
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
  aiColor = humanColor === 'red' ? 'black' : 'red';
  modeScreen.style.display = 'none';
  gameScreen.classList.add('visible');
  if (gameMode === '1p') {
    const labels = { easy: '🌱 Easy', medium: '⚔️ Medium', hard: '🔥 Hard' };
    aiBadge.textContent = labels[aiDifficulty];
    aiBadge.style.display = 'inline-block';
  } else {
    aiBadge.style.display = 'none';
  }
  loadWins();
  newGame();
}

function returnToModeScreen() {
  gameEndModal.classList.remove('visible');
  gameScreen.classList.remove('visible');
  modeScreen.style.display = 'flex';
  document.querySelectorAll('#modeScreen .mode-card').forEach(c => c.classList.remove('selected'));
  diffRow.classList.remove('visible');
  colorRow.classList.remove('visible');
  startGameBtn.classList.remove('visible');
  gameMode = null; aiDifficulty = null; humanColor = null;
}

function rematch() { gameEndModal.classList.remove('visible'); newGame(); }

// ── Game Init ───────────────────────────────────────────────────
function newGame() {
  board = Array.from({ length: 8 }, () => Array(8).fill(EMPTY));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) if ((r+c)%2===1) board[r][c] = BLACK;
  for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) if ((r+c)%2===1) board[r][c] = RED;
  currentPlayer = 'red'; selectedSq = null; validMoves = []; mustJumpFrom = null;
  gameOver = false; aiThinking = false; thinkingEl.style.display = 'none';
  updateDisplay(); drawBoard();
  if (gameMode === '1p' && aiColor === 'red') scheduleAiMove();
}

function loadWins() { wins = parseInt(localStorage.getItem('ww-checkers-wins') || '0'); winsDisplay.textContent = wins; }
function saveWins()  { localStorage.setItem('ww-checkers-wins', wins); winsDisplay.textContent = wins; }

// ── Piece Helpers ────────────────────────────────────────────────
const isRed   = p => p===RED   || p===RED_K;
const isBlack = p => p===BLACK || p===BLACK_K;
const isKing  = p => p===RED_K || p===BLACK_K;
const isOwn   = (p, player) => player==='red' ? isRed(p) : isBlack(p);
const isOpp   = (p, player) => player==='red' ? isBlack(p) : isRed(p);

function promoteIfNeeded(b, r, c) {
  if (b[r][c]===RED   && r===0) b[r][c] = RED_K;
  if (b[r][c]===BLACK && r===7) b[r][c] = BLACK_K;
}

// ── Move Generation ──────────────────────────────────────────────
function getMovesForPiece(b, r, c, player) {
  const p = b[r][c];
  if (!p || !isOwn(p, player)) return { moves: [], jumps: [] };
  const dirs = [];
  if (player==='red'   || isKing(p)) dirs.push(-1);
  if (player==='black' || isKing(p)) dirs.push(1);
  const moves = [], jumps = [];
  for (const dr of dirs) {
    for (const dc of [-1, 1]) {
      const nr = r+dr, nc = c+dc;
      if (nr<0||nr>=8||nc<0||nc>=8) continue;
      if (b[nr][nc]===EMPTY) {
        moves.push({ row:nr, col:nc, jumpRow:null, jumpCol:null });
      } else if (isOpp(b[nr][nc], player)) {
        const jr = nr+dr, jc = nc+dc;
        if (jr>=0&&jr<8&&jc>=0&&jc<8&&b[jr][jc]===EMPTY)
          jumps.push({ row:jr, col:jc, jumpRow:nr, jumpCol:nc });
      }
    }
  }
  return { moves, jumps };
}

function getAllMoves(b, player) {
  let allMoves = [], allJumps = [];
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    if (isOwn(b[r][c], player)) {
      const { moves, jumps } = getMovesForPiece(b, r, c, player);
      moves.forEach(m => allMoves.push({ fromRow:r, fromCol:c, ...m }));
      jumps.forEach(j => allJumps.push({ fromRow:r, fromCol:c, ...j }));
    }
  }
  return allJumps.length ? allJumps : allMoves;
}

function getJumpsForPiece(b, r, c, player) { return getMovesForPiece(b, r, c, player).jumps; }

function applyMove(b, m) {
  const nb = b.map(row => [...row]);
  nb[m.row][m.col] = nb[m.fromRow][m.fromCol];
  nb[m.fromRow][m.fromCol] = EMPTY;
  if (m.jumpRow !== null) nb[m.jumpRow][m.jumpCol] = EMPTY;
  promoteIfNeeded(nb, m.row, m.col);
  return nb;
}

// ── Evaluation ──────────────────────────────────────────────────
function evaluateBoard(b) {
  let score = 0;
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    const p = b[r][c]; if (!p) continue;
    if (p===RED)     score += 100 + (7-r)*5;
    else if (p===BLACK)   score -= 100 + r*5;
    else if (p===RED_K)   score += 160;
    else if (p===BLACK_K) score -= 160;
  }
  return score;
}

// ── Minimax + Alpha-Beta ─────────────────────────────────────────
function minimax(b, depth, alpha, beta, maximizing) {
  const player = maximizing ? 'red' : 'black';
  const moves  = getAllMoves(b, player);
  if (depth===0 || moves.length===0) return evaluateBoard(b);
  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      best = Math.max(best, minimax(applyMove(b,m), depth-1, alpha, beta, false));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      best = Math.min(best, minimax(applyMove(b,m), depth-1, alpha, beta, true));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getBestMove(b, player, depth) {
  const moves = getAllMoves(b, player);
  if (!moves.length) return null;
  const maximizing = player === 'red';
  let best = maximizing ? -Infinity : Infinity, bestMove = moves[0];
  for (const m of moves) {
    const score = minimax(applyMove(b,m), depth-1, -Infinity, Infinity, !maximizing);
    if (maximizing ? score > best : score < best) { best = score; bestMove = m; }
  }
  return bestMove;
}

function getAiMove() {
  const moves = getAllMoves(board, aiColor);
  if (!moves.length) return null;
  if (aiDifficulty === 'easy') return moves[Math.floor(Math.random() * moves.length)];
  const depth = aiDifficulty === 'medium' ? 4 : 8;
  return getBestMove(board, aiColor, depth);
}

function scheduleAiMove() {
  if (gameOver || aiThinking) return;
  aiThinking = true; thinkingEl.style.display = 'block';
  const delay = aiDifficulty === 'hard' ? 300 : 100;
  setTimeout(() => {
    const m = getAiMove();
    thinkingEl.style.display = 'none'; aiThinking = false;
    if (m) executeMove(m);
  }, delay);
}

// ── Execute Move ─────────────────────────────────────────────────
function executeMove(m) {
  if (gameOver) return;
  const isCapture = m.jumpRow !== null;
  board[m.row][m.col] = board[m.fromRow][m.fromCol];
  board[m.fromRow][m.fromCol] = EMPTY;
  if (isCapture) board[m.jumpRow][m.jumpCol] = EMPTY;
  promoteIfNeeded(board, m.row, m.col);
  selectedSq = null; validMoves = [];

  if (isCapture) {
    const moreJumps = getJumpsForPiece(board, m.row, m.col, currentPlayer);
    if (moreJumps.length > 0) {
      mustJumpFrom = { row: m.row, col: m.col };
      selectedSq   = { row: m.row, col: m.col };
      validMoves   = moreJumps;
      updateDisplay(); drawBoard();
      if (gameMode === '1p' && currentPlayer === aiColor) scheduleAiMultiJump(m.row, m.col);
      return;
    }
  }

  mustJumpFrom = null;
  currentPlayer = currentPlayer === 'red' ? 'black' : 'red';

  const redCount   = board.flat().filter(p => isRed(p)).length;
  const blackCount = board.flat().filter(p => isBlack(p)).length;
  const nextMoves  = getAllMoves(board, currentPlayer);

  updateDisplay(); drawBoard();

  if (redCount === 0) {
    gameOver = true; wins++; saveWins();
    setTimeout(() => showEndModal('⚫ Black Wins! 🎉', 'All red pieces captured!'), 150);
    return;
  }
  if (blackCount === 0) {
    gameOver = true; wins++; saveWins();
    setTimeout(() => showEndModal('🔴 Red Wins! 🎉', 'All black pieces captured!'), 150);
    return;
  }
  if (nextMoves.length === 0) {
    gameOver = true;
    const winner = currentPlayer === 'red' ? 'Black' : 'Red';
    setTimeout(() => showEndModal(`${winner} Wins! 🎉`, `${currentPlayer} has no moves left!`), 150);
    return;
  }

  if (gameMode === '1p' && currentPlayer === aiColor) scheduleAiMove();
}

function scheduleAiMultiJump(r, c) {
  aiThinking = true; thinkingEl.style.display = 'block';
  setTimeout(() => {
    const jumps = getJumpsForPiece(board, r, c, aiColor);
    thinkingEl.style.display = 'none'; aiThinking = false;
    if (jumps.length) {
      const j = jumps[Math.floor(Math.random() * jumps.length)];
      executeMove({ fromRow: r, fromCol: c, ...j });
    }
  }, 200);
}

// ── End Modal ────────────────────────────────────────────────────
function showEndModal(title, sub) {
  gemTitle.textContent = title;
  gemSub.textContent   = sub;
  gemWins.textContent  = `Total wins: ${wins}`;
  gameEndModal.classList.add('visible');
}

// ── Display ──────────────────────────────────────────────────────
function updateDisplay() {
  turnDisplay.textContent = currentPlayer === 'red' ? "Red's Turn" : "Black's Turn";
  turnDisplay.style.color = currentPlayer === 'red' ? '#dc2626' : '#aaa';
}

// ── Draw ─────────────────────────────────────────────────────────
function drawBoard() {
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    ctx.fillStyle = (r+c)%2===0 ? C_LIGHT : C_DARK;
    ctx.fillRect(c*SQ, r*SQ, SQ, SQ);
  }
  for (const m of validMoves) { ctx.fillStyle = C_MOVE; ctx.fillRect(m.col*SQ, m.row*SQ, SQ, SQ); }
  if (selectedSq) { ctx.fillStyle = C_SEL; ctx.fillRect(selectedSq.col*SQ, selectedSq.row*SQ, SQ, SQ); }
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    const p = board[r][c]; if (!p) continue;
    const cx = c*SQ+SQ/2, cy = r*SQ+SQ/2, rad = SQ*0.38;
    ctx.beginPath(); ctx.arc(cx+2, cy+2, rad, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI*2);
    ctx.fillStyle = isRed(p) ? C_RED : C_BLK; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.stroke();
    if (isKing(p)) {
      ctx.font = `${SQ*0.38}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = C_KING; ctx.fillText('♛', cx, cy);
    }
  }
}

// ── Input ────────────────────────────────────────────────────────
canvas.addEventListener('click', e => {
  if (gameOver || aiThinking) return;
  if (gameMode === '1p' && currentPlayer === aiColor) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
  const col = Math.floor((e.clientX - rect.left) * scaleX / SQ);
  const row = Math.floor((e.clientY - rect.top)  * scaleY / SQ);
  if (row<0||row>=8||col<0||col>=8) return;

  const vm = validMoves.find(m => m.row===row && m.col===col);
  if (vm && selectedSq) { executeMove({ fromRow: selectedSq.row, fromCol: selectedSq.col, ...vm }); return; }

  if (mustJumpFrom) {
    if (row===mustJumpFrom.row && col===mustJumpFrom.col) {
      selectedSq = { row, col };
      validMoves = getJumpsForPiece(board, row, col, currentPlayer);
      drawBoard();
    }
    return;
  }

  if (board[row][col] && isOwn(board[row][col], currentPlayer)) {
    selectedSq = { row, col };
    const allMoves = getAllMoves(board, currentPlayer);
    const hasJumps = allMoves.some(m => m.jumpRow !== null);
    validMoves = hasJumps
      ? getJumpsForPiece(board, row, col, currentPlayer)
      : getMovesForPiece(board, row, col, currentPlayer).moves;
    drawBoard();
  } else {
    selectedSq = null; validMoves = []; drawBoard();
  }
});

canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  canvas.dispatchEvent(new MouseEvent('click', { clientX: t.clientX, clientY: t.clientY }));
}, { passive: false });

document.getElementById('newGameBtn').addEventListener('click', newGame);
document.getElementById('resetStatsBtn').addEventListener('click', () => {
  if (confirm('Reset all win statistics?')) { wins = 0; saveWins(); }
});

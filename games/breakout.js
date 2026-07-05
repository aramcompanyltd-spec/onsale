(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const stateEl = document.getElementById('gamestate');
  const playBtn = document.getElementById('playBtn');

  const paddleW = 90, paddleH = 12;
  const ballR = 7;
  const rows = 5, cols = 8;
  const brickW = 58, brickH = 18, brickGap = 6, brickTop = 50;
  const brickLeft = (W - (cols * (brickW + brickGap) - brickGap)) / 2;

  let paddle, ball, bricks, score, lives, running, loopId;
  const colors = ['#39ff88','#2fd66f','#ffb000','#e8ecf1','#5a6472'];

  function buildBricks() {
    const b = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        b.push({ x: brickLeft + c*(brickW+brickGap), y: brickTop + r*(brickH+brickGap), alive: true, color: colors[r % colors.length] });
      }
    }
    return b;
  }

  function reset() {
    paddle = { x: W/2 - paddleW/2 };
    ball = { x: W/2, y: H - 60, vx: 3.2, vy: -4 };
    bricks = buildBricks();
    score = 0; lives = 3;
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    stateEl.textContent = '';
  }

  function draw() {
    ctx.fillStyle = '#060708';
    ctx.fillRect(0,0,W,H);

    bricks.forEach(b => {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, brickW, brickH);
    });

    ctx.fillStyle = '#39ff88';
    ctx.fillRect(paddle.x, H-24, paddleW, paddleH);

    ctx.beginPath();
    ctx.fillStyle = '#e8ecf1';
    ctx.arc(ball.x, ball.y, ballR, 0, Math.PI*2);
    ctx.fill();
  }

  function update() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x <= ballR || ball.x >= W-ballR) ball.vx *= -1;
    if (ball.y <= ballR) ball.vy *= -1;

    // paddle collision
    if (ball.y + ballR >= H-24 && ball.x >= paddle.x && ball.x <= paddle.x + paddleW && ball.vy > 0) {
      const hit = (ball.x - (paddle.x + paddleW/2)) / (paddleW/2);
      ball.vy = -Math.abs(ball.vy);
      ball.vx = hit * 5;
    }

    // brick collision
    for (const b of bricks) {
      if (!b.alive) continue;
      if (ball.x + ballR > b.x && ball.x - ballR < b.x + brickW &&
          ball.y + ballR > b.y && ball.y - ballR < b.y + brickH) {
        b.alive = false;
        ball.vy *= -1;
        score += 10;
        scoreEl.textContent = score;
        break;
      }
    }

    // lose life
    if (ball.y > H) {
      lives--;
      livesEl.textContent = lives;
      if (lives <= 0) { endGame(false); return; }
      ball.x = W/2; ball.y = H-60; ball.vx = 3.2; ball.vy = -4;
    }

    // win
    if (bricks.every(b => !b.alive)) { endGame(true); return; }

    draw();
    loopId = requestAnimationFrame(update);
  }

  function endGame(won) {
    running = false;
    stateEl.textContent = won ? `클리어! 🎉 점수 ${score} — 다시 하려면 PLAY` : `GAME OVER — 점수 ${score} — 다시 하려면 PLAY`;
  }

  function start() {
    if (loopId) cancelAnimationFrame(loopId);
    reset();
    running = true;
    draw();
    loopId = requestAnimationFrame(update);
  }

  playBtn.addEventListener('click', start);

  function movePaddleTo(clientX) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (clientX - rect.left) * scaleX;
    paddle.x = Math.max(0, Math.min(W-paddleW, x - paddleW/2));
  }

  canvas.addEventListener('mousemove', e => movePaddleTo(e.clientX));
  canvas.addEventListener('touchmove', e => { e.preventDefault(); movePaddleTo(e.touches[0].clientX); }, { passive: false });

  window.addEventListener('keydown', e => {
    if (['ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    if (e.key === 'ArrowLeft') paddle.x = Math.max(0, paddle.x - 28);
    if (e.key === 'ArrowRight') paddle.x = Math.min(W-paddleW, paddle.x + 28);
  });

  reset();
  draw();
})();

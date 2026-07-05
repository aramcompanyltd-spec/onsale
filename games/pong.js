(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const playerScoreEl = document.getElementById('scoreP1');
  const cpuScoreEl = document.getElementById('scoreP2');
  const stateEl = document.getElementById('gamestate');
  const playBtn = document.getElementById('playBtn');

  const paddleW = 10, paddleH = 70;
  let player, cpu, ball, running, loopId, sP=0, sC=0;

  function reset() {
    player = { y: H/2 - paddleH/2 };
    cpu = { y: H/2 - paddleH/2 };
    ball = { x: W/2, y: H/2, vx: 4.5 * (Math.random()>0.5?1:-1), vy: (Math.random()*4 - 2) };
    stateEl.textContent = '';
  }

  function draw() {
    ctx.fillStyle = '#060708';
    ctx.fillRect(0,0,W,H);

    // center line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([6,10]);
    ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke();
    ctx.setLineDash([]);

    // paddles
    ctx.fillStyle = '#39ff88';
    ctx.fillRect(20, player.y, paddleW, paddleH);
    ctx.fillStyle = '#ffb000';
    ctx.fillRect(W-30, cpu.y, paddleW, paddleH);

    // ball
    ctx.fillStyle = '#e8ecf1';
    ctx.fillRect(ball.x-6, ball.y-6, 12, 12);
  }

  function update() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= 6 || ball.y >= H-6) ball.vy *= -1;

    // player paddle collision
    if (ball.x - 6 <= 20 + paddleW && ball.y >= player.y && ball.y <= player.y + paddleH && ball.vx < 0) {
      ball.vx *= -1.05;
      ball.vy += (ball.y - (player.y + paddleH/2)) * 0.15;
    }
    // cpu paddle collision
    if (ball.x + 6 >= W-30 && ball.y >= cpu.y && ball.y <= cpu.y + paddleH && ball.vx > 0) {
      ball.vx *= -1.05;
      ball.vy += (ball.y - (cpu.y + paddleH/2)) * 0.15;
    }

    // score
    if (ball.x < 0) { sC++; cpuScoreEl.textContent = sC; serveReset(); }
    if (ball.x > W) { sP++; playerScoreEl.textContent = sP; serveReset(); }

    // cpu AI — tracks ball with limited speed
    const cpuCenter = cpu.y + paddleH/2;
    const targetY = ball.y;
    const speed = 3.6;
    if (cpuCenter < targetY - 10) cpu.y += speed;
    else if (cpuCenter > targetY + 10) cpu.y -= speed;
    cpu.y = Math.max(0, Math.min(H-paddleH, cpu.y));

    draw();

    if (sP >= 7 || sC >= 7) { endMatch(); return; }
    loopId = requestAnimationFrame(update);
  }

  function serveReset() {
    ball.x = W/2; ball.y = H/2;
    ball.vx = 4.5 * (Math.random()>0.5?1:-1);
    ball.vy = Math.random()*4 - 2;
  }

  function endMatch() {
    running = false;
    stateEl.textContent = (sP > sC ? '승리! 🏆 ' : '패배 — ') + `${sP} : ${sC} — 다시 시작하려면 PLAY`;
  }

  function start() {
    if (loopId) cancelAnimationFrame(loopId);
    sP = 0; sC = 0;
    playerScoreEl.textContent = 0; cpuScoreEl.textContent = 0;
    reset();
    running = true;
    loopId = requestAnimationFrame(update);
  }

  playBtn.addEventListener('click', start);

  // mouse / touch control for player paddle
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const y = (e.clientY - rect.top) * scaleY;
    player.y = Math.max(0, Math.min(H-paddleH, y - paddleH/2));
  });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const y = (e.touches[0].clientY - rect.top) * scaleY;
    player.y = Math.max(0, Math.min(H-paddleH, y - paddleH/2));
  }, { passive: false });

  window.addEventListener('keydown', e => {
    if (['ArrowUp','ArrowDown'].includes(e.key)) e.preventDefault();
    if (e.key === 'ArrowUp') player.y = Math.max(0, player.y - 30);
    if (e.key === 'ArrowDown') player.y = Math.min(H-paddleH, player.y + 30);
  });

  reset();
  draw();
})();

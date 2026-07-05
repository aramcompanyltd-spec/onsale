(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const cell = 20;
  const cols = canvas.width / cell;
  const rows = canvas.height / cell;

  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const stateEl = document.getElementById('gamestate');
  const playBtn = document.getElementById('playBtn');

  let snake, dir, nextDir, food, score, best, running, loopId, speedMs;

  best = Number(localStorage.getItem('fa_snake_best') || 0);
  bestEl.textContent = best;

  function reset() {
    snake = [{x: 8, y: 10}, {x: 7, y: 10}, {x: 6, y: 10}];
    dir = {x: 1, y: 0};
    nextDir = {x: 1, y: 0};
    score = 0;
    speedMs = 130;
    placeFood();
    scoreEl.textContent = score;
    stateEl.textContent = '';
  }

  function placeFood() {
    let ok = false;
    while (!ok) {
      food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
      ok = !snake.some(s => s.x === food.x && s.y === food.y);
    }
  }

  function draw() {
    ctx.fillStyle = '#060708';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath(); ctx.moveTo(x*cell,0); ctx.lineTo(x*cell,canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath(); ctx.moveTo(0,y*cell); ctx.lineTo(canvas.width,y*cell); ctx.stroke();
    }

    // food
    ctx.fillStyle = '#ffb000';
    ctx.shadowColor = '#ffb000';
    ctx.shadowBlur = 8;
    ctx.fillRect(food.x*cell+3, food.y*cell+3, cell-6, cell-6);
    ctx.shadowBlur = 0;

    // snake
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#39ff88' : '#1f8a4c';
      ctx.fillRect(s.x*cell+1, s.y*cell+1, cell-2, cell-2);
    });
  }

  function step() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      if (speedMs > 60) speedMs -= 2;
      placeFood();
    } else {
      snake.pop();
    }

    draw();
    loopId = setTimeout(step, speedMs);
  }

  function gameOver() {
    running = false;
    stateEl.textContent = 'GAME OVER — 다시 시작하려면 PLAY를 누르세요';
    if (score > best) {
      best = score;
      localStorage.setItem('fa_snake_best', best);
      bestEl.textContent = best;
    }
  }

  function start() {
    if (loopId) clearTimeout(loopId);
    reset();
    running = true;
    draw();
    loopId = setTimeout(step, speedMs);
  }

  playBtn.addEventListener('click', start);

  window.addEventListener('keydown', e => {
    if (!running && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) { start(); }
    const map = {
      ArrowUp: {x:0,y:-1}, ArrowDown: {x:0,y:1},
      ArrowLeft: {x:-1,y:0}, ArrowRight: {x:1,y:0}
    };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    if (d.x === -dir.x && d.y === -dir.y) return; // no reverse
    nextDir = d;
  });

  // touch buttons
  document.querySelectorAll('[data-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      const map = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
      const d = map[btn.dataset.dir];
      if (d.x === -dir.x && d.y === -dir.y) return;
      nextDir = d;
      if (!running) start();
    });
  });

  reset();
  draw();
})();

const MEMORY_LEVELS = [
  { cells: 4, showMs: 4000 },
  { cells: 5, showMs: 4000 },
  { cells: 6, showMs: 3000 },
  { cells: 7, showMs: 3000 },
  { cells: 8, showMs: 2500 }
];

const COLOR_NAMES = [
  { name: "КРАСНЫЙ", key: "red", hex: "#EF4444" },
  { name: "СИНИЙ", key: "blue", hex: "#007BFF" },
  { name: "ЗЕЛЕНЫЙ", key: "green", hex: "#22C55E" },
  { name: "ЖЕЛТЫЙ", key: "yellow", hex: "#FACC15" }
];

const ROUTE_LEVELS = [
  {
    size: 4,
    grid: [
      "....",
      ".K..",
      ".D..",
      ".F.."
    ],
    start: { x: 0, y: 0 },
    optimal: 6
  },
  {
    size: 5,
    grid: [
      ".....",
      ".#K..",
      ".#.#.",
      "..D..",
      "...F."
    ],
    start: { x: 0, y: 0 },
    optimal: 10
  },
  {
    size: 6,
    grid: [
      "......",
      ".#..K.",
      ".##.#.",
      "...#..",
      "..D...",
      "....F."
    ],
    start: { x: 0, y: 0 },
    optimal: 14
  }
];

function createMemoryGame(root, onDone) {
  const boardEl = root.querySelector("#memory-board");
  const statsEl = root.querySelector("#memory-stats");
  const msgEl = root.querySelector("#memory-message");
  const startBtn = root.querySelector("#memory-start");
  const checkBtn = root.querySelector("#memory-check");

  const GRID = 6;
  const TOTAL = GRID * GRID;
  let levelIdx = 0;
  let pattern = [];
  let selected = new Set();
  let showing = false;
  let phase = "idle";
  let gameScore = 0;

  const stats = {
    memoryScore: 0,
    accuracy: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalMissed: 0,
    averageResponseTime: 0,
    completedLevels: 0,
    correctionsCount: 0,
    responseTimes: []
  };

  function renderBoard() {
    boardEl.innerHTML = "";
    for (let i = 0; i < TOTAL; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "memory-cell";
      btn.dataset.i = String(i);
      btn.addEventListener("click", () => toggle(i, btn));
      boardEl.appendChild(btn);
    }
    updateStats();
  }

  function updateStats() {
    const lvl = MEMORY_LEVELS[levelIdx];
    statsEl.innerHTML = `
      <span>Level: ${levelIdx + 1}/5</span>
      <span>Score: ${gameScore}</span>
      <span>Accuracy: ${stats.accuracy}%</span>
    `;
    checkBtn.disabled = phase !== "pick" || selected.size !== (lvl?.cells || 0);
  }

  function randomPattern(n) {
    const set = new Set();
    while (set.size < n) set.add(Math.floor(Math.random() * TOTAL));
    return [...set];
  }

  let roundStart = 0;

  function beginLevel() {
    const cfg = MEMORY_LEVELS[levelIdx];
    pattern = randomPattern(cfg.cells);
    selected = new Set();
    showing = true;
    phase = "memorize";
    msgEl.textContent = "Смотри внимательно…";
    roundStart = Date.now();
    paintCells();
    checkBtn.disabled = true;
    setTimeout(() => {
      showing = false;
      phase = "pick";
      msgEl.textContent = "Повтори рисунок";
      paintCells();
      updateStats();
    }, cfg.showMs);
  }

  function paintCells(check = null) {
    boardEl.querySelectorAll(".memory-cell").forEach((btn, i) => {
      btn.className = "memory-cell";
      btn.disabled = showing || phase !== "pick";
      if (showing && pattern.includes(i)) btn.classList.add("memory-cell--show");
      else if (selected.has(i) && !check) btn.classList.add("memory-cell--picked");
      if (check) {
        if (check.correct.has(i)) btn.classList.add("memory-cell--ok");
        if (check.wrong.has(i)) btn.classList.add("memory-cell--bad");
        if (check.missed.has(i)) btn.classList.add("memory-cell--miss");
      }
    });
  }

  function toggle(i, btn) {
    if (phase !== "pick") return;
    if (selected.has(i)) {
      selected.delete(i);
      stats.correctionsCount++;
    } else selected.add(i);
    paintCells();
    updateStats();
  }

  function check() {
    const p = new Set(pattern);
    const correct = new Set();
    const wrong = new Set();
    selected.forEach((x) => (p.has(x) ? correct.add(x) : wrong.add(x)));
    const missed = new Set();
    p.forEach((x) => {
      if (!selected.has(x)) missed.add(x);
    });

    stats.totalCorrect += correct.size;
    stats.totalWrong += wrong.size;
    stats.totalMissed += missed.size;
    const total = stats.totalCorrect + stats.totalWrong + stats.totalMissed;
    stats.accuracy = total ? Math.round((stats.totalCorrect / total) * 100) : 0;
    stats.responseTimes.push(Date.now() - roundStart);

    phase = "checked";
    paintCells({ correct, wrong, missed });

    if (!wrong.size && !missed.size) {
      gameScore += (levelIdx + 1) * 20;
      stats.completedLevels++;
      msgEl.textContent = "Отлично! 🎉";
      setTimeout(() => {
        if (levelIdx >= MEMORY_LEVELS.length - 1) finish();
        else {
          levelIdx++;
          beginLevel();
        }
      }, 800);
    } else {
      msgEl.textContent = "Попробуй еще раз 🙌";
      setTimeout(() => beginLevel(), 1200);
    }
    updateStats();
  }

  function finish() {
    const rt = stats.responseTimes;
    stats.averageResponseTime = rt.length ? Math.round(rt.reduce((a, b) => a + b, 0) / rt.length) : 0;
    stats.memoryScore = Math.min(100, Math.round(stats.accuracy * 0.8 + stats.completedLevels * 4));
    onDone(stats);
  }

  startBtn.addEventListener("click", () => {
    levelIdx = 0;
    gameScore = 0;
    Object.assign(stats, {
      memoryScore: 0,
      accuracy: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalMissed: 0,
      averageResponseTime: 0,
      completedLevels: 0,
      correctionsCount: 0,
      responseTimes: []
    });
    startBtn.disabled = true;
    renderBoard();
    beginLevel();
  });

  checkBtn.addEventListener("click", check);
  renderBoard();
}

function createColorGame(root, ageGroup, onDone) {
  const wordEl = root.querySelector("#color-word");
  const optsEl = root.querySelector("#color-options");
  const statsEl = root.querySelector("#color-stats");
  const msgEl = root.querySelector("#color-message");

  const roundsTotal = ageGroup === "5-7" ? 6 : ageGroup === "8-12" ? 8 : 10;
  let round = 0;
  let current = null;
  let roundStart = 0;
  const stats = {
    colorCorrect: 0,
    colorWrong: 0,
    colorAccuracy: 0,
    averageReactionTime: 0,
    impulseErrors: 0,
    timeoutCount: 0,
    reactionTimes: []
  };

  function updateStats() {
    const done = stats.colorCorrect + stats.colorWrong;
    stats.colorAccuracy = done ? Math.round((stats.colorCorrect / done) * 100) : 0;
    statsEl.innerHTML = `
      <span>Раунд: ${round}/${roundsTotal}</span>
      <span>Точность: ${stats.colorAccuracy}%</span>
    `;
  }

  function nextRound() {
    if (round >= roundsTotal) {
      const rt = stats.reactionTimes;
      stats.averageReactionTime = rt.length ? Math.round(rt.reduce((a, b) => a + b, 0) / rt.length) : 0;
      onDone(stats);
      return;
    }
    round++;
    roundStart = Date.now();
    const wordIdx = Math.floor(Math.random() * COLOR_NAMES.length);
    let colorIdx = Math.floor(Math.random() * COLOR_NAMES.length);
    while (colorIdx === wordIdx) colorIdx = Math.floor(Math.random() * COLOR_NAMES.length);
    current = { word: COLOR_NAMES[wordIdx], color: COLOR_NAMES[colorIdx] };
    wordEl.textContent = current.word.name;
    wordEl.style.color = current.color.hex;
    msgEl.textContent = "Выбери цвет букв";
    updateStats();
  }

  if (!optsEl.dataset.ready) {
    optsEl.dataset.ready = "1";
    optsEl.innerHTML = COLOR_NAMES.map(
      (c) =>
        `<button type="button" class="color-btn" data-key="${c.key}" style="border-color:${c.hex}">${c.name.charAt(0) + c.name.slice(1).toLowerCase()}</button>`
    ).join("");
    optsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".color-btn");
      if (!btn || !current) return;
      const c = COLOR_NAMES.find((x) => x.key === btn.dataset.key);
      if (!c) return;
      const ms = Date.now() - roundStart;
      stats.reactionTimes.push(ms);
      if (c.key === current.color.key) {
        stats.colorCorrect++;
        msgEl.textContent = "Верно! ✅";
      } else {
        stats.colorWrong++;
        if (c.key === current.word.key) stats.impulseErrors++;
        msgEl.textContent = "Почти! Смотри на цвет букв 🎯";
      }
      updateStats();
      setTimeout(nextRound, 700);
      current = null;
    });
  }

  round = 0;
  stats.colorCorrect = 0;
  stats.colorWrong = 0;
  stats.colorAccuracy = 0;
  stats.averageReactionTime = 0;
  stats.impulseErrors = 0;
  stats.timeoutCount = 0;
  stats.reactionTimes = [];
  nextRound();
}

function parseRouteLevel(level) {
  const cells = [];
  for (let y = 0; y < level.size; y++) {
    for (let x = 0; x < level.size; x++) {
      const ch = level.grid[y][x];
      cells.push({ x, y, type: ch === "#" ? "wall" : ch === "." ? "empty" : ch });
    }
  }
  return cells;
}

var routeGameApi = null;

function createRouteGame(root, onDone) {
  let onDoneCallback = onDone;
  if (routeGameApi) {
    routeGameApi.reset(onDoneCallback);
    return;
  }
  const boardEl = root.querySelector("#route-board");
  const statsEl = root.querySelector("#route-stats");
  const cmdsEl = root.querySelector("#route-commands");
  const runBtn = root.querySelector("#route-run");
  const resetBtn = root.querySelector("#route-reset");
  const nextBtn = root.querySelector("#route-next");

  let levelIdx = 0;
  let commands = [];
  let level = ROUTE_LEVELS[0];
  let hero = { ...level.start };
  const stats = {
    commandsCount: 0,
    optimalCommands: 0,
    extraCommands: 0,
    routeEfficiency: 0,
    wallHits: 0,
    wrongDoorAttempts: 0,
    restartsCount: 0,
    timeToStart: 0,
    levelScores: []
  };

  let startedAt = Date.now();
  let firstCmd = false;

  function cellAt(x, y) {
    return level.grid[y]?.[x] || "#";
  }

  function renderBoard() {
    boardEl.style.gridTemplateColumns = `repeat(${level.size}, 48px)`;
    boardEl.innerHTML = "";
    for (let y = 0; y < level.size; y++) {
      for (let x = 0; x < level.size; x++) {
        const ch = level.grid[y][x];
        const div = document.createElement("div");
        div.className = "route-cell" + (ch === "#" ? " route-cell--wall" : "");
        let icon = "";
        if (x === hero.x && y === hero.y) icon = "🐱";
        else if (ch === "K") icon = "🔑";
        else if (ch === "D") icon = "🚪";
        else if (ch === "F") icon = "⭐";
        div.textContent = icon;
        boardEl.appendChild(div);
      }
    }
    statsEl.innerHTML = `<span>Уровень: ${levelIdx + 1}/3</span><span>Команд: ${commands.length}</span>`;
    cmdsEl.innerHTML = commands.map((c) => `<span class="route-cmd-chip">${c}</span>`).join("");
    nextBtn.disabled = true;
  }

  function resetHero() {
    hero = { ...level.start };
    commands = [];
    renderBoard();
  }

  function loadLevel(idx) {
    level = ROUTE_LEVELS[idx];
    stats.optimalCommands += level.optimal;
    resetHero();
    startedAt = Date.now();
    firstCmd = false;
  }

  root.querySelectorAll(".route-cmd").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!firstCmd) {
        firstCmd = true;
        stats.timeToStart = Date.now() - startedAt;
      }
      const map = { up: "⬆️", down: "⬇️", left: "⬅️", right: "➡️" };
      commands.push(map[btn.dataset.cmd]);
      renderBoard();
    });
  });

  resetBtn.addEventListener("click", () => {
    stats.restartsCount++;
    resetHero();
  });

  runBtn.addEventListener("click", () => {
    let x = level.start.x;
    let y = level.start.y;
    let hasKey = false;
    let doorOpen = false;
    let finished = false;

    stats.commandsCount += commands.length;

    const moves = commands.map((c) => {
      if (c === "⬆️") return { dx: 0, dy: -1 };
      if (c === "⬇️") return { dx: 0, dy: 1 };
      if (c === "⬅️") return { dx: -1, dy: 0 };
      return { dx: 1, dy: 0 };
    });

    for (const m of moves) {
      const nx = x + m.dx;
      const ny = y + m.dy;
      if (nx < 0 || ny < 0 || nx >= level.size || ny >= level.size) continue;
      const ch = cellAt(nx, ny);
      if (ch === "#") {
        stats.wallHits++;
        continue;
      }
      x = nx;
      y = ny;
      hero = { x, y };
      if (ch === "D") {
        if (hasKey) doorOpen = true;
        else stats.wrongDoorAttempts++;
      }
      if (ch === "F" && hasKey && doorOpen) finished = true;
      if (ch === "K") hasKey = true;
    }

    renderBoard();

    const extra = Math.max(0, commands.length - level.optimal);
    stats.extraCommands += extra;
    const eff = Math.max(0, Math.round(100 - (extra / Math.max(level.optimal, 1)) * 100));
    stats.levelScores.push(eff);

    if (finished) {
      nextBtn.disabled = false;
      if (levelIdx >= ROUTE_LEVELS.length - 1) {
        stats.routeEfficiency = Math.round(
          stats.levelScores.reduce((a, b) => a + b, 0) / stats.levelScores.length
        );
      }
    } else {
      stats.restartsCount++;
      alert("Сначала возьми ключ, открой дверь и дойди до финиша ⭐");
    }
  });

  nextBtn.addEventListener("click", () => {
    if (levelIdx < ROUTE_LEVELS.length - 1) {
      levelIdx++;
      loadLevel(levelIdx);
    } else {
      stats.routeEfficiency = Math.round(
        stats.levelScores.reduce((a, b) => a + b, 0) / stats.levelScores.length
      );
      onDoneCallback(stats);
    }
  });

  routeGameApi = {
    reset(cb) {
      onDoneCallback = cb;
      levelIdx = 0;
      Object.assign(stats, {
        commandsCount: 0,
        optimalCommands: 0,
        extraCommands: 0,
        routeEfficiency: 0,
        wallHits: 0,
        wrongDoorAttempts: 0,
        restartsCount: 0,
        timeToStart: 0,
        levelScores: []
      });
      loadLevel(0);
    }
  };

  loadLevel(0);
}

const PROGRESS_KEY = "kursor-passport-progress";

const state = {
  step: "registration",
  registration: null,
  questionScores: emptyScores(),
  questionIndex: 0,
  selectedAnswers: {},
  questions: [],
  memory: null,
  color: null,
  route: null,
  final: null
};

const screens = {
  registration: "screen-registration",
  questions: "screen-questions",
  memory: "screen-memory",
  color: "screen-color",
  route: "screen-route",
  saving: "screen-saving",
  result: "screen-result",
  admin: "screen-admin"
};

function saveProgress() {
  try {
    const payload = {
      step: state.step,
      registration: state.registration,
      questionIndex: state.questionIndex,
      selectedAnswers: state.selectedAnswers,
      questionScores: state.questionScores,
      memory: state.memory,
      color: state.color,
      route: state.route,
      final: state.final
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !data.step) return false;
    state.step = data.step;
    state.registration = data.registration || null;
    state.questionIndex = data.questionIndex || 0;
    state.selectedAnswers = data.selectedAnswers || {};
    state.questionScores = data.questionScores || emptyScores();
    state.memory = data.memory || null;
    state.color = data.color || null;
    state.route = data.route || null;
    state.final = data.final || null;
    if (state.registration?.ageGroup) {
      state.questions = QUESTIONS_BY_AGE[state.registration.ageGroup] || QUESTIONS_BY_AGE["8-12"];
    }
    return true;
  } catch {
    return false;
  }
}

function clearProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}

function showScreen(name) {
  state.step = name;
  Object.values(screens).forEach((id) => {
    document.getElementById(id).classList.toggle("screen--active", id === screens[name]);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  saveProgress();
}


function restoreRegistrationForm() {
  const form = document.getElementById("registration-form");
  if (!state.registration) return;
  const r = state.registration;
  const childInput = form.querySelector('[name="childName"]');
  if (childInput) childInput.value = r.childName || "";
  const ageRadio = form.querySelector(`[name="childAge"][value="${r.ageGroup}"]`);
  if (ageRadio) ageRadio.checked = true;
}

function initRegistration() {
  const form = document.getElementById("registration-form");
  const err = document.getElementById("form-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    err.hidden = true;
    const fd = new FormData(form);
    const childName = String(fd.get("childName") || "").trim();
    const ageGroup = fd.get("childAge");

    const nameParts = childName.split(/\s+/).filter(Boolean);
    if (!childName) {
      err.textContent = "Введите имя и фамилию ребенка.";
      err.hidden = false;
      return;
    }
    if (nameParts.length < 2) {
      err.textContent = "Введите и имя, и фамилию — например: Алия Иванова.";
      err.hidden = false;
      return;
    }
    if (!ageGroup) {
      err.textContent = "Выберите возраст ребенка.";
      err.hidden = false;
      return;
    }

    state.registration = { childName, childAge: ageGroup, ageGroup };
    state.questions = QUESTIONS_BY_AGE[ageGroup] || QUESTIONS_BY_AGE["8-12"];
    state.questionScores = emptyScores();
    state.questionIndex = 0;
    state.selectedAnswers = {};
    renderQuestion();
    showScreen("questions");
  });
}

function renderQuestion() {
  const q = state.questions[state.questionIndex];
  const total = state.questions.length;
  const young = state.registration?.ageGroup === "5-7";

  document.getElementById("question-progress").textContent = `Вопрос ${state.questionIndex + 1} из ${total}`;
  document.getElementById("question-progress-fill").style.width = `${((state.questionIndex + 1) / total) * 100}%`;
  document.getElementById("question-title").textContent = q.title;
  document.getElementById("question-hint").hidden = true;

  const answersEl = document.getElementById("answers");
  answersEl.innerHTML = "";
  const selected = state.selectedAnswers[state.questionIndex];

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer-card" + (young ? " answer-card--young" : "");
    if (selected === i) btn.classList.add("answer-card--selected");

    if (young) {
      const space = opt.label.indexOf(" ");
      const emoji = space > 0 ? opt.label.slice(0, space) : opt.label;
      const text = space > 0 ? opt.label.slice(space + 1) : "";
      btn.innerHTML = `<span class="answer-emoji">${emoji}</span><span class="answer-text">${text}</span>`;
    } else {
      btn.textContent = opt.label;
    }

    btn.addEventListener("click", () => {
      state.selectedAnswers[state.questionIndex] = i;
      if (young) document.getElementById("question-hint").hidden = false;
      renderQuestion();
      document.getElementById("question-next").disabled = false;
      saveProgress();
    });
    answersEl.appendChild(btn);
  });

  document.getElementById("question-next").disabled = selected === undefined;
}

function finishQuestions() {
  state.questionScores = emptyScores();

  state.questions.forEach((q, qi) => {
    const idx = state.selectedAnswers[qi];
    if (idx !== undefined) {
      state.questionScores[q.options[idx].profile]++;
    }
  });

  const memoryStart = document.getElementById("memory-start");
  const memoryCheck = document.getElementById("memory-check");
  const memoryBoard = document.getElementById("memory-board");
  const memoryStats = document.getElementById("memory-stats");
  const memoryTimeline = document.getElementById("memory-timeline-mem");
  const memoryMessage = document.getElementById("memory-message");

  if (memoryStart) {
    memoryStart.hidden = false;
    memoryStart.disabled = false;
  }

  if (memoryCheck) {
    memoryCheck.hidden = true;
    memoryCheck.disabled = true;
  }

  if (memoryBoard) {
    memoryBoard.hidden = true;
  }

  if (memoryStats) {
    memoryStats.hidden = true;
  }

  if (memoryTimeline) {
    memoryTimeline.hidden = true;
  }

  if (memoryMessage) {
    memoryMessage.textContent = "";
  }

  showScreen("memory");
}

async function finishAll() {
  state.final = computeFinalScores(state.questionScores, state.memory, state.color, state.route);
  showScreen("saving");

  const [sent] = await Promise.all([
    sendChildResultsToGoogleSheets(state.registration, state.final),
    new Promise((resolve) => setTimeout(resolve, 1500))
  ]);

  renderResult(sent);
  showScreen("result");
}

function renderResult(sheetsSent = true) {
  const f = state.final;
  const reg = state.registration;
  const open = document.getElementById("result-open");
  const direction = PROFILE_LABELS[f.topProfile]?.track || f.topProfile;

  open.innerHTML = `
    <div class="result-card result-card--main"><h4>Имя ребенка</h4><div class="value">${reg.childName}</div></div>
    <div class="result-card result-card--main"><h4>Возраст</h4><div class="value">${reg.ageGroup} лет</div></div>
    <div class="result-card result-card--direction">
      <h4>Предварительное направление</h4>
      <div class="value value--dir">${direction}</div>
    </div>
    <div class="result-card result-card--compact"><h4>Memory</h4><div class="value value--sm">${f.memoryScore}</div></div>
    <div class="result-card result-card--compact"><h4>Focus</h4><div class="value value--sm">${f.focusScore}</div></div>
    <div class="result-card result-card--compact"><h4>Route</h4><div class="value value--sm">${f.routeScore}</div></div>
    <div class="result-card result-card--compact"><h4>Accuracy</h4><div class="value value--sm">${f.accuracy}%</div></div>
    <div class="result-card result-card--peer">
      <h4>Сравнение с другими детьми</h4>
      <div class="peer-meter"><div class="peer-meter__fill" style="width:${f.peerPercentile}%"></div></div>
      <p class="peer-text">Результат выше, чем у <strong>${f.peerPercentile}%</strong> участников — ${f.peerLabel}.</p>
    </div>
    <div class="result-card result-card--traits">
      <h4>Что уже хорошо получается</h4>
      <ul class="traits-list">${f.abstractTraits.map((t) => `<li>${t}</li>`).join("")}</ul>
    </div>
    <div class="result-card result-card--strengths">
      <h4>Сильные стороны</h4>
      <div class="tag-list tag-list--strength">${f.strengths.map((s) => `<span class="tag tag--strength">${s}</span>`).join("")}</div>
    </div>
    <div class="result-card result-card--growth">
      <h4>Зоны роста</h4>
      <div class="tag-list tag-list--growth">${f.growthZones.map((s) => `<span class="tag tag--growth">${s}</span>`).join("")}</div>
    </div>
  `;

  const blur = document.getElementById("blur-analytics");
  blur.innerHTML = `
    <div class="blur-block"><h5>Детальный профиль</h5><div class="fake-bar"><span style="width:78%"></span></div></div>
    <div class="blur-block"><h5>Рекомендуемый трек</h5><p>████████████</p></div>
    <div class="blur-block"><h5>Когнитивная карта</h5><div class="fake-bar"><span style="width:70%"></span></div></div>
    <div class="blur-block"><h5>Главная IT-профессия</h5><p>███████████</p></div>
  `;

  const thanksEl = document.getElementById("result-thanks-text");
  if (thanksEl) {
    thanksEl.textContent = sheetsSent
      ? "Результат сохранен. Родитель сможет получить полную расшифровку IT Passport у менеджера Kursor."
      : "Результат сформирован. Если данные не сохранились, менеджер сможет уточнить их у родителя.";
  }
}

function resetAll() {
  clearProgress();
  state.registration = null;
  state.questionScores = emptyScores();
  state.questionIndex = 0;
  state.selectedAnswers = {};
  state.memory = null;
  state.color = null;
  state.route = null;
  state.final = null;
  document.getElementById("registration-form").reset();
  if (colorGameApi) colorGameApi.resetIntro();
  if (routeGameApi) routeGameApi.resetIntro();
  showScreen("registration");
}

function initNav() {
  document.querySelectorAll("[data-action='home']").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      if (location.hash) history.pushState("", document.title, window.location.pathname);
      resetAll();
    });
  });
  document.querySelectorAll("[data-action='restart']").forEach((el) => {
    el.addEventListener("click", resetAll);
  });

  document.getElementById("question-next").addEventListener("click", () => {
    if (state.questionIndex < state.questions.length - 1) {
      state.questionIndex++;
      renderQuestion();
      saveProgress();
    } else {
      finishQuestions();
    }
  });

  window.addEventListener("hashchange", () => {
    if (location.hash === "#admin") {
      document.querySelectorAll(".screen").forEach((s) => s.classList.remove("screen--active"));
      document.getElementById("screen-admin").classList.add("screen--active");
    }
  });
}

function restoreSession() {
  if (!loadProgress()) return;

  if (state.step === "registration" || state.step === "welcome") {
    restoreRegistrationForm();
    showScreen("registration");
    return;
  }
  if (state.step === "questions" && state.registration) {
    restoreRegistrationForm();
    renderQuestion();
    showScreen("questions");
    return;
  }
  if (state.step === "memory" && state.registration) {
    showScreen("memory");
    return;
  }
  if (state.step === "color" && state.registration) {
    showScreen("color");
    if (colorGameApi) colorGameApi.begin(state.registration.ageGroup, onColorDone);
    return;
  }
  if (state.step === "route" && state.registration) {
    showScreen("route");
    if (routeGameApi) routeGameApi.reset(onRouteDone);
    return;
  }
  if (state.step === "result" && state.final && state.registration) {
    renderResult(true);
    showScreen("result");
  }
}

function onMemoryDone(memoryStats) {
  state.memory = memoryStats;
  showScreen("color");
  if (colorGameApi) colorGameApi.begin(state.registration.ageGroup, onColorDone);
}

function onColorDone(colorStats) {
  state.color = colorStats;
  showScreen("route");
  if (routeGameApi) routeGameApi.reset(onRouteDone);
}

function onRouteDone(routeStats) {
  state.route = routeStats;
  finishAll();
}

document.addEventListener("DOMContentLoaded", () => {
  initRegistration();
  initNav();
  initAdmin();

  const memRoot = document.getElementById("screen-memory");
  const colorRoot = document.getElementById("screen-color");
  const routeRoot = document.getElementById("screen-route");

  createMemoryGame(memRoot, onMemoryDone);
  createColorGame(colorRoot);
  createRouteGame(routeRoot);

  if (location.hash === "#admin") {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("screen--active"));
    document.getElementById("screen-admin").classList.add("screen--active");
  } else {
    restoreSession();
  }
});

const state = {
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
  welcome: "screen-welcome",
  registration: "screen-registration",
  questions: "screen-questions",
  memory: "screen-memory",
  color: "screen-color",
  route: "screen-route",
  result: "screen-result",
  admin: "screen-admin"
};

function showScreen(name) {
  Object.values(screens).forEach((id) => {
    document.getElementById(id).classList.toggle("screen--active", id === screens[name]);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function normalizePhone(v) {
  return v.replace(/[^\d+]/g, "");
}

function initRegistration() {
  const form = document.getElementById("registration-form");
  const err = document.getElementById("form-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    err.hidden = true;
    const fd = new FormData(form);
    const childName = String(fd.get("childName") || "").trim();
    const ageGroup = fd.get("ageGroup");
    const parentName = String(fd.get("parentName") || "").trim();
    const parentPhone = normalizePhone(String(fd.get("parentPhone") || ""));

    if (!childName || !ageGroup || !parentName || !parentPhone) {
      err.textContent = "Заполните все поля.";
      err.hidden = false;
      return;
    }
    if (parentPhone.replace(/\D/g, "").length < 10) {
      err.textContent = "Телефон должен содержать минимум 10 цифр.";
      err.hidden = false;
      return;
    }

    state.registration = { childName, ageGroup, parentName, parentPhone };
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
  const young = state.registration.ageGroup === "5-7";

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
      btn.innerHTML = `<span class="answer-emoji">${emoji}</span>${text}`;
    } else {
      btn.textContent = opt.label;
    }

    btn.addEventListener("click", () => {
      state.selectedAnswers[state.questionIndex] = i;
      if (young) {
        document.getElementById("question-hint").hidden = false;
      }
      renderQuestion();
      document.getElementById("question-next").disabled = false;
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
      const profile = q.options[idx].profile;
      state.questionScores[profile]++;
    }
  });
  const startBtn = document.getElementById("memory-start");
  startBtn.disabled = false;
  document.getElementById("memory-message").textContent = "";
  document.getElementById("memory-board").innerHTML = "";
  showScreen("memory");
}

function finishAll() {
  state.final = computeFinalScores(state.questionScores, state.memory, state.color, state.route);
  renderResult();
  saveLead({
    childName: state.registration.childName,
    ageGroup: state.registration.ageGroup,
    parentName: state.registration.parentName,
    parentPhone: state.registration.parentPhone,
    topProfile: state.final.topProfile,
    top3Profiles: state.final.top3Profiles,
    totalScore: state.final.totalScore,
    accuracy: state.final.accuracy,
    questionScores: state.questionScores,
    memory: state.memory,
    color: state.color,
    route: state.route
  });
  showScreen("result");
}

function renderResult() {
  const f = state.final;
  const reg = state.registration;
  const open = document.getElementById("result-open");

  open.innerHTML = `
    <div class="result-card"><h4>Имя ребенка</h4><div class="value">${reg.childName}</div></div>
    <div class="result-card"><h4>Возраст</h4><div class="value">${reg.ageGroup}</div></div>
    <div class="result-card"><h4>Общий результат</h4><div class="value">${f.totalScore} баллов</div></div>
    <div class="result-card"><h4>Memory Score</h4><div class="value">${f.memoryScore}</div></div>
    <div class="result-card"><h4>Focus Score</h4><div class="value">${f.focusScore}</div></div>
    <div class="result-card"><h4>Route Score</h4><div class="value">${f.routeScore}</div></div>
    <div class="result-card"><h4>Accuracy</h4><div class="value">${f.accuracy}%</div></div>
    <div class="result-card"><h4>Сильные стороны</h4><div class="tag-list">${f.strengths.map((s) => `<span class="tag">${s}</span>`).join("")}</div></div>
    <div class="result-card"><h4>Зоны роста</h4><div class="tag-list">${f.growthZones.map((s) => `<span class="tag tag--growth">${s}</span>`).join("")}</div></div>
    <div class="result-card"><h4>Направления</h4><div class="tag-list">${f.directions.map((s) => `<span class="tag">${s}</span>`).join("")}</div></div>
    <div class="result-card"><h4>Главная IT-профессия</h4><div class="profession-blur">${PROFILE_LABELS[f.topProfile].title}</div><p style="margin:8px 0 0;color:#777">Главная IT-профессия: ███████████</p></div>
  `;

  const blur = document.getElementById("blur-analytics");
  blur.innerHTML = `
    <div class="blur-block"><h5>Radar chart</h5><div class="fake-bar"><span style="width:78%"></span></div><div class="fake-bar"><span style="width:62%"></span></div></div>
    <div class="blur-block"><h5>Profile comparison</h5><div class="fake-bar"><span style="width:90%"></span></div><div class="fake-bar"><span style="width:55%"></span></div></div>
    <div class="blur-block"><h5>Cognitive skills</h5><div class="fake-bar"><span style="width:70%"></span></div></div>
    <div class="blur-block"><h5>Top profession</h5><p>${PROFILE_LABELS[f.topProfile].title}</p></div>
    <div class="blur-block"><h5>Recommended course</h5><p>KURSOR Starter Track</p></div>
    <div class="blur-block"><h5>Manager notes</h5><p>Детальная расшифровка...</p></div>
  `;
}

function resetAll() {
  state.registration = null;
  state.questionScores = emptyScores();
  state.questionIndex = 0;
  state.selectedAnswers = {};
  state.memory = null;
  state.color = null;
  state.route = null;
  state.final = null;
  document.getElementById("registration-form").reset();
  document.getElementById("memory-start").disabled = false;
  document.getElementById("memory-message").textContent = "";
  showScreen("welcome");
}

function initNav() {
  document.querySelectorAll("[data-action='start']").forEach((el) => {
    el.addEventListener("click", () => showScreen("registration"));
  });
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

document.addEventListener("DOMContentLoaded", () => {
  initRegistration();
  initNav();
  initAdmin();

  const memRoot = document.getElementById("screen-memory");
  const colorRoot = document.getElementById("screen-color");
  const routeRoot = document.getElementById("screen-route");

  createRouteGame(routeRoot, () => {});

  createMemoryGame(memRoot, (memoryStats) => {
    state.memory = memoryStats;
    showScreen("color");
    createColorGame(colorRoot, state.registration.ageGroup, (colorStats) => {
      state.color = colorStats;
      showScreen("route");
      routeGameApi.reset((routeStats) => {
        state.route = routeStats;
        finishAll();
      });
    });
  });

  if (location.hash === "#admin") {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("screen--active"));
    document.getElementById("screen-admin").classList.add("screen--active");
  }
});

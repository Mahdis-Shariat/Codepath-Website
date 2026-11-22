// ---------- Data (ported from the Java version) ----------
// Answer A-E maps to these five paths, in this order.
const KEYS = ["frontend", "backend", "game", "mobile", "ai"];

const PATHS = {
  frontend: {
    name: "Front-End Development",
    blurb: "You like turning ideas into things people can see and click. Front-end developers build the websites and interfaces people use every day.",
    tools: "HTML, CSS, JavaScript, then a framework like React"
  },
  backend: {
    name: "Back-End Development",
    blurb: "You like the logic behind the screen: data, accounts, and systems that stay fast and reliable.",
    tools: "Java or Python, SQL databases, building REST APIs"
  },
  game: {
    name: "Game Development",
    blurb: "You like designing challenges, stories, and worlds that people want to play.",
    tools: "Unity with C#, or Godot"
  },
  mobile: {
    name: "Mobile Development",
    blurb: "You like building tools that people carry in their pocket and use every day.",
    tools: "Kotlin for Android, Swift for iOS, or Flutter for both"
  },
  ai: {
    name: "Artificial Intelligence / Data Science",
    blurb: "You like working with data and teaching computers to find patterns and make predictions.",
    tools: "Python, NumPy and pandas, then machine learning with scikit-learn"
  }
};

// Each question has 5 options: index 0 = A, 1 = B, ... 4 = E
const QUESTIONS = [
  {
    text: "What type of projects would you enjoy creating the most?",
    options: [
      "Websites and beautiful user interfaces",
      "Powerful applications and backend systems",
      "Games and interactive experiences",
      "Mobile applications",
      "Smart systems using artificial intelligence"
    ]
  },
  {
    text: "Which activity sounds more exciting to you?",
    options: [
      "Designing layouts, colors, and animations",
      "Building databases, APIs, and application logic",
      "Creating game mechanics and virtual worlds",
      "Making apps that help people in their daily lives",
      "Teaching computers to understand and analyze information"
    ]
  },
  {
    text: "If you had one month to create a project, what would you choose?",
    options: [
      "A personal website or online portfolio",
      "A user management system with login and database",
      "A simple game with different levels",
      "A mobile app for notes or daily tasks",
      "A program that predicts results using data"
    ]
  },
  {
    text: "Which type of problem do you enjoy solving?",
    options: [
      "How can I make this look better and easier to use?",
      "How can I make this system faster and more reliable?",
      "How can I make this game more fun and challenging?",
      "How can I make people's lives easier with an app?",
      "How can I make a computer learn from information?"
    ]
  },
  {
    text: "Which result would make you the happiest?",
    options: [
      "Seeing people use a website I designed",
      "Knowing thousands of users can use a system I built",
      "Watching people enjoy a game I created",
      "Seeing my application installed on many phones",
      "Creating a system that can learn and improve"
    ]
  },
  {
    text: "Which part of programming sounds more interesting?",
    options: [
      "Creating the visual experience users interact with",
      "Building the hidden logic behind applications",
      "Creating stories, challenges, and experiences",
      "Developing tools for smartphones",
      "Working with data and intelligent systems"
    ]
  },
  {
    text: "What kind of work environment do you prefer?",
    options: [
      "Creative work with design and visual ideas",
      "Logical work with systems and problem solving",
      "Creating new worlds and experiences",
      "Building useful tools for everyday life",
      "Researching and experimenting with new technologies"
    ]
  }
];

const ICONS = { frontend: "FE", backend: "BE", game: "GD", mobile: "MD", ai: "AI" };
const N = QUESTIONS.length;

const INITIALS = { frontend: "FE", backend: "BE", game: "GD", mobile: "MD", ai: "AI" };

// ---------- State ----------
let userName = "";
let answers = [];   // answers[i] = chosen option index, or null if not answered yet
let queue = [];     // question numbers to show right now
let pos = 0;        // position inside the queue
let phase = "main"; // "main" = first pass, "review" = going back to skipped questions

const $ = (id) => document.getElementById(id);
const SCREENS = ["start", "quiz", "loading", "result"];

function show(screen) {
  SCREENS.forEach((s) => $("screen-" + s).classList.toggle("active", s === screen));
}

// ---------- Start ----------
function startQuiz() {
  const value = $("name-input").value.trim();
  if (!value) {
    $("name-error").hidden = false;
    $("name-input").focus();
    return;
  }
  $("name-error").hidden = true;
  userName = value;
  answers = new Array(N).fill(null);
  queue = QUESTIONS.map((_, i) => i);
  pos = 0;
  phase = "main";
  show("quiz");
  renderQuestion();
}

// ---------- Questions ----------
function renderQuestion() {
  const qi = queue[pos];
  const q = QUESTIONS[qi];
  const review = phase === "review";

  $("eyebrow").textContent = review ? "SKIPPED QUESTION" : "QUESTION";
  $("question-count").textContent = review
    ? "Skipped " + (pos + 1) + " of " + queue.length + " (question " + (qi + 1) + ")"
    : "Question " + (qi + 1) + " of " + N;
  $("question-number").textContent = "Q" + String(qi + 1).padStart(2, "0");
  $("question-text").textContent = q.text;
  $("review-note").hidden = !review;

  const box = $("answers");
  box.innerHTML = "";
  q.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer" + (answers[qi] === i ? " selected" : "");

    const key = document.createElement("span");
    key.className = "answer-key";
    key.textContent = "ABCDE"[i];

    const label = document.createElement("span");
    label.textContent = text;

    btn.append(key, label);
    btn.addEventListener("click", () => choose(i));
    box.appendChild(btn);
  });

  updateControls();
  $("question-text").focus();
}

function updateControls() {
  const qi = queue[pos];
  const answered = answers[qi] !== null;
  const count = answers.filter((a) => a !== null).length;
  const percent = Math.round((count / N) * 100);

  $("progress-bar").style.width = percent + "%";
  $("progress-percent").textContent = percent + "%";

  $("back-btn").disabled = pos === 0;
  $("skip-btn").hidden = phase === "review"; // skipped questions must be answered
  $("skip-btn").disabled = answered;
  $("next-btn").disabled = !answered;

  const isLast = pos === queue.length - 1;
  const othersPending = answers.some((a, i) => a === null && i !== qi);
  let label = "Next";
  if (isLast) label = othersPending ? "Review skipped" : "See results";
  $("next-btn").firstChild.nodeValue = label + " ";
}

function choose(optionIndex) {
  const qi = queue[pos];
  answers[qi] = optionIndex;
  Array.from($("answers").children).forEach((btn, i) => {
    btn.classList.toggle("selected", i === optionIndex);
  });
  updateControls();
}

function advance() {
  if (pos < queue.length - 1) {
    pos++;
    renderQuestion();
  } else {
    endOfQueue();
  }
}

// After the last question: go back to skipped ones, or finish
function endOfQueue() {
  const pending = [];
  answers.forEach((a, i) => { if (a === null) pending.push(i); });
  if (pending.length === 0) {
    finish();
  } else {
    queue = pending;
    pos = 0;
    phase = "review";
    renderQuestion();
  }
}

function goBack() {
  if (pos > 0) {
    pos--;
    renderQuestion();
  }
}

// ---------- Result ----------
function finish() {
  show("loading");
  setTimeout(showResult, 2500);
}

function showResult() {
  const scores = {};
  KEYS.forEach((k) => (scores[k] = 0));
  answers.forEach((optionIndex) => { scores[KEYS[optionIndex]]++; });

  const max = Math.max(...KEYS.map((k) => scores[k]));
  const winners = KEYS.filter((k) => scores[k] === max);
  const isTie = winners.length > 1;

  const heading = $("result-heading");
  heading.textContent = "Your path, ";
  const nameSpan = document.createElement("span");
  nameSpan.textContent = userName;
  heading.appendChild(nameSpan);
  $("result-sub").textContent = isTie
    ? "Your answers point to more than one path."
    : "Based on your " + N + " answers.";

  $("result-icon").textContent = isTie ? "TIE" : INITIALS[winners[0]];

  const copy = $("result-copy");
  copy.innerHTML = "";
  const title = document.createElement("h2");
  title.textContent = winners.map((k) => PATHS[k].name).join(" + ");
  copy.appendChild(title);

  if (isTie) {
    const note = document.createElement("p");
    note.textContent = "These paths fit you equally well. Try a small project in each and see which one you enjoy more.";
    copy.appendChild(note);
  }
  winners.forEach((k) => {
    const box = document.createElement("div");
    box.className = "detail";
    if (isTie) {
      const h = document.createElement("h3");
      h.textContent = PATHS[k].name;
      box.appendChild(h);
    }
    const blurb = document.createElement("p");
    blurb.textContent = PATHS[k].blurb;
    const tools = document.createElement("p");
    tools.className = "tools";
    tools.textContent = "Good first tools: " + PATHS[k].tools;
    box.append(blurb, tools);
    copy.appendChild(box);
  });

  const list = $("scores");
  list.innerHTML = "";
  KEYS.forEach((k) => {
    const row = document.createElement("div");
    row.className = "score-row" + (winners.includes(k) ? " winner" : "");

    const label = document.createElement("div");
    label.className = "score-label";
    const name = document.createElement("span");
    name.textContent = PATHS[k].name;
    const count = document.createElement("span");
    count.textContent = scores[k] + " / " + N;
    label.append(name, count);

    const track = document.createElement("div");
    track.className = "score-track";
    const fill = document.createElement("div");
    fill.className = "score-fill";
    track.appendChild(fill);

    row.append(label, track);
    list.appendChild(row);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.width = (scores[k] / N) * 100 + "%";
    }));
  });

  show("result");
  heading.focus();
}

function restart() {
  $("name-input").value = "";
  show("start");
  document.querySelector("#screen-start h1").focus();
}

// ---------- Theme (dark / light) ----------
function applyTheme(theme) {
  const light = theme === "light";
  document.documentElement.setAttribute("data-theme", theme);
  $("theme-icon").textContent = light ? "☾" : "☀";
  $("theme-label").textContent = light ? "Dark" : "Light";
  $("theme-toggle").setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
}

$("theme-toggle").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem("codepath-theme", next); } catch (e) {}
});
applyTheme(document.documentElement.getAttribute("data-theme") || "dark");

// ---------- Events ----------
$("start-btn").addEventListener("click", startQuiz);
$("name-input").addEventListener("keydown", (e) => { if (e.key === "Enter") startQuiz(); });
$("back-btn").addEventListener("click", goBack);
$("skip-btn").addEventListener("click", advance);
$("next-btn").addEventListener("click", () => { if (answers[queue[pos]] !== null) advance(); });
$("restart-btn").addEventListener("click", restart);

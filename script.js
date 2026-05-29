/* ========================================
   QUIZ SCRIPT
   ======================================== */

let allQuestions = [];
let questions = [];
let current = 0;
let correct = 0;
let wrong = 0;
let answered = false;
let selectedTheme = "girl_power";

// History: speichert den Zustand jeder beantworteten Frage
let history = [];

/* ========================================
   THEME HANDLING
   ======================================== */
function previewTheme(theme) {
    selectedTheme = theme;
    document.body.className = theme === "girl_power" ? "" : theme;

    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.classList.toggle("active-theme", btn.dataset.theme === theme);
    });

    const preview = document.getElementById("themePreview");
    preview.classList.add("visible");
}

/* ========================================
   SEITEN-NAVIGATION
   ======================================== */
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function goToStart() {
    showPage("startPage");
}

/* ========================================
   QUIZ STARTEN
   ======================================== */
function startQuiz() {
    document.body.className = selectedTheme === "girl_power" ? "" : selectedTheme;

    current = 0;
    correct = 0;
    wrong = 0;
    answered = false;
    history = []; 

    showPage("quizPage");
    loadQuestion();
}

/* ========================================
   FRAGEN LADEN
   ======================================== */
function loadQuestion() {
    if (current >= questions.length) {
        showResult();
        return;
    }

    let q = questions[current];
    let savedState = history[current];

    document.getElementById("question").innerText = cleanQuestionText(q.question);
    document.getElementById("feedback").className = "";
    document.getElementById("feedback").innerHTML = "";
    document.getElementById("feedback").style.display = "none"; 
    document.getElementById("textAnswer").value = "";

    clearAnswerButtons();

    let answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";

    if (savedState) {
        answered = true;
        renderQuestionWithState(q, savedState);
    } else {
        answered = false;
        renderQuestion(q);
    }

    updateProgress();
    updateNavButtons();
}

function renderQuestion(q) {
    let answersDiv = document.getElementById("answers");

    if (q.type === "mc") {
        q.options.forEach(opt => {
            let btn = document.createElement("button");
            btn.innerText = opt;
            btn.className = "answer-btn";
            btn.onclick = () => checkAnswer(opt.trim().charAt(0));
            answersDiv.appendChild(btn);
        });
        document.getElementById("textAnswer").style.display = "none";
    } else if (q.type === "text") {
        document.getElementById("textAnswer").style.display = "block";
    } else if (q.type === "copy") {
        q.options.forEach(opt => {
            let btn = document.createElement("button");
            btn.innerText = opt;
            btn.className = "answer-btn";
            btn.onclick = () => {
                document.getElementById("textAnswer").value = opt;
                checkAnswer(opt);
            };
            answersDiv.appendChild(btn);
        });
        document.getElementById("textAnswer").style.display = "block";
    }
}

function renderQuestionWithState(q, state) {
    let answersDiv = document.getElementById("answers");

    let tag = document.createElement("div");
    tag.className = "reviewed-tag";
    tag.innerText = state.wasCorrect ? "✔ Richtig beantwortet" : "✖ Falsch beantwortet";
    answersDiv.appendChild(tag);

    if (q.type === "mc") {
        q.options.forEach(opt => {
            let letter = opt.trim().charAt(0);
            let btn = document.createElement("button");
            btn.innerText = opt;
            btn.className = "answer-btn";
            btn.disabled = true;

            let correctLetter = q.answer?.trim().toUpperCase();
            let userLetter = state.userAnswer?.trim().toUpperCase();

            if (letter.toUpperCase() === correctLetter) {
                btn.classList.add("btn-correct");
            } else if (letter.toUpperCase() === userLetter && !state.wasCorrect) {
                btn.classList.add("btn-wrong");
            } else {
                btn.style.opacity = "0.45";
            }
            answersDiv.appendChild(btn);
        });
        document.getElementById("textAnswer").style.display = "none";
    } else if (q.type === "text" || q.type === "copy") {
        let inputEl = document.getElementById("textAnswer");
        inputEl.style.display = "block";
        inputEl.value = state.userAnswer;
        inputEl.disabled = true;
        if (q.type === "copy" && q.options) {
            q.options.forEach(opt => {
                let btn = document.createElement("button");
                btn.innerText = opt;
                btn.className = "answer-btn";
                btn.disabled = true;
                if (opt === q.answer) btn.classList.add("btn-correct");
                else btn.style.opacity = "0.45";
                answersDiv.appendChild(btn);
            });
        }
    }

    let feedback = document.getElementById("feedback");
    if (state.wasCorrect) {
        feedback.className = "correct";
        feedback.innerHTML = `<b>Richtig!</b><br>${q.explanation}<br><br><b>Antwort:</b> ${q.answer}`;
    } else {
        feedback.className = "wrong";
        feedback.innerHTML = `<b>Falsch!</b><br>Richtige Antwort:<br><b>${q.answer}</b><br><br>${q.explanation}`;
    }
}

/* ========================================
   ANTWORT PRÜFEN
   ======================================== */
function checkAnswer(value) {
    if (answered) return;
    answered = true;

    let q = questions[current];
    let feedback = document.getElementById("feedback");

    document.querySelectorAll(".answer-btn").forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.5";
    });

    let userAnswer = value?.trim().toLowerCase();
    let correctAnswer = q.answer?.trim().toLowerCase();
    let wasCorrect = userAnswer === correctAnswer;

    if (q.type === "mc") {
        document.querySelectorAll(".answer-btn").forEach(btn => {
            let letter = btn.innerText.trim().charAt(0).toLowerCase();
            if (letter === correctAnswer) {
                btn.classList.add("btn-correct");
                btn.style.opacity = "1";
            } else if (letter === userAnswer && !wasCorrect) {
                btn.classList.add("btn-wrong");
                btn.style.opacity = "1";
            }
        });
    }

    if (wasCorrect) {
        correct++;
        feedback.className = "correct";
        feedback.innerHTML = `<b>Richtig!</b><br>${q.explanation}<br><br><b>Antwort:</b> ${q.answer}`;
    } else {
        wrong++;
        feedback.className = "wrong";
        feedback.innerHTML = `<b>Falsch!</b><br>Richtige Antwort:<br><b>${q.answer}</b><br><br>${q.explanation}`;
    }

    history[current] = {
        answered: true,
        userAnswer: value,
        wasCorrect: wasCorrect
    };

    updateProgress();
    updateNavButtons();
}

/* ========================================
   NAVIGATION
   ======================================== */
function nextQuestion() {
    let q = questions[current];

    if (!answered) {
        if (q.type === "text" || q.type === "copy") {
            let value = document.getElementById("textAnswer").value;
            if (!value.trim()) {
                let fb = document.getElementById("feedback");
                fb.className = "wrong";
                fb.innerHTML = "Bitte gib zuerst eine Antwort ein.";
                return;
            }
            checkAnswer(value);
            return;
        }
        let fb = document.getElementById("feedback");
        fb.className = "wrong";
        fb.innerHTML = "Bitte wähle zuerst eine Antwort aus.";
        return;
    }

    current++;
    if (current < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function prevQuestion() {
    if (current > 0) {
        current--;
        loadQuestion();
    }
}

function updateNavButtons() {
    let prevBtn = document.getElementById("prevBtn");
    let nextBtn = document.getElementById("nextBtn");

    prevBtn.style.display = (current > 0 && history[current - 1]) ? "block" : "none";
    nextBtn.style.display = "block";

    if (current >= questions.length - 1 && answered) {
        nextBtn.innerText = "Auswertung →";
    } else {
        nextBtn.innerText = "Weiter →";
    }
}

/* ========================================
   FORTSCHRITT
   ======================================== */
function updateProgress() {
    if (current >= questions.length) return;

    let answeredCount = history.filter(h => h !== null).length;

    document.getElementById("progressText").innerText =
        `Frage ${current + 1} / ${questions.length}`;
    document.getElementById("scoreText").innerText =
        `✔ ${correct} | ✖ ${wrong}`;
    document.getElementById("percentText").innerText =
        answeredCount > 0
            ? `(${Math.round((correct / answeredCount) * 100)}%)`
            : "";
    document.getElementById("progressFill").style.width =
        ((current + 1) / questions.length) * 100 + "%";
}

/* ========================================
   ERGEBNIS (IHK-SCHLÜSSEL)
   ======================================== */
function showResult() {
    let total = questions.length;
    let percent = total > 0 ? (correct / total) * 100 : 0;
    let grade = getGrade(percent);

    // Bis Note 4 (ab exakt 50%) gilt es als bestanden 👍
    let gradeLabel = grade <= 2 ? "🎉" : grade <= 4 ? "👍" : "📚";

    document.getElementById("resultContent").innerHTML = `
    <div class="grade-badge">${grade}</div>
    <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:16px;">IHK-Note (1 = beste)</p>
    <p style="font-size:1.1rem; margin-bottom:6px;">
      ${gradeLabel} ${percent.toFixed(1)}% erreicht
    </p>
    <p style="color:var(--text-muted); margin-bottom:4px;">
      ✔ ${correct} richtige &nbsp;|&nbsp; ✖ ${wrong} falsche Antworten
    </p>
    <p style="color:var(--text-muted); font-size:0.85rem;">von ${total} Fragen</p>
  `;

    showPage("resultPage");
}

function getGrade(p) {
    if (p >= 92) return 1; // Sehr gut
    if (p >= 81) return 2; // Gut
    if (p >= 67) return 3; // Befriedigend
    if (p >= 50) return 4; // Ausreichend (Bestanden!)
    if (p >= 30) return 5; // Mangelhaft
    return 6;              // Ungenügend
}

/* ========================================
   SHUFFLE & NEUSTART
   ======================================== */
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function shuffleAndRestart() {
    questions = shuffleArray([...allQuestions]);
    current = 0;
    correct = 0;
    wrong = 0;
    answered = false;
    history = []; 
    showPage("quizPage");
    loadQuestion();
}

/* ========================================
   HELPER
   ======================================== */
function cleanQuestionText(text) {
    if (!text) return "";
    return text
        .split("\nA)")[0]
        .split("\nAntwort:")[0]
        .split("\nErklärung:")[0]
        .trim();
}

function clearAnswerButtons() {
    document.querySelectorAll(".answer-btn").forEach(btn => btn.remove());
}

/* ========================================
   ENTER-TASTE für Texteingabe
   ======================================== */
document.getElementById("textAnswer").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        let value = e.target.value;
        if (value.trim()) checkAnswer(value);
    }
});

/* ========================================
   DATEN LADEN
   ======================================== */
fetch("questions.json")
    .then(res => res.json())
    .then(data => {
        allQuestions = data;
        questions = [...allQuestions];
        showPage("startPage");
        const defaultBtn = document.querySelector('[data-theme="girl_power"]');
        if (defaultBtn) defaultBtn.classList.add("active-theme");
    })
    .catch(err => {
        console.error("Fehler beim Laden der Fragen:", err);
        document.body.innerHTML =
            "<p style='color:red;padding:20px;'>Fehler: questions.json konnte nicht geladen werden.</p>";
    });

    
/* ========================================
   ECHSEN-STEUERUNG (KI & ANIMATION)
   ======================================== */
const lizard = document.getElementById("lizard");
const toggleBtn = document.getElementById("lizardToggleBtn");

let lizardActive = true;
let lizardState = "hidden"; 
let posX = 0, posY = 0;
let targetX = 0, targetY = 0;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let angle = 0;
let speed = 3;
let lizardInterval = null;

window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

toggleBtn.addEventListener("click", () => {
    lizardActive = !lizardActive;
    if (!lizardActive) {
        toggleBtn.innerText = "🦎 Ein";
        toggleBtn.classList.add("disabled");
        hideLizardImmediately();
    } else {
        toggleBtn.innerText = "🦎 Aus";
        toggleBtn.classList.remove("disabled");
        resetLizardTimer();
    }
});

lizard.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (lizardState === "hidden" || lizardState === "panicking" || lizardState === "escaping") return;
    triggerEscapeRoutine();
});

function hideLizardImmediately() {
    lizard.classList.add("lizard-hidden");
    lizard.classList.remove("lizard-walk-anim", "lizard-blink", "lizard-panic");
    lizardState = "hidden";
    clearInterval(lizardInterval);
}

function resetLizardTimer() {
    clearInterval(lizardInterval);
    setTimeout(() => {
        if (lizardActive && lizardState === "hidden") spawnLizard();
        
        lizardInterval = setInterval(() => {
            if (lizardActive && lizardState === "hidden") spawnLizard();
        }, 20000);
    }, 5);
}

function spawnLizard() {
    lizardState = "walkingToCenter";
    lizard.classList.remove("lizard-hidden");
    lizard.classList.add("lizard-walk-anim");

    const side = Math.floor(Math.random() * 4);
    const offset = 100; 
    
    if (side === 0) { 
        posX = Math.random() * window.innerWidth;
        posY = -offset;
    } else if (side === 1) { 
        posX = window.innerWidth + offset;
        posY = Math.random() * window.innerHeight;
    } else if (side === 2) { 
        posX = Math.random() * window.innerWidth;
        posY = window.innerHeight + offset;
    } else { 
        posX = -offset;
        posY = Math.random() * window.innerHeight;
    }

    targetX = window.innerWidth / 2;
    targetY = window.innerHeight / 2;
    
    requestAnimationFrame(updateLizardBehavior);
}

function updateLizardBehavior() {
    if (!lizardActive || lizardState === "hidden") return;

    if (lizardState === "panicking") {
        requestAnimationFrame(updateLizardBehavior);
        return;
    }

    if (lizardState === "walkingToCenter") {
        moveTowardsTarget(2.5);
        if (Math.hypot(targetX - posX, targetY - posY) < 15) {
            lizardState = "staring";
            lizard.classList.remove("lizard-walk-anim");
            lizard.classList.add("lizard-blink");
            
            angle = 90 * (Math.PI / 180); 
            lizard.style.transform = `translate(${posX}px, ${posY}px) rotate(${angle}rad)`;

            setTimeout(() => {
                if (lizardState === "staring") {
                    lizard.classList.remove("lizard-blink");
                    lizard.classList.add("lizard-walk-anim");
                    lizardState = "chasing"; 
                }
            }, 2500);
        }
    } 
    else if (lizardState === "chasing") {
        targetX = mouseX;
        targetY = mouseY;
        moveTowardsTarget(3.5); 
    }
    else if (lizardState === "escaping") {
        moveTowardsTarget(7); 
        if (posX < -150 || posX > window.innerWidth + 150 || posY < -150 || posY > window.innerHeight + 150) {
            hideLizardImmediately();
            return; 
        }
    }

    if (lizardState !== "panicking") {
        lizard.style.transform = `translate(${posX}px, ${posY}px) rotate(${angle}rad)`;
    }

    requestAnimationFrame(updateLizardBehavior);
}

function moveTowardsTarget(currentSpeed) {
    let dx = targetX - posX;
    let dy = targetY - posY;
    let distance = Math.hypot(dx, dy);

    if (distance > 5) {
        angle = Math.atan2(dy, dx);
        posX += Math.cos(angle) * currentSpeed;
        posY += Math.sin(angle) * currentSpeed;
    }
}

function triggerEscapeRoutine() {
    lizardState = "panicking";
    lizard.classList.remove("lizard-walk-anim");
    lizard.classList.add("lizard-panic");

    setTimeout(() => {
        if (lizardState !== "panicking") return;
        lizard.classList.remove("lizard-panic");
        lizard.classList.add("lizard-walk-anim");
        
        let startTime = Date.now();
        let radius = 40;
        let startX = posX;
        let startY = posY;

        function runLoop() {
            let elapsed = Date.now() - startTime;
            if (elapsed < 800) { 
                let alpha = (elapsed / 800) * Math.PI * 2;
                posX = startX + Math.sin(alpha) * radius;
                posY = startY + (1 - Math.cos(alpha)) * radius;
                angle = alpha + Math.PI / 2;
                lizard.style.transform = `translate(${posX}px, ${posY}px) rotate(${angle}rad)`;
                requestAnimationFrame(runLoop);
            } else {
                const escapeSides = [
                    {x: -200, y: posY}, 
                    {x: window.innerWidth + 200, y: posY}, 
                    {x: posX, y: -200}, 
                    {x: posX, y: window.innerHeight + 200}
                ];
                let chosenSide = escapeSides[Math.floor(Math.random() * escapeSides.length)];
                targetX = chosenSide.x;
                targetY = chosenSide.y;
                lizardState = "escaping";
            }
        }
        runLoop();
    }, 600);
}

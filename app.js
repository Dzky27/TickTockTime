/* ============================================
   TICKTOCK TIME — APP.JS (Refactored)
   Tug of War completely removed.
   Multiple Choice & Time Challenge (Group) kept.
   ============================================ */

'use strict';

// ===== CONFIG =====
const QUIZ_LENGTH = 30;
const GROUP_TIMER = 30;
const CORRECT_SCORE = 10;
const FAST_BONUS = 2;
const WRONG_PENALTY = 2;

const GROUP_COLORS = ['#BDD8F1', '#7CB9E8', '#A8DADC', '#C8E7FA', '#95C3E5', '#8AB6D6'];
const GROUP_AVATARS = ['🦁', '🐼', '🦊', '🐸', '🐧', '🐯'];

// ===== ACHIEVEMENTS =====
const ACHIEVEMENTS = [
    { id: 'first', icon: '🎯', name: 'First!', desc: 'Finish your first quiz', condition: (s, c, w) => true },
    { id: 'perfect', icon: '💯', name: 'Perfect!', desc: 'Zero wrong answers', condition: (s, c, w) => w === 0 },
    { id: 'speed', icon: '⚡', name: 'Fast!', desc: 'Fast bonus 10 times', condition: (s, c, w, b) => b >= 10 },
    { id: 'high300', icon: '🏆', name: 'Champion!', desc: 'Score 250+', condition: (s) => s >= 250 },
    { id: 'high200', icon: '🥇', name: 'Great!', desc: 'Score 200+', condition: (s) => s >= 200 },
    { id: 'comeback', icon: '💪', name: 'Comeback!', desc: 'Positive score despite mistakes', condition: (s, c, w) => s > 0 && w > 5 },
];

// ===== MASCOT MESSAGES =====
const MASCOT_MESSAGES = [
    "Let's learn together! 🕐",
    "You can do it! Keep going! 💪",
    "Learning while playing is fun! 🎉",
    "What time is it now? 🤔",
    "Ready to become a clock master? 🏆",
    "Great job! Stay focused! ⭐",
];

// ===== TIME QUESTION POOL =====
function makeClockTime(h, m) {
    const h12 = h % 12 || 12;
    let sentence = '';
    if (m === 0) sentence = `It is ${h12} o'clock`;
    else if (m === 30) sentence = `It is half past ${h12}`;
    else if (m === 15) sentence = `It is quarter past ${h12}`;
    else if (m === 45) sentence = `It is quarter to ${(h12 % 12) + 1}`;
    else if (m === 55) sentence = `It is five to ${(h12 % 12) + 1}`;
    else if (m === 10) sentence = `It is ten past ${h12}`;
    else if (m === 20) sentence = `It is twenty past ${h12}`;
    else if (m === 5) sentence = `It is five past ${h12}`;
    else if (m === 25) sentence = `It is twenty five past ${h12}`;
    else if (m === 35) sentence = `It is twenty five to ${(h12 % 12) + 1}`;
    else if (m === 40) sentence = `It is twenty to ${(h12 % 12) + 1}`;
    else if (m === 50) sentence = `It is ten to ${(h12 % 12) + 1}`;
    else sentence = `It is ${m} minutes past ${h12}`;
    const hDisp = h12;
    const mDisp = m.toString().padStart(2, '0');
    return { hour: h, minute: m, hour12: h12, display: `${hDisp}:${mDisp}`, sentence };
}

const TIME_POOL = [
    makeClockTime(1, 0), makeClockTime(2, 0), makeClockTime(3, 0),
    makeClockTime(4, 0), makeClockTime(5, 0), makeClockTime(6, 0),
    makeClockTime(7, 0), makeClockTime(8, 0), makeClockTime(9, 0),
    makeClockTime(10, 0), makeClockTime(11, 0), makeClockTime(12, 0),
    makeClockTime(1, 30), makeClockTime(2, 30), makeClockTime(3, 30),
    makeClockTime(4, 30), makeClockTime(5, 30), makeClockTime(6, 30),
    makeClockTime(7, 30), makeClockTime(8, 30),
    makeClockTime(1, 15), makeClockTime(2, 15), makeClockTime(3, 15),
    makeClockTime(4, 15), makeClockTime(6, 15), makeClockTime(9, 15),
    makeClockTime(1, 45), makeClockTime(2, 45), makeClockTime(3, 45),
    makeClockTime(5, 45), makeClockTime(8, 45), makeClockTime(11, 45),
    makeClockTime(1, 55), makeClockTime(3, 55), makeClockTime(7, 55),
    makeClockTime(2, 10), makeClockTime(5, 10), makeClockTime(9, 10),
    makeClockTime(2, 20), makeClockTime(4, 20), makeClockTime(8, 20),
    makeClockTime(3, 5), makeClockTime(7, 5), makeClockTime(11, 5),
    makeClockTime(3, 25), makeClockTime(6, 25), makeClockTime(10, 25),
    makeClockTime(4, 35), makeClockTime(7, 35), makeClockTime(9, 35),
    makeClockTime(2, 40), makeClockTime(5, 40), makeClockTime(8, 40),
    makeClockTime(1, 50), makeClockTime(4, 50), makeClockTime(10, 50),
];

function buildQuestionBank() {
    const bank = [];
    const shuffled = [...TIME_POOL].sort(() => Math.random() - 0.5);
    shuffled.forEach((t, i) => {
        const qType = i % 6;
        if (qType === 0) {
            const wrongs = TIME_POOL.filter(x => x.sentence !== t.sentence)
                .sort(() => Math.random() - .5).slice(0, 3).map(x => x.sentence);
            bank.push({
                type: 'mc',
                question: 'What time is shown in the clock below?',
                answer: t.sentence,
                options: shuffle([t.sentence, ...wrongs]),
                clockData: t,
                hint: 'Look at the position of the clock hands carefully!'
            });
        } else if (qType === 1) {
            bank.push({
                type: 'arrange',
                question: 'Arrange the following words to form a correct sentence!',
                answer: t.sentence,
                words: shuffle(t.sentence.split(' ')),
                clockData: t
            });
        } else if (qType === 2) {
            const wrongs = TIME_POOL.filter(x => x.sentence !== t.sentence)
                .sort(() => Math.random() - .5).slice(0, 3).map(x => x.sentence);
            bank.push({
                type: 'digital',
                question: `What does the digital clock show? ${t.display}`,
                answer: t.sentence,
                options: shuffle([t.sentence, ...wrongs]),
                clockData: t
            });
        } else if (qType === 3) {
            const wrongs = TIME_POOL.filter(x => x.display !== t.display)
                .sort(() => Math.random() - .5).slice(0, 3).map(x => x.display);
            bank.push({
                type: 'mc',
                question: `"${t.sentence}" — what time does the digital clock show?`,
                answer: t.display,
                options: shuffle([t.display, ...wrongs]),
                clockData: t,
                isDigitalChoice: true
            });
        } else if (qType === 4) {
            bank.push({
                type: 'drag',
                question: `Rotate the clock hands so they show: "${t.sentence}"`,
                answer: t,
                clockData: t
            });
        } else {
            const wrongs = TIME_POOL.filter(x => x.sentence !== t.sentence)
                .sort(() => Math.random() - .5).slice(0, 3);
            bank.push({
                type: 'mc_clock',
                question: `What time does the clock show? "${t.sentence}"`,
                answer: t.display,
                options: [t, ...wrongs].sort(() => Math.random() - .5),
                clockData: t
            });
        }
    });
    return bank;
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ===== STATE =====
let state = {
    screen: 'loading',
    questions: [],
    current: 0,
    score: 0,
    correct: 0,
    wrong: 0,
    fastBonuses: 0,
    questionStart: 0,
    currentAnswer: null,
    groups: [],
    groupCount: 3,
    groupQuestions: [],
    groupCurrent: 0,
    groupCurrentTeam: 0,
    groupTimer: null,
    groupTimerVal: 0,
    groupAnswer: null,
    dragAngle: { hour: 0, minute: 0 },
    arrangedWords: [],
    wordBankWords: [],
    matchSelected: null,
    matchPairs: {},
};

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (event) => {
        const btn = event.target.closest('button');
        if (btn) playAppSound('click');
    });
    setupMascotInteractivity();
    animateLoadingClock();
    let progress = 0;
    const bar = document.getElementById('loadingBar');
    const interval = setInterval(() => {
        progress += Math.random() * 20 + 8;
        bar.style.width = Math.min(progress, 100) + '%';
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('done');
                showPage('landing-page');
                initLanding();
            }, 500);
        }
    }, 120);
});

function animateLoadingClock() {
    let deg = 0;
    setInterval(() => {
        deg += 6;
        const hDeg = deg / 12;
        const h = document.getElementById('loadHour');
        const m = document.getElementById('loadMinute');
        if (h) h.style.transform = `translateX(-50%) rotate(${hDeg}deg)`;
        if (m) m.style.transform = `translateX(-50%) rotate(${deg}deg)`;
    }, 50);
}

function setupMascotInteractivity() {
    const gestures = ['gesture-bounce', 'gesture-wave', 'gesture-tilt', 'gesture-squint'];
    const speechPrompts = [
        'Let’s learn with a smile! 🎉',
        'Try tapping a quiz! 🕹️',
        'Good choice! Keep going! 💪',
        'Nice! That feels awesome! ✨'
    ];
    document.querySelectorAll('.mascot').forEach(mascot => {
        mascot.addEventListener('click', () => {
            const gesture = gestures[Math.floor(Math.random() * gestures.length)];
            mascot.classList.remove(...gestures);
            mascot.classList.add(gesture);

            const speech = mascot.closest('.menu-mascot') ?
                mascot.closest('.menu-mascot').querySelector('.menu-mascot-speech') :
                mascot.querySelector('.mascot-speech');
            if (speech) {
                if (!speech.dataset.defaultText) speech.dataset.defaultText = speech.textContent;
                speech.textContent = speechPrompts[Math.floor(Math.random() * speechPrompts.length)];
                speech.style.opacity = '1';
            }

            setTimeout(() => {
                mascot.classList.remove(gesture);
                if (speech && speech.dataset.defaultText) {
                    speech.textContent = speech.dataset.defaultText;
                }
            }, 1200);
        });
    });
}

const FUN_FACTS = [
    "Did you know? There are 1,440 minutes in a day! ⏰",
    "The clock was invented over 600 years ago! 🏰",
    "When the big hand is on 12, it's o'clock! 🕛",
    "Half past means 30 minutes past the hour! ⏱️",
    "Quarter past = 15 minutes after the hour! 🌟",
    "There are 86,400 seconds in one day! 🚀",
    "Quarter to = 15 minutes BEFORE the next hour! 💡",
    "The minute hand travels 360° every hour! 🔄",
];

function initLanding() {
    // Animate both landing & menu mascot hands
    let deg = 0;
    setInterval(() => {
        deg += 3;
        ['mascotHour', 'mascotHour2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.transform = `translateX(-50%) rotate(${deg/12}deg)`;
        });
        ['mascotMin', 'mascotMin2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.transform = `translateX(-50%) rotate(${deg}deg)`;
        });
    }, 50);

    // Rotate mascot speech messages
    let msgIdx = 0;
    setInterval(() => {
        msgIdx = (msgIdx + 1) % MASCOT_MESSAGES.length;
        const el = document.getElementById('mascotSpeech');
        if (el) {
            el.style.opacity = '0';
            setTimeout(() => {
                el.textContent = MASCOT_MESSAGES[msgIdx];
                el.style.opacity = '1';
            }, 300);
        }
    }, 4000);
    const sp = document.getElementById('mascotSpeech');
    if (sp) sp.style.transition = 'opacity .3s';

    // Fun fact ticker rotation
    let factIdx = 0;
    const tickerEl = document.getElementById('tickerText');
    if (tickerEl) {
        setInterval(() => {
            factIdx = (factIdx + 1) % FUN_FACTS.length;
            tickerEl.style.opacity = '0';
            setTimeout(() => {
                tickerEl.textContent = FUN_FACTS[factIdx];
                tickerEl.style.opacity = '1';
            }, 400);
        }, 5000);
        tickerEl.style.transition = 'opacity .4s';
    }

    // Randomize floating element animation durations for variety
    document.querySelectorAll('.fw-star,.fw-emoji,.fw-shape').forEach(el => {
        el.style.setProperty('--dur', (3 + Math.random() * 5).toFixed(1) + 's');
    });

    // High score
    updateHighScoreDisplay();

    // Badges
    const earned = JSON.parse(localStorage.getItem('clockBadges') || '[]');
    const badgesRow = document.getElementById('badgesRow');
    if (badgesRow) {
        earned.forEach(id => {
            const badge = ACHIEVEMENTS.find(b => b.id === id);
            if (badge) {
                const el = document.createElement('div');
                el.className = 'badge-item';
                el.innerHTML = `${badge.icon} ${badge.name}`;
                badgesRow.appendChild(el);
            }
        });
    }
}

// ===== PAGE NAVIGATION =====
function updateHighScoreDisplay() {
    const storedHS = parseInt(localStorage.getItem('clockHS'), 10);
    const w = document.getElementById('highScoreWrap');
    const v = document.getElementById('highScoreVal');
    if (Number.isFinite(storedHS) && storedHS > 0) {
        if (w) w.style.display = 'flex';
        if (v) v.textContent = storedHS;
    } else {
        localStorage.removeItem('clockHS');
        if (v) v.textContent = '0';
        if (w) w.style.display = 'none';
    }
}

function playAppSound(name) {
    const audio = document.getElementById('sound-' + name);
    if (!audio) return;
    audio.currentTime = 0;
    audio.volume = 0.75;
    audio.play().catch(() => {});
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    state.screen = id;
    if (id === 'landing-page') playAppSound('landing');
}

function showQuizMenu() {
    showPage('quiz-menu');
}

// ===== INDIVIDUAL QUIZ (Multiple Choice mode) =====
function startIndividualQuiz() {
    const bank = buildQuestionBank();
    state.questions = shuffle(bank).slice(0, QUIZ_LENGTH);
    state.current = 0;
    state.score = 0;
    state.correct = 0;
    state.wrong = 0;
    state.fastBonuses = 0;
    showPage('individual-quiz');
    renderQuestion();
}

function renderQuestion() {
    const q = state.questions[state.current];
    state.currentAnswer = null;
    state.questionStart = Date.now();

    document.getElementById('qNum').textContent = state.current + 1;
    document.getElementById('qTotal').textContent = QUIZ_LENGTH;
    document.getElementById('currentScore').textContent = state.score;
    const pct = (state.current / QUIZ_LENGTH) * 100;
    document.getElementById('progressBar').style.width = pct + '%';

    const body = document.getElementById('quizBody');
    body.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'question-card';

    const typeBadge = document.createElement('div');
    typeBadge.className = 'question-type-badge ' + getTypeBadgeClass(q.type);
    typeBadge.textContent = getTypeLabel(q.type);
    card.appendChild(typeBadge);
    card.appendChild(buildQuestionDecoration(q));

    const qt = document.createElement('div');
    qt.className = 'question-text';
    qt.textContent = q.question;
    card.appendChild(qt);

    if (q.clockData && (q.type === 'mc' || q.type === 'arrange') && !q.isDigitalChoice) {
        card.appendChild(buildAnalogClock(q.clockData, 160));
    }

    if (q.type === 'mc' || q.type === 'digital') {
        card.appendChild(buildMCOptions(q));
    } else if (q.type === 'mc_clock') {
        card.appendChild(buildMCClockOptions(q));
    } else if (q.type === 'arrange') {
        card.appendChild(buildArrangeWords(q));
    } else if (q.type === 'drag') {
        card.appendChild(buildDragClock(q));
    }

    body.appendChild(card);

    const btn = document.getElementById('checkBtn');
    btn.disabled = (q.type === 'drag') ? false : true;
    btn.textContent = '✓ Check Answer';

    if (q.type === 'drag') {
        state.currentAnswer = 'drag';
        btn.disabled = false;
    }

    document.getElementById('feedbackPopup').classList.add('hidden');
}

function getTypeBadgeClass(type) {
    return {
        mc: 'type-mc',
        digital: 'type-mc',
        mc_clock: 'type-match',
        arrange: 'type-arrange',
        drag: 'type-drag',
        match: 'type-match'
    }[type] || 'type-mc';
}

function getTypeLabel(type) {
    return {
        mc: 'Multiple Choice',
        digital: 'Digital Clock',
        mc_clock: 'Point the Correct Time',
        arrange: 'Arrange Words',
        drag: 'Drag the Clock Hands',
        match: 'Match the Times'
    }[type] || 'Multiple Choice';
}

function buildQuestionDecoration(q) {
    const row = document.createElement('div');
    row.className = 'question-deco-row';
    const label = document.createElement('span');
    label.className = 'question-deco-label';
    label.textContent = 'Learning Material';
    row.appendChild(label);
    const icons = q.type === 'arrange' ? ['🧩', '✍️', '🕒'] : q.type === 'drag' ? ['🕹️', '⏱️', '✅'] : ['⏰', '✨', '🧠'];
    icons.forEach(icon => {
        const item = document.createElement('span');
        item.className = 'question-deco-item';
        item.textContent = icon;
        row.appendChild(item);
    });
    return row;
}

// ── Analog Clock ──
function buildAnalogClock(t, size = 160) {
    const wrap = document.createElement('div');
    wrap.className = 'clock-container';
    const clock = document.createElement('div');
    clock.className = 'analog-clock';
    clock.style.width = size + 'px';
    clock.style.height = size + 'px';
    const face = document.createElement('div');
    face.className = 'clock-face';
    face.style.overflow = 'visible';

    for (let i = 0; i < 12; i++) {
        const tick = document.createElement('div');
        tick.className = 'clock-tick';
        tick.style.transform = `translateX(-50%) rotate(${i*30}deg)`;
        tick.style.top = '4px';
        face.appendChild(tick);
    }
    [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((n, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const r = 0.38;
        const x = 50 + r * 100 * Math.cos(angle);
        const y = 50 + r * 100 * Math.sin(angle);
        const num = document.createElement('span');
        num.className = 'num-label';
        num.textContent = n;
        num.style.left = x + '%';
        num.style.top = y + '%';
        num.style.transform = 'translate(-50%,-50%)';
        face.appendChild(num);
    });

    const { hourDeg, minuteDeg } = getHandAngles(t.hour, t.minute);
    const hHand = document.createElement('div');
    hHand.className = 'quiz-hour-hand';
    hHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    const mHand = document.createElement('div');
    mHand.className = 'quiz-min-hand';
    mHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    const dot = document.createElement('div');
    dot.className = 'clock-dot';

    face.appendChild(hHand);
    face.appendChild(mHand);
    face.appendChild(dot);
    clock.appendChild(face);
    wrap.appendChild(clock);
    return wrap;
}

function getHandAngles(hour, minute) {
    return { hourDeg: (hour % 12) * 30 + minute * 0.5, minuteDeg: minute * 6 };
}

// ── MC Options ──
function buildMCOptions(q) {
    const grid = document.createElement('div');
    grid.className = 'options-grid';
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => selectMCOption(btn, opt, q.answer, grid);
        grid.appendChild(btn);
    });
    return grid;
}

function selectMCOption(btn, opt, correct, grid) {
    grid.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.currentAnswer = opt;
    document.getElementById('checkBtn').disabled = false;
}

// ── MC Clock Options ──
function buildMCClockOptions(q) {
    const grid = document.createElement('div');
    grid.className = 'options-grid';
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.style.padding = '8px';
        const miniClock = buildAnalogClock(opt, 100);
        miniClock.style.margin = '0 auto 4px';
        btn.appendChild(miniClock);
        const label = document.createElement('div');
        label.style.fontSize = '12px';
        label.textContent = opt.display;
        btn.appendChild(label);
        btn.onclick = () => {
            grid.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.currentAnswer = opt.display;
            document.getElementById('checkBtn').disabled = false;
        };
        grid.appendChild(btn);
    });
    return grid;
}

// ── Arrange Words ──
function buildArrangeWords(q) {
    const wrap = document.createElement('div');
    state.arrangedWords = [];
    state.wordBankWords = [...q.words];
    const bankLabel = document.createElement('div');
    bankLabel.style.cssText = 'font-size:13px;font-weight:700;color:#636e72;margin-bottom:6px;';
    bankLabel.textContent = 'Words available:';
    wrap.appendChild(bankLabel);
    const bank = document.createElement('div');
    bank.className = 'word-bank';
    bank.id = 'wordBank';
    const answerLabel = document.createElement('div');
    answerLabel.style.cssText = 'font-size:13px;font-weight:700;color:#636e72;margin-bottom:6px;';
    answerLabel.textContent = 'Answer:';
    const answerArea = document.createElement('div');
    answerArea.className = 'arrange-answer';
    answerArea.id = 'arrangeAnswer';
    q.words.forEach(word => {
        const chip = createWordChip(word, bank, answerArea, false);
        bank.appendChild(chip);
    });
    wrap.appendChild(bank);
    wrap.appendChild(answerLabel);
    wrap.appendChild(answerArea);
    return wrap;
}

function createWordChip(word, bankEl, answerEl, inAnswer) {
    const chip = document.createElement('div');
    chip.className = 'word-chip' + (inAnswer ? ' placed' : '');
    chip.textContent = word;
    chip.dataset.word = word;
    chip.onclick = () => {
        if (!inAnswer) {
            chip.remove();
            state.arrangedWords.push(word);
            answerEl.appendChild(createWordChip(word, bankEl, answerEl, true));
        } else {
            chip.remove();
            const idx = state.arrangedWords.indexOf(word);
            if (idx > -1) state.arrangedWords.splice(idx, 1);
            bankEl.appendChild(createWordChip(word, bankEl, answerEl, false));
        }
        const chips = answerEl.querySelectorAll('.word-chip');
        state.currentAnswer = Array.from(chips).map(c => c.dataset.word).join(' ');
        document.getElementById('checkBtn').disabled = chips.length === 0;
    };
    return chip;
}

// ── Drag Clock ──
function buildDragClock(q) {
    const wrap = document.createElement('div');
    wrap.className = 'drag-clock-wrap';
    const instr = document.createElement('div');
    instr.className = 'drag-instruction';
    instr.innerHTML = '🖱️ Click on the clock to set the hands<br>Single click = hour, double click = minute';
    wrap.appendChild(instr);
    const clock = document.createElement('div');
    clock.className = 'drag-clock';
    clock.id = 'dragClock';
    const face = document.createElement('div');
    face.className = 'clock-face';
    for (let i = 0; i < 12; i++) {
        const tick = document.createElement('div');
        tick.className = 'clock-tick';
        tick.style.transform = `translateX(-50%) rotate(${i*30}deg)`;
        tick.style.top = '4px';
        face.appendChild(tick);
    }
    [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((n, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const r = 0.36;
        const x = 50 + r * 100 * Math.cos(angle);
        const y = 50 + r * 100 * Math.sin(angle);
        const num = document.createElement('span');
        num.className = 'num-label';
        num.textContent = n;
        num.style.left = x + '%';
        num.style.top = y + '%';
        num.style.transform = 'translate(-50%,-50%)';
        face.appendChild(num);
    });
    state.dragAngle = { hour: 0, minute: 0 };
    let dragMode = 'hour';
    const hHand = document.createElement('div');
    hHand.className = 'drag-h-hand';
    hHand.id = 'dragHourHand';
    hHand.style.transform = 'translateX(-50%) rotate(0deg)';
    const mHand = document.createElement('div');
    mHand.className = 'drag-m-hand';
    mHand.id = 'dragMinHand';
    mHand.style.transform = 'translateX(-50%) rotate(0deg)';
    const center = document.createElement('div');
    center.className = 'drag-center';
    face.appendChild(hHand);
    face.appendChild(mHand);
    face.appendChild(center);
    clock.appendChild(face);
    const modeWrap = document.createElement('div');
    modeWrap.style.cssText = 'display:flex;gap:10px;margin-top:8px;';
    const hourBtn = document.createElement('button');
    hourBtn.className = 'option-btn selected';
    hourBtn.style.padding = '8px 20px';
    hourBtn.textContent = '🕐 Set Hour';
    const minBtn = document.createElement('button');
    minBtn.className = 'option-btn';
    minBtn.style.padding = '8px 20px';
    minBtn.textContent = '⏱ Set Minute';
    hourBtn.onclick = () => {
        dragMode = 'hour';
        hourBtn.classList.add('selected');
        minBtn.classList.remove('selected');
    };
    minBtn.onclick = () => {
        dragMode = 'minute';
        minBtn.classList.add('selected');
        hourBtn.classList.remove('selected');
    };
    modeWrap.appendChild(hourBtn);
    modeWrap.appendChild(minBtn);
    clock.addEventListener('click', (e) => {
        const rect = clock.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        if (dragMode === 'hour') {
            state.dragAngle.hour = angle;
            hHand.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        } else {
            state.dragAngle.minute = angle;
            mHand.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        }
        updateDragDisplay();
        state.currentAnswer = 'drag';
        document.getElementById('checkBtn').disabled = false;
    });
    const display = document.createElement('div');
    display.className = 'drag-time-display';
    display.id = 'dragTimeDisplay';
    display.textContent = '12:00';
    wrap.appendChild(clock);
    wrap.appendChild(modeWrap);
    wrap.appendChild(display);
    return wrap;
}

function updateDragDisplay() {
    const hours = Math.round(state.dragAngle.hour / 30) % 12 || 12;
    const minutes = Math.round(state.dragAngle.minute / 6) % 60;
    const el = document.getElementById('dragTimeDisplay');
    if (el) el.textContent = `${hours}:${minutes.toString().padStart(2,'0')}`;
}

function getDragAnswer() {
    return { hours: Math.round(state.dragAngle.hour / 30) % 12 || 12, minutes: Math.round(state.dragAngle.minute / 6) % 60 };
}

// ===== CHECK ANSWER =====
function checkAnswer() {
    const q = state.questions[state.current];
    const elapsed = (Date.now() - state.questionStart) / 1000;
    let isCorrect = false;
    if (q.type === 'arrange') {
        const chips = document.querySelectorAll('#arrangeAnswer .word-chip');
        state.currentAnswer = Array.from(chips).map(c => c.dataset.word).join(' ');
        isCorrect = state.currentAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
    } else if (q.type === 'drag') {
        const { hours, minutes } = getDragAnswer();
        const target = q.answer;
        isCorrect = Math.abs((hours % 12) - (target.hour12 % 12)) <= 1 && Math.abs(minutes - target.minute) <= 3;
    } else {
        isCorrect = state.currentAnswer === q.answer;
    }
    let scoreChange = 0;
    let isFast = false;
    if (isCorrect) {
        scoreChange = CORRECT_SCORE;
        if (elapsed < 5) {
            scoreChange += FAST_BONUS;
            isFast = true;
            state.fastBonuses++;
        }
        state.correct++;
        playAppSound('right');
    } else {
        scoreChange = -WRONG_PENALTY;
        state.wrong++;
        if (q.type === 'mc' || q.type === 'digital') {
            document.querySelectorAll('#quizBody .option-btn').forEach(btn => {
                if (btn.classList.contains('selected')) btn.classList.add('wrong');
                if (btn.textContent === q.answer) btn.classList.add('correct');
            });
        }
    }
    state.score = Math.max(0, state.score + scoreChange);
    document.getElementById('currentScore').textContent = state.score;
    showFeedback(isCorrect, scoreChange, isFast, q.answer);
}

function showFeedback(isCorrect, scoreChange, isFast, correctAns) {
    const popup = document.getElementById('feedbackPopup');
    const inner = document.getElementById('feedbackInner');
    const msgs = ['Great! 🎉', 'Correct! ✅', 'Outstanding! 🌟', 'Excellent! 💯', 'Awesome! 🔥'];
    if (isCorrect) {
        document.getElementById('feedbackEmoji').textContent = isFast ? '⚡' : '🎉';
        document.getElementById('feedbackMsg').textContent = msgs[Math.floor(Math.random() * msgs.length)];
        document.getElementById('feedbackMsg').style.color = '#27ae60';
        document.getElementById('feedbackScore').textContent = `+${scoreChange} points${isFast?' (Fast Bonus! ⚡)':''}`;
        inner.style.borderTop = '6px solid #27ae60';
        launchMiniConfetti();
    } else {
        document.getElementById('feedbackEmoji').textContent = '😢';
        document.getElementById('feedbackMsg').textContent = 'Almost! Try again!';
        document.getElementById('feedbackMsg').style.color = '#e74c3c';
        document.getElementById('feedbackScore').textContent = `-${WRONG_PENALTY} points | Answer: ${correctAns}`;
        inner.style.borderTop = '6px solid #e74c3c';
        playAppSound('wrong');
    }
    document.getElementById('feedbackNext').textContent =
        state.current + 1 >= QUIZ_LENGTH ? '🏆 View Results!' : 'Next ➜';
    popup.classList.remove('hidden');
}

function nextQuestion() {
    document.getElementById('feedbackPopup').classList.add('hidden');
    state.current++;
    if (state.current >= QUIZ_LENGTH) showResult();
    else renderQuestion();
}

// ===== RESULT =====
function showResult() {
    showPage('result-page');
    const prevHS = parseInt(localStorage.getItem('clockHS') || '0', 10);
    if (state.score > prevHS) {
        localStorage.setItem('clockHS', state.score);
        updateHighScoreDisplay();
    }

    const trophy = document.getElementById('resultTrophy');
    if (state.score >= 250) trophy.textContent = '🏆';
    else if (state.score >= 180) trophy.textContent = '🥇';
    else if (state.score >= 120) trophy.textContent = '🥈';
    else trophy.textContent = '🎖';

    document.getElementById('finalScore').textContent = state.score;

    document.getElementById('resultStats').innerHTML = `
    <div class="stat-item">
      <div class="stat-val" style="color:var(--green)">✅ ${state.correct}</div>
      <div class="stat-label">Correct</div>
    </div>
    <div class="stat-item">
      <div class="stat-val" style="color:var(--primary)">❌ ${state.wrong}</div>
      <div class="stat-label">Wrong</div>
    </div>
    <div class="stat-item">
      <div class="stat-val" style="color:var(--orange)">⚡ ${state.fastBonuses}</div>
      <div class="stat-label">Fast Bonus</div>
    </div>
  `;

    const earned = JSON.parse(localStorage.getItem('clockBadges') || '[]');
    const newBadges = [];
    ACHIEVEMENTS.forEach(badge => {
        if (!earned.includes(badge.id)) {
            if (badge.condition(state.score, state.correct, state.wrong, state.fastBonuses)) {
                earned.push(badge.id);
                newBadges.push(badge);
            }
        }
    });
    localStorage.setItem('clockBadges', JSON.stringify(earned));

    const badgesEl = document.getElementById('resultBadges');
    badgesEl.innerHTML = '';
    ACHIEVEMENTS.filter(b => earned.includes(b.id)).forEach(b => {
        const el = document.createElement('div');
        el.className = 'badge-item';
        el.innerHTML = `${b.icon} ${b.name}`;
        if (newBadges.includes(b)) el.style.background = 'linear-gradient(135deg,var(--accent),#ffa500)';
        badgesEl.appendChild(el);
    });

    launchConfetti();
}

// ===== GROUP QUIZ (Time Challenge) =====
function showGroupSetup() {
    showPage('group-setup');
    renderGroupInputs();
}

function changeGroupCount(delta) {
    state.groupCount = Math.max(2, Math.min(6, state.groupCount + delta));
    document.getElementById('groupCountDisplay').textContent = state.groupCount;
    renderGroupInputs();
}

function renderGroupInputs() {
    const container = document.getElementById('groupInputs');
    container.innerHTML = '';
    for (let i = 0; i < state.groupCount; i++) {
        const row = document.createElement('div');
        row.className = 'group-input-row';
        const dot = document.createElement('div');
        dot.className = 'group-color-dot';
        dot.style.background = GROUP_COLORS[i];
        const avatar = document.createElement('div');
        avatar.className = 'group-avatar';
        avatar.textContent = GROUP_AVATARS[i];
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Name of Group ${i+1}`;
        input.value = (state.groups[i] && state.groups[i].name) ? state.groups[i].name : `Group ${i+1}`;
        input.id = `groupName${i}`;
        row.appendChild(dot);
        row.appendChild(avatar);
        row.appendChild(input);
        container.appendChild(row);
    }
}

function startGroupQuiz() {
    state.groups = [];
    for (let i = 0; i < state.groupCount; i++) {
        const nameEl = document.getElementById(`groupName${i}`);
        state.groups.push({
            name: (nameEl && nameEl.value) ? nameEl.value : `Group ${i+1}`,
            color: GROUP_COLORS[i],
            avatar: GROUP_AVATARS[i],
            score: 0,
        });
    }
    const bank = buildQuestionBank();
    state.groupQuestions = shuffle(bank).slice(0, QUIZ_LENGTH);
    state.groupCurrent = 0;
    state.groupCurrentTeam = 0;
    showPage('group-quiz');
    renderGroupMiniLB();
    renderGroupQuestion();
}

function renderGroupMiniLB() {
    const el = document.getElementById('groupLeaderMini');
    el.innerHTML = '';
    const sorted = [...state.groups].sort((a, b) => b.score - a.score);
    sorted.forEach(g => {
        const isCurrentTurn = state.groups.indexOf(g) === state.groupCurrentTeam;
        const div = document.createElement('div');
        div.className = 'mini-team' + (isCurrentTurn ? ' current' : '');
        div.innerHTML = `<div class="mini-team-dot" style="background:${g.color}"></div>
      <span>${g.avatar}</span><span>${g.name}</span>
      <span class="mini-team-score">${g.score}</span>`;
        el.appendChild(div);
    });
}

function renderGroupQuestion() {
    const q = state.groupQuestions[state.groupCurrent];
    const team = state.groups[state.groupCurrentTeam];
    const badge = document.getElementById('currentTeamBadge');
    badge.textContent = `${team.avatar} ${team.name}`;
    badge.style.background = team.color;
    document.getElementById('gqNum').textContent = state.groupCurrent + 1;
    state.groupAnswer = null;
    document.getElementById('gCheckBtn').disabled = true;

    const body = document.getElementById('groupQuizBody');
    body.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'question-card';
    card.style.borderTop = `6px solid ${team.color}`;

    const typeBadge = document.createElement('div');
    typeBadge.className = 'question-type-badge ' + getTypeBadgeClass(q.type);
    typeBadge.textContent = getTypeLabel(q.type);
    card.appendChild(typeBadge);
    card.appendChild(buildQuestionDecoration(q));

    const qt = document.createElement('div');
    qt.className = 'question-text';
    qt.textContent = q.question;
    card.appendChild(qt);

    if (q.clockData && (q.type === 'mc' || q.type === 'arrange') && !q.isDigitalChoice) {
        card.appendChild(buildAnalogClock(q.clockData, 160));
    }
    if (q.type === 'mc' || q.type === 'digital') {
        card.appendChild(buildGroupMCOptions(q));
    } else if (q.type === 'mc_clock') {
        card.appendChild(buildGroupMCClockOptions(q));
    } else if (q.type === 'arrange') {
        card.appendChild(buildArrangeWordsGroup(q));
    } else if (q.type === 'drag') {
        card.appendChild(buildDragClockGroup(q));
        document.getElementById('gCheckBtn').disabled = false;
    }

    body.appendChild(card);
    startGroupTimer();
}

function buildGroupMCOptions(q) {
    const grid = document.createElement('div');
    grid.className = 'options-grid';
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => {
            grid.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.groupAnswer = opt;
            document.getElementById('gCheckBtn').disabled = false;
        };
        grid.appendChild(btn);
    });
    return grid;
}

function buildGroupMCClockOptions(q) {
    const grid = document.createElement('div');
    grid.className = 'options-grid';
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.style.padding = '8px';
        const miniClock = buildAnalogClock(opt, 90);
        miniClock.style.margin = '0 auto 4px';
        btn.appendChild(miniClock);
        const label = document.createElement('div');
        label.style.fontSize = '12px';
        label.textContent = opt.display;
        btn.appendChild(label);
        btn.onclick = () => {
            grid.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.groupAnswer = opt.display;
            document.getElementById('gCheckBtn').disabled = false;
        };
        grid.appendChild(btn);
    });
    return grid;
}

function buildArrangeWordsGroup(q) {
    const wrap = document.createElement('div');
    const bank = document.createElement('div');
    bank.className = 'word-bank';
    bank.id = 'gWordBank';
    const answerArea = document.createElement('div');
    answerArea.className = 'arrange-answer';
    answerArea.id = 'gArrangeAnswer';
    q.words.forEach(word => {
        const chip = createGroupWordChip(word, bank, answerArea, false);
        bank.appendChild(chip);
    });
    const l1 = document.createElement('div');
    l1.style.cssText = 'font-size:13px;font-weight:700;color:#636e72;margin-bottom:6px;';
    l1.textContent = 'Words available:';
    const l2 = document.createElement('div');
    l2.style.cssText = 'font-size:13px;font-weight:700;color:#636e72;margin-bottom:6px;';
    l2.textContent = 'Answer:';
    wrap.appendChild(l1);
    wrap.appendChild(bank);
    wrap.appendChild(l2);
    wrap.appendChild(answerArea);
    return wrap;
}

function createGroupWordChip(word, bankEl, answerEl, inAnswer) {
    const chip = document.createElement('div');
    chip.className = 'word-chip' + (inAnswer ? ' placed' : '');
    chip.textContent = word;
    chip.dataset.word = word;
    chip.onclick = () => {
        if (!inAnswer) {
            chip.remove();
            answerEl.appendChild(createGroupWordChip(word, bankEl, answerEl, true));
        } else {
            chip.remove();
            bankEl.appendChild(createGroupWordChip(word, bankEl, answerEl, false));
        }
        const chips = answerEl.querySelectorAll('.word-chip');
        state.groupAnswer = Array.from(chips).map(c => c.dataset.word).join(' ');
        document.getElementById('gCheckBtn').disabled = chips.length === 0;
    };
    return chip;
}

function buildDragClockGroup(q) {
    const wrap = document.createElement('div');
    wrap.className = 'drag-clock-wrap';
    const instr = document.createElement('div');
    instr.className = 'drag-instruction';
    instr.innerHTML = '🖱️ Click on the clock to adjust the hands';
    wrap.appendChild(instr);
    const clock = document.createElement('div');
    clock.className = 'drag-clock';
    const face = document.createElement('div');
    face.className = 'clock-face';
    for (let i = 0; i < 12; i++) {
        const tick = document.createElement('div');
        tick.className = 'clock-tick';
        tick.style.transform = `translateX(-50%) rotate(${i*30}deg)`;
        tick.style.top = '4px';
        face.appendChild(tick);
    }
    state.dragAngle = { hour: 0, minute: 0 };
    let dragMode = 'hour';
    const hHand = document.createElement('div');
    hHand.className = 'drag-h-hand';
    hHand.id = 'gDragHourHand';
    hHand.style.transform = 'translateX(-50%) rotate(0deg)';
    const mHand = document.createElement('div');
    mHand.className = 'drag-m-hand';
    mHand.id = 'gDragMinHand';
    mHand.style.transform = 'translateX(-50%) rotate(0deg)';
    const center = document.createElement('div');
    center.className = 'drag-center';
    face.appendChild(hHand);
    face.appendChild(mHand);
    face.appendChild(center);
    clock.appendChild(face);
    const modeWrap = document.createElement('div');
    modeWrap.style.cssText = 'display:flex;gap:10px;margin-top:8px;';
    const hourBtn = document.createElement('button');
    hourBtn.className = 'option-btn selected';
    hourBtn.style.padding = '8px 20px';
    hourBtn.textContent = '🕐 Hour';
    const minBtn = document.createElement('button');
    minBtn.className = 'option-btn';
    minBtn.style.padding = '8px 20px';
    minBtn.textContent = '⏱ Minute';
    hourBtn.onclick = () => {
        dragMode = 'hour';
        hourBtn.classList.add('selected');
        minBtn.classList.remove('selected');
    };
    minBtn.onclick = () => {
        dragMode = 'minute';
        minBtn.classList.add('selected');
        hourBtn.classList.remove('selected');
    };
    modeWrap.appendChild(hourBtn);
    modeWrap.appendChild(minBtn);
    const display = document.createElement('div');
    display.className = 'drag-time-display';
    display.id = 'gDragDisplay';
    display.textContent = '12:00';
    clock.addEventListener('click', (e) => {
        const rect = clock.getBoundingClientRect();
        let angle = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        if (dragMode === 'hour') {
            state.dragAngle.hour = angle;
            hHand.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        } else {
            state.dragAngle.minute = angle;
            mHand.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        }
        const hours = Math.round(state.dragAngle.hour / 30) % 12 || 12;
        const minutes = Math.round(state.dragAngle.minute / 6) % 60;
        display.textContent = `${hours}:${minutes.toString().padStart(2,'0')}`;
        state.groupAnswer = 'drag';
        document.getElementById('gCheckBtn').disabled = false;
    });
    wrap.appendChild(clock);
    wrap.appendChild(modeWrap);
    wrap.appendChild(display);
    return wrap;
}

function startGroupTimer() {
    clearInterval(state.groupTimer);
    state.groupTimerVal = GROUP_TIMER;
    updateTimerDisplay();
    state.groupTimer = setInterval(() => {
        state.groupTimerVal--;
        updateTimerDisplay();
        if (state.groupTimerVal <= 0) {
            clearInterval(state.groupTimer);
            timeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const num = document.getElementById('timerNum');
    const arc = document.getElementById('timerArc');
    if (!num || !arc) return;
    num.textContent = state.groupTimerVal;
    arc.style.strokeDashoffset = 163 * (1 - state.groupTimerVal / GROUP_TIMER);
    if (state.groupTimerVal <= 10) {
        arc.style.stroke = 'var(--primary)';
        num.style.color = 'var(--primary)';
    } else if (state.groupTimerVal <= 20) {
        arc.style.stroke = 'var(--orange)';
        num.style.color = 'var(--orange)';
    } else {
        arc.style.stroke = 'var(--blue)';
        num.style.color = 'var(--dark)';
    }
}

function timeUp() {
    state.groupAnswer = null;
    checkGroupAnswer(true);
}

function checkGroupAnswer(isTimeUp = false) {
    clearInterval(state.groupTimer);
    const q = state.groupQuestions[state.groupCurrent];
    const team = state.groups[state.groupCurrentTeam];
    let isCorrect = false;
    if (!isTimeUp && state.groupAnswer) {
        if (q.type === 'arrange') {
            const chips = document.querySelectorAll('#gArrangeAnswer .word-chip');
            state.groupAnswer = Array.from(chips).map(c => c.dataset.word).join(' ');
            isCorrect = state.groupAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
        } else if (q.type === 'drag') {
            const h = Math.round(state.dragAngle.hour / 30) % 12 || 12;
            const m = Math.round(state.dragAngle.minute / 6) % 60;
            isCorrect = Math.abs((h % 12) - (q.answer.hour12 % 12)) <= 1 && Math.abs(m - q.answer.minute) <= 3;
        } else {
            isCorrect = state.groupAnswer === q.answer;
        }
    }
    if (isCorrect) {
        const tb = state.groupTimerVal > 20 ? FAST_BONUS : 0;
        team.score += CORRECT_SCORE + tb;
    } else { team.score = Math.max(0, team.score - WRONG_PENALTY); }
    renderGroupMiniLB();
    showGroupFeedback(isCorrect, team, q.answer, isTimeUp);
}

function showGroupFeedback(isCorrect, team, correctAns, isTimeUp) {
    const popup = document.getElementById('groupFeedback');
    document.getElementById('gFeedbackEmoji').textContent = isTimeUp ? '⏰' : (isCorrect ? '🎉' : '😢');
    document.getElementById('gFeedbackMsg').textContent = isTimeUp ? `Time's up! Answer: ${correctAns}` :
        (isCorrect ? `${team.name} Correct! +${CORRECT_SCORE}` : `${team.name} Wrong! -${WRONG_PENALTY}`);
    document.getElementById('gFeedbackMsg').style.color = isCorrect ? '#27ae60' : '#e74c3c';
    document.getElementById('gFeedbackScore').textContent = `Score ${team.name}: ${team.score}`;
    const nextBtn = popup.querySelector('.feedback-next');
    nextBtn.textContent = state.groupCurrent + 1 >= QUIZ_LENGTH ? '🏆 View Results!' : 'Next Turn ➜';
    popup.classList.remove('hidden');
    if (isCorrect) {
        playAppSound('right');
        launchMiniConfetti();
    } else {
        playAppSound('wrong');
    }
}

function nextGroupQuestion() {
    document.getElementById('groupFeedback').classList.add('hidden');
    state.groupCurrent++;
    state.groupCurrentTeam = (state.groupCurrentTeam + 1) % state.groups.length;
    if (state.groupCurrent >= QUIZ_LENGTH) showGroupResult();
    else {
        renderGroupQuestion();
        renderGroupMiniLB();
    }
}

function showGroupResult() {
    showPage('group-result');
    const sorted = [...state.groups].sort((a, b) => b.score - a.score);
    const winner = sorted[0];
    document.getElementById('winnerAnnounce').textContent = `🏆 The Winner: ${winner.avatar} ${winner.name} (${winner.score} points)`;
    const lb = document.getElementById('groupFinalLeaderboard');
    lb.innerHTML = '<h3 style="font-family:var(--font-head);margin-bottom:16px;font-size:22px;">📊 Final Rankings</h3>';
    const rankIcons = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣'];
    sorted.forEach((g, i) => {
        const row = document.createElement('div');
        row.className = `leaderboard-row rank-${i+1}`;
        row.style.animationDelay = `${i*.1}s`;
        row.innerHTML = `<div class="lb-rank">${rankIcons[i]}</div>
      <div class="lb-avatar">${g.avatar}</div>
      <div style="width:14px;height:14px;border-radius:50%;background:${g.color};flex-shrink:0"></div>
      <div class="lb-name">${g.name}</div>
      <div class="lb-score" style="color:${g.color}">${g.score}</div>`;
        lb.appendChild(row);
    });
    launchConfetti();
    playAppSound('winner');
}

// ===== CONFIRM EXIT =====
function confirmExit() {
    if (confirm('Are you sure you want to exit the quiz? Your progress will be lost!')) {
        clearInterval(state.groupTimer);
        showPage('quiz-menu');
    }
}

// ===== CONFETTI =====
let confettiAnimId = null;
const confettiParticles = [];

function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    confettiParticles.length = 0;
    const colors = ['#FFE66D', '#FF6B6B', '#4ECDC4', '#74B9FF', '#A29BFE', '#FF9F43', '#FD79A8'];
    for (let i = 0; i < 160; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: -20,
            r: Math.random() * 9 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - .5) * 5,
            vy: Math.random() * 4 + 2,
            rot: Math.random() * 360,
            rotSpeed: (Math.random() - .5) * 9,
            shape: Math.random() > .5 ? 'rect' : 'circle',
        });
    }
    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        confettiParticles.forEach(p => {
            if (p.y < canvas.height + 20) alive = true;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08;
            p.rot += p.rotSpeed;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.color;
            if (p.shape === 'rect') { ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
        if (alive) confettiAnimId = requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animate();
    setTimeout(() => {
        if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 5000);
}

function launchMiniConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const colors = ['#FFE66D', '#FF6B6B', '#4ECDC4', '#74B9FF', '#A29BFE'];
    const particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: canvas.width / 2 + (Math.random() - .5) * 240,
            y: canvas.height / 2 + (Math.random() - .5) * 120,
            r: Math.random() * 7 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - .5) * 9,
            vy: -(Math.random() * 7 + 2),
            rot: 0,
            rotSpeed: (Math.random() - .5) * 12,
            shape: 'circle',
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.22;
            p.rot += p.rotSpeed;
            if (p.y < canvas.height) alive = true;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        if (alive) requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animate();
}



/* ═══════════════════════════════════════════════════════════
   RACING BATTLE v2 — FULL ARCADE RACE ENGINE
   Parallax world · F1 lights · Engine audio · Overtake detect
   Each answer (correct OR wrong) → new question immediately
═══════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const RB = {
    FINISH: 100, // progress % to win
    PROGRESS_RIGHT: 7, // base progress per correct
    PROGRESS_COMBO3: 3, // bonus at combo≥3
    PROGRESS_TURBO: 6, // bonus at combo≥5
    SPEED_RIGHT: 10, // base speed per correct
    SPEED_COMBO3: 5, // bonus speed at combo≥3
    SPEED_TURBO: 14, // bonus speed at combo≥5
    SPEED_DECAY: 1.2, // speed decay per tick
    COMBO3: 3,
    TURBO: 5,
    TICK_MS: 120, // physics tick interval
    // Parallax scroll multipliers (px per speed unit per tick)
    SCROLL_ROAD: 2.2,
    SCROLL_SCENERY: 0.9,
    SCROLL_CLOUD: 0.28,
    MILESTONES: [25, 50, 75],
};

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let RBS = null; // initialised fresh on each start

function rbFreshState() {
    return {
        carPos: {
            p1: 0,
            p2: 0
        },

        cameraX: 0,
        active: false,
        raceStarted: false,
        winner: null,

        // per-player
        progress: { p1: 0, p2: 0 },
        speed: { p1: 0, p2: 0 },
        speedBase: { p1: 0, p2: 0 },
        speedBurst: { p1: 0, p2: 0 },
        score: { p1: 0, p2: 0 },
        correct: { p1: 0, p2: 0 },
        combo: { p1: 0, p2: 0 },
        bestCombo: { p1: 0, p2: 0 },
        locked: { p1: false, p2: false },

        // question banks (independent shuffled copies)
        bank: { p1: [], p2: [] },
        qIdx: { p1: 0, p2: 0 },
        totalQ: 0,

        // drag clock state per player
        dragAngle: { p1: { hour: 0, minute: 0 }, p2: { hour: 0, minute: 0 } },

        // milestones already triggered
        msTriggered: {
            p1: { 25: false, 50: false, 75: false },
            p2: { 25: false, 50: false, 75: false }
        },

        // overtake tracking
        prevLeader: null,

        // parallax scroll offsets
        scrollRoad: 0,
        scrollScenery: 0,
        scrollCloud: 0,

        // timers / loops
        physicsLoop: null,
        renderLoop: null,
        lightsTimer: null,
    };
}

// ─────────────────────────────────────────────
//  AUDIO HELPERS
// ─────────────────────────────────────────────
function rbAudio(id) {
    return document.getElementById('rb-sound-' + id);
}

function rbPlayOnce(id) {
    const el = rbAudio(id);
    if (!el) return;
    try {
        el.currentTime = 0;
        el.volume = 0.55;
        el.play().catch(() => {});
    } catch (e) {}
}

let rbEngineRunning = false;

function rbStartEngine() {
    const el = rbAudio('engine');
    if (!el) return;
    try {
        el.loop = true;
        el.volume = 0.18;
        el.playbackRate = 1.0;
        el.play().catch(() => {});
        rbEngineRunning = true;
    } catch (e) {}
}

function rbStopEngine() {
    const el = rbAudio('engine');
    if (!el) return;
    try {
        el.pause();
        el.currentTime = 0;
    } catch (e) {}
    rbEngineRunning = false;
    rbStopDrift();
}

function rbUpdateEngineSound(avgSpeed) {
    const el = rbAudio('engine');
    if (!el || !rbEngineRunning) return;
    // Speed 0–60 maps to rate 0.85–1.55, vol 0.10–0.28
    const t = Math.min(avgSpeed / 55, 1);
    el.playbackRate = 0.85 + t * 0.70;
    el.volume = 0.10 + t * 0.18;
}

let rbDriftRunning = false;

function rbStartDrift() {
    const el = rbAudio('drift');
    if (!el) return;
    try {
        el.loop = true;
        el.volume = 0.06;
        el.playbackRate = 1.0;
        el.play().catch(() => {});
        rbDriftRunning = true;
    } catch (e) {}
}

function rbStopDrift() {
    const el = rbAudio('drift');
    if (!el) return;
    try {
        el.pause();
        el.currentTime = 0;
    } catch (e) {}
    rbDriftRunning = false;
}

function rbUpdateDriftSound(avgSpeed) {
    const el = rbAudio('drift');
    if (!el || !rbEngineRunning) return;
    const threshold = 6;
    if (avgSpeed > threshold) {
        if (!rbDriftRunning) rbStartDrift();
        const t = Math.min((avgSpeed - threshold) / 50, 1);
        el.playbackRate = 0.95 + t * 0.25;
        el.volume = 0.06 + t * 0.14;
    } else if (rbDriftRunning) {
        rbStopDrift();
    }
}

// ─────────────────────────────────────────────
//  ENTRY POINT
// ─────────────────────────────────────────────
function startRacingBattle() {
    // Stop any landing music
    const ls = document.getElementById('sound-landing');
    if (ls) {
        try {
            ls.pause();
            ls.currentTime = 0;
        } catch (e) {}
    }

    RBS = rbFreshState();

    // Build independent question banks
    RBS.bank.p1 = shuffle(buildQuestionBank());
    RBS.bank.p2 = shuffle(buildQuestionBank());
    // Ensure p1 and p2 don't start on the exact same question
    if (RBS.bank.p2.length > 1) {
        const tmp = RBS.bank.p2.shift();
        RBS.bank.p2.push(tmp);
    }

    showPage('racing-battle');

    // Build scenery objects
    rbBuildScenery();

    // Reset all visuals
    rbResetVisuals();

    // Render first questions (locked until race starts)
    rbRenderQuestion('p1');
    rbRenderQuestion('p2');
    rbLockBoth(true);

    // Run the F1 lights sequence
    rbRunLightsSequence();
}

// ─────────────────────────────────────────────
//  SCENERY GENERATION
// ─────────────────────────────────────────────
let rbSceneryObjects = []; // { el, x, speed, type }
const RB_WORLD_W = 3000; // virtual world width for scenery placement

function rbBuildScenery() {
    const wrap = document.getElementById('rbSceneryWrap');
    if (!wrap) return;
    wrap.innerHTML = '';
    rbSceneryObjects = [];

    const world = document.getElementById('rbRaceWorld');
    const worldH = world ? world.offsetHeight : 160;
    const trackTop = worldH * 0.50; // top of road area

    // Place trees above the track (in the greenery band)
    const treeData = [
        { color: '#2e7d32', dark: '#1b5e20', w: 16, h: 26 },
        { color: '#388e3c', dark: '#2e7d32', w: 14, h: 22 },
        { color: '#43a047', dark: '#388e3c', w: 18, h: 30 },
        { color: '#1b5e20', dark: '#145214', w: 12, h: 20 },
    ];
    const bushData = [
        { color: '#558b2f', w: 22, h: 12 },
        { color: '#689f38', w: 18, h: 10 },
        { color: '#7cb342', w: 26, h: 14 },
    ];
    const signTexts = ['50m', '100m', 'ZOOM!', 'FAST!', '👋', '⭐'];

    let x = 60;
    while (x < RB_WORLD_W) {
        const roll = Math.random();

        if (roll < 0.38) {
            // Tree above track
            const td = treeData[Math.floor(Math.random() * treeData.length)];
            const trunkH = Math.round(6 + Math.random() * 6);
            const el = document.createElement('div');
            el.className = 'rb-tree';
            el.style.cssText = `left:${x}px; bottom:${Math.round((1-0.50)*worldH - 4)}px; z-index:3;`;
            el.innerHTML = `
                <div class="rb-tree-top" style="width:${td.w}px;height:${td.h}px;background:${td.color};box-shadow:inset -3px -3px 0 ${td.dark};"></div>
                <div class="rb-tree-top2" style="width:${Math.round(td.w*.7)}px;height:${Math.round(td.h*.7)}px;background:${td.dark};margin-top:-${Math.round(td.h*.4)}px;"></div>
                <div class="rb-tree-trunk" style="height:${trunkH}px;"></div>`;
            wrap.appendChild(el);
            rbSceneryObjects.push({ el, baseX: x, type: 'tree' });

        } else if (roll < 0.55) {
            // Bush below track (bottom grass strip)
            const bd = bushData[Math.floor(Math.random() * bushData.length)];
            const el = document.createElement('div');
            el.className = 'rb-bush';
            el.style.cssText = `left:${x}px; bottom:2px; width:${bd.w}px; height:${bd.h}px; background:${bd.color}; z-index:3;`;
            wrap.appendChild(el);
            rbSceneryObjects.push({ el, baseX: x, type: 'bush' });

        } else if (roll < 0.63) {
            // Coloured flag post
            const colors = ['#E74C3C', '#2980B9', '#F39C12', '#8E44AD', '#16A085'];
            const col = colors[Math.floor(Math.random() * colors.length)];
            const postH = Math.round(20 + Math.random() * 14);
            const el = document.createElement('div');
            el.style.cssText = `position:absolute; left:${x}px; bottom:${Math.round((1-0.50)*worldH - 2)}px; z-index:4;`;
            el.innerHTML = `
                <div class="rb-flag-post" style="height:${postH}px;"></div>
                <div class="rb-flag-banner" style="background:${col};top:${postH-14}px;left:4px;"></div>`;
            wrap.appendChild(el);
            rbSceneryObjects.push({ el, baseX: x, type: 'flag' });

        } else if (roll < 0.70) {
            // Road sign
            const txt = signTexts[Math.floor(Math.random() * signTexts.length)];
            const el = document.createElement('div');
            el.style.cssText = `position:absolute; left:${x}px; bottom:${Math.round((1-0.52)*worldH)}px; z-index:5;`;
            el.innerHTML = `
                <div class="rb-sign-post" style="height:18px;left:10px;position:relative;background:#888;width:3px;"></div>
                <div class="rb-sign" style="position:absolute;bottom:18px;left:0;">${txt}</div>`;
            wrap.appendChild(el);
            rbSceneryObjects.push({ el, baseX: x, type: 'sign' });
        }

        x += Math.round(55 + Math.random() * 120);
    }
}

// ─────────────────────────────────────────────
//  RESET VISUALS
// ─────────────────────────────────────────────
function rbResetVisuals() {
    // Cars
    ['rbCarRed', 'rbCarBlue'].forEach(id => {
        const c = document.getElementById(id);
        if (!c) return;
        c.style.animation = 'carIdle 1.4s ease-in-out infinite';
        c.classList.remove('rb-racing', 'rb-boosting');
    });
    // Turbos off
    ['rbTurboRed', 'rbTurboBlue'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    // Trails off
    ['rbTrailRed', 'rbTrailBlue'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('visible');
    });
    // Combo badges
    ['rbComboBadgeP1', 'rbComboBadgeP2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = '';
            el.classList.remove('visible');
        }
    });
    // Wheels stopped
    ['rbWheelP1FL', 'rbWheelP1RL', 'rbWheelP2FL', 'rbWheelP2RL'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('spinning', 'fast-spin');
    });
    // Speeds
    ['rbSpeedValP1', 'rbSpeedValP2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0';
    });
    // Card fills
    ['rbCardFillP1', 'rbCardFillP2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.width = '0%';
    });
    ['rbCardPctP1', 'rbCardPctP2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0%';
    });
    // MS dots
    ['rbMsDotP1', 'rbMsDotP2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.left = '0%';
    });
    // Scores
    ['rbScoreP1', 'rbScoreP2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0';
    });
    // Q counter
    const qn = document.getElementById('rbQNum');
    if (qn) qn.textContent = '1';
    // Lights overlay reset
    const lo = document.getElementById('rbLightsOverlay');
    if (lo) {
        lo.style.opacity = '1';
        lo.style.pointerEvents = 'all';
        lo.classList.remove('fade-out');
    }
    // All lights off
    [1, 2, 3, 4, 5].forEach(i => {
        const l = document.getElementById('rbL' + i);
        if (l) l.className = 'rb-light';
    });
    const lm = document.getElementById('rbLightsMsg');
    if (lm) lm.innerHTML = '';
    // Parallax offsets
    RBS.scrollRoad = 0;
    RBS.scrollScenery = 0;
    RBS.scrollCloud = 0;
    rbApplyScrolls(0, 0, 0);
    // Milestone popup
    const mp = document.getElementById('rbMilestonePopup');
    if (mp) {
        mp.className = 'rb-milestone-popup hidden';
        mp.textContent = '';
    }
}

// ─────────────────────────────────────────────
//  F1 RACE LIGHTS SEQUENCE
// ─────────────────────────────────────────────
function rbRunLightsSequence() {
    const lights = [document.getElementById('rbL1'), document.getElementById('rbL2'),
        document.getElementById('rbL3'), document.getElementById('rbL4'),
        document.getElementById('rbL5')
    ];
    const msgEl = document.getElementById('rbLightsMsg');
    const titleEl = document.querySelector('.rb-lights-title');

    let step = 0;
    // Sequence:
    // 0ms   → light 1 red
    // 600   → light 2 red
    // 1200  → light 3 red (all 3 pairs = 5 lights)
    // 1800  → light 4 red
    // 2400  → light 5 red
    // 3200  → ALL OFF → GO (green)
    // 4000  → hide overlay, unlock inputs

    const steps = [
        () => {
            rbLightOn(lights[0], 'red');
            rbLightOn(lights[1], 'red');
            rbPlayOnce('countdown');
            if (msgEl) msgEl.innerHTML = '🔴';
        },
        () => {
            rbLightOn(lights[2], 'red');
            rbLightOn(lights[3], 'red');
            rbPlayOnce('countdown');
            if (msgEl) msgEl.innerHTML = '🔴 🔴';
        },
        () => {
            rbLightOn(lights[4], 'red');
            rbPlayOnce('countdown');
            if (msgEl) msgEl.innerHTML = '🔴 🔴 🔴';
        },
        () => {
            // All off then GO
            lights.forEach(l => { if (l) l.className = 'rb-light'; });
            if (msgEl) msgEl.innerHTML = '<span class="rb-go-text">GO! 🏁</span>';
            if (titleEl) titleEl.style.display = 'none';
            rbPlayOnce('countdown');
            playAppSound('right');
        },
        () => {
            // Fade out overlay, start race
            const lo = document.getElementById('rbLightsOverlay');
            if (lo) {
                lo.classList.add('fade-out');
                setTimeout(() => {
                    lo.style.display = 'none';
                }, 500);
            }
            rbBeginRace();
        },
    ];

    const intervals = [0, 700, 1400, 2600, 3500];

    intervals.forEach((ms, i) => {
        RBS.lightsTimer = setTimeout(() => {
            if (!RBS) return;
            steps[i]();
        }, ms);
    });
}

function rbLightOn(el, color) {
    if (!el) return;
    el.className = 'rb-light ' + color;
}

// ─────────────────────────────────────────────
//  BEGIN RACE (called after lights go out)
// ─────────────────────────────────────────────
function rbBeginRace() {
    RBS.active = true;
    RBS.raceStarted = true;

    // Unlock both players
    rbLockBoth(false);

    // Start engine sound
    rbStartEngine();

    // Start physics + render loop
    clearInterval(RBS.physicsLoop);
    RBS.physicsLoop = setInterval(rbPhysicsTick, RB.TICK_MS);

    cancelAnimationFrame(RBS.renderLoop);
    rbRenderFrame();
}

// ─────────────────────────────────────────────
//  PHYSICS TICK — speed decay, scroll, overtake
// ─────────────────────────────────────────────
function rbPhysicsTick() {

    if (!RBS || !RBS.active) return;

    ['p1', 'p2'].forEach(p => {

        if (RBS.speedBurst[p] > 0) {
            RBS.speedBurst[p] =
                Math.max(
                    0,
                    RBS.speedBurst[p] - RB.SPEED_DECAY
                );
        }

        RBS.speed[p] =
            Math.min(
                RBS.speedBase[p] +
                RBS.speedBurst[p],
                80
            );

        if (RBS.speed[p] < 0.05) {
            RBS.speed[p] = 0;
        }

        // =====================================
        // REAL CAR MOVEMENT
        // =====================================

        const moveDistance =
            Math.max(
                RBS.speed[p],
                0
            ) * 1.8;

        RBS.carPos[p] += moveDistance;

        // progress hanya untuk UI
        RBS.progress[p] =
            Math.min(
                100,
                (RBS.carPos[p] / 5000) * 100
            );

    });

    // =====================================
    // CAMERA FOLLOW LEADER
    // =====================================

    const leaderPos =
        Math.max(
            RBS.carPos.p1,
            RBS.carPos.p2
        );

    RBS.cameraX =
        Math.max(
            0,
            leaderPos - 350
        );

    // =====================================
    // WINNER CHECK
    // =====================================

    if (RBS.carPos.p1 >= 5000) {
        rbWinner('p1');
        return;
    }

    if (RBS.carPos.p2 >= 5000) {
        rbWinner('p2');
        return;
    }
}

// ─────────────────────────────────────────────
//  RENDER FRAME (rAF loop)
// ─────────────────────────────────────────────
function rbRenderFrame() {
    if (!RBS || !RBS.active) return;

    // Apply scrolls to DOM elements
    rbApplyScrolls(RBS.scrollRoad, RBS.scrollScenery, RBS.scrollCloud);

    // Update HUD
    rbUpdateHUD();

    // Car animations
    rbAnimateCars();

    RBS.renderLoop = requestAnimationFrame(rbRenderFrame);
}

function rbApplyScrolls(road, scenery, cloud) {
    // Road markings
    const rm = document.getElementById('rbRoadMarkings');
    if (rm) rm.style.transform = `translateX(-${road % 110}px)`;

    const lc = document.getElementById('rbLaneCenter');
    if (lc) lc.style.transform = `translateX(-${road % 70}px)`;

    // Grass patterns
    const gt = document.getElementById('rbGrassTop');
    const gb = document.getElementById('rbGrassBot');
    if (gt) gt.style.transform = `translateX(-${scenery % 48}px)`;
    if (gb) gb.style.transform = `translateX(-${scenery % 48}px)`;

    rbSceneryObjects.forEach(obj => {
        const newX = obj.baseX - scenery;

        const world = document.getElementById('rbRaceWorld');
        const worldW = world ? world.offsetWidth : 5000;

        let x = newX % worldW;

        if (x < -200) {
            x += worldW;
        }

        obj.el.style.transform = `translateX(${x}px)`;
    });

    // Scenery wrap translateX (simpler single-value approach)
    const sw = document.getElementById('rbSceneryWrap');
    if (sw) sw.style.transform = `translateX(-${scenery % RB_WORLD_W}px)`;

    // Clouds
    // Handled by CSS animation (cloudDrift), but we can nudge speed via CSS var
}

// ─────────────────────────────────────────────
//  ANIMATE CARS
// ─────────────────────────────────────────────
function rbAnimateCars() {
    const leaderPos = Math.max(
        RBS.carPos.p1,
        RBS.carPos.p2
    );

    RBS.cameraX = Math.max(
        0,
        leaderPos - 350
    );

    ['p1', 'p2'].forEach(p => {

        const car =
            document.getElementById(
                p === 'p1' ?
                'rbCarRed' :
                'rbCarBlue'
            );

        if (!car) return;

        const screenX =
            RBS.carPos[p] -
            RBS.cameraX;

        car.style.transform =
            `translateX(${screenX}px)`;

    });

    ['p1', 'p2'].forEach(p => {
        const carId = p === 'p1' ? 'rbCarRed' : 'rbCarBlue';
        const wflId = p === 'p1' ? 'rbWheelP1FL' : 'rbWheelP2FL';
        const wrlId = p === 'p1' ? 'rbWheelP1RL' : 'rbWheelP2RL';
        const trailId = p === 'p1' ? 'rbTrailRed' : 'rbTrailBlue';
        const car = document.getElementById(carId);
        const wfl = document.getElementById(wflId);
        const wrl = document.getElementById(wrlId);
        const trail = document.getElementById(trailId);
        const speed = RBS.speed[p];

        if (!car) return;

        if (speed > 30) {
            car.classList.add('rb-boosting');
            car.classList.remove('rb-racing', 'carIdle');
        } else if (speed > 5) {
            car.classList.add('rb-racing');
            car.classList.remove('rb-boosting');
        } else {
            car.classList.remove('rb-racing', 'rb-boosting');
        }

        // Wheels
        if (wfl && wrl) {
            if (speed > 25) {
                wfl.className = 'rb-wheel rb-wheel-fl fast-spin';
                wrl.className = 'rb-wheel rb-wheel-rl fast-spin';
            } else if (speed > 2) {
                wfl.className = 'rb-wheel rb-wheel-fl spinning';
                wrl.className = 'rb-wheel rb-wheel-rl spinning';
            } else {
                wfl.className = 'rb-wheel rb-wheel-fl';
                wrl.className = 'rb-wheel rb-wheel-rl';
            }
        }

        // Speed trail
        if (trail) {
            trail.classList.toggle('visible', speed > 8);
        }

        // Forward motion impression: cars shift horizontally toward the finish line.
        if (car) {
            const progressRatio = Math.min(Math.max(RBS.progress[p] / RB.FINISH, 0), 1);
            const speedBonus = Math.min(Math.max((speed - 10) * 2.4, 0), 140);
            const baseOffset = Math.round(progressRatio * 360);
            const offsetX = Math.min(baseOffset + speedBonus, 520);
            const screenX =
                RBS.carPos[p] -
                RBS.cameraX;

            car.style.transform =
                `translateX(${screenX}px)`;
        }
    });
}

// ─────────────────────────────────────────────
//  HUD UPDATE
// ─────────────────────────────────────────────
function rbUpdateHUD() {
    ['p1', 'p2'].forEach(p => {
        const suffix = p === 'p1' ? 'P1' : 'P2';

        // Speed display
        const sv = document.getElementById('rbSpeedVal' + suffix);
        if (sv) sv.textContent = Math.round(RBS.speed[p] * 9);

        // Score
        const sc = document.getElementById('rbScore' + suffix);
        if (sc) sc.textContent = RBS.score[p];

        // Progress fills
        const pct = RBS.progress[p];
        const cf = document.getElementById('rbCardFill' + suffix);
        if (cf) cf.style.width = pct + '%';
        const cl = document.getElementById('rbCardPct' + suffix);
        if (cl) cl.textContent = Math.round(pct) + '%';

        // Milestone dots
        const dot = document.getElementById('rbMsDot' + suffix);
        if (dot) dot.style.left = Math.min(pct, 97) + '%';

        // Combo chips
        const combo = RBS.combo[p];
        const chipId = 'rbComboChip' + suffix;
        const comboEId = 'rbCombo' + suffix;
        const chip = document.getElementById(chipId);
        const comboEl = document.getElementById(comboEId);
        if (chip) chip.style.display = combo >= RB.COMBO3 ? 'inline-flex' : 'none';
        if (comboEl) comboEl.textContent = combo;

        // Q counter (max of both)
        const qn = document.getElementById('rbQNum');
        if (qn) qn.textContent = Math.max(RBS.qIdx.p1, RBS.qIdx.p2) + 1;
    });
}

// ─────────────────────────────────────────────
//  OVERTAKE DETECTION
// ─────────────────────────────────────────────
function rbCheckOvertake() {
    const leader = RBS.progress.p1 >= RBS.progress.p2 ? 'p1' : 'p2';
    if (RBS.prevLeader && RBS.prevLeader !== leader) {
        rbTriggerOvertake(leader);
    }
    RBS.prevLeader = leader;
}

function rbTriggerOvertake(newLeader) {
    rbPlayOnce('horn');
    const name = newLeader === 'p1' ? 'Player 1 🏎️' : 'Player 2 🚙';
    const toast = document.getElementById('rbOvertakeToast');
    if (!toast) return;
    toast.textContent = `BEEP! ${name} overtakes!`;
    toast.className = 'rb-overtake-toast';
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => { toast.className = 'rb-overtake-toast'; }, 3200);
}

// ─────────────────────────────────────────────
//  RENDER QUESTION FOR A PLAYER
// ─────────────────────────────────────────────
function rbRenderQuestion(player) {
    // Always pull a fresh question — never the same as the other player's current one
    const q = rbGetNextQuestion(player);
    if (!q) return;

    const suffix = player === 'p1' ? 'P1' : 'P2';

    const clockArea = document.getElementById('rbClockArea' + suffix);
    const qText = document.getElementById('rbQuestionText' + suffix);
    const answerArea = document.getElementById('rbAnswerArea' + suffix);

    if (!clockArea || !qText || !answerArea) return;

    clockArea.innerHTML = '';
    qText.innerHTML = '';
    answerArea.innerHTML = '';

    // Reset drag state
    RBS.dragAngle[player] = { hour: 0, minute: 0 };

    // Type badge
    const badge = document.createElement('div');
    badge.className = 'question-type-badge ' + getTypeBadgeClass(q.type);
    badge.textContent = getTypeLabel(q.type);
    clockArea.appendChild(badge);

    // Analog clock face (for types that need it)
    if (q.clockData && (q.type === 'mc' || q.type === 'arrange') && !q.isDigitalChoice) {
        const size = rbClockSize();
        clockArea.appendChild(buildAnalogClock(q.clockData, size));
    }

    // Question text
    qText.textContent = q.question;

    // Build answer component based on type
    if (q.type === 'mc' || q.type === 'digital') {
        rbBuildMC(q, answerArea, player);
    } else if (q.type === 'mc_clock') {
        rbBuildMCClock(q, answerArea, player);
    } else if (q.type === 'arrange') {
        rbBuildArrange(q, answerArea, player);
    } else if (q.type === 'drag') {
        rbBuildDrag(q, answerArea, player);
    } else {
        // Fallback: re-use MC
        rbBuildMC(q, answerArea, player);
    }

    // Unlock unless race hasn't started yet
    RBS.locked[player] = !RBS.raceStarted;

    // Animate card
    const card = document.getElementById('rbP' + (player === 'p1' ? '1' : '2') + 'Card');
    if (card) {
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = 'slideUp .3s cubic-bezier(.175,.885,.32,1.275)';
    }
}

function rbGetNextQuestion(player) {
    const bank = RBS.bank[player];
    if (!bank || bank.length === 0) {
        RBS.bank[player] = shuffle(buildQuestionBank());
        RBS.qIdx[player] = 0;
    }
    const idx = RBS.qIdx[player] % RBS.bank[player].length;
    const q = RBS.bank[player][idx];
    RBS.qIdx[player]++;
    return q;
}

function rbClockSize() {
    const vw = window.innerWidth;
    if (vw < 520) return 80;
    if (vw < 900) return 100;
    return 120;
}

// ─────────────────────────────────────────────
//  BUILD ANSWER COMPONENTS
// ─────────────────────────────────────────────
function rbBuildMC(q, container, player) {
    const grid = document.createElement('div');
    grid.className = 'rb-answer-area';
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'rb-option-btn';
        btn.textContent = opt;
        btn.dataset.value = opt;
        btn.addEventListener('click', () => rbSubmitAnswer(player, opt, q.answer, 'mc', grid));
        grid.appendChild(btn);
    });
    container.appendChild(grid);
}

function rbBuildMCClock(q, container, player) {
    const grid = document.createElement('div');
    grid.className = 'rb-answer-area';
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'rb-option-btn';
        btn.style.padding = '5px';
        const mini = buildAnalogClock(opt, rbClockSize() * 0.60);
        mini.style.margin = '0 auto 3px';
        btn.appendChild(mini);
        const lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:10px;font-weight:700;';
        lbl.textContent = opt.display || '';
        btn.appendChild(lbl);
        btn.addEventListener('click', () => rbSubmitAnswer(player, opt.display, q.answer, 'mc', grid));
        grid.appendChild(btn);
    });
    container.appendChild(grid);
}

function rbBuildArrange(q, container, player) {
    const wrap = document.createElement('div');
    wrap.style.width = '100%';

    const bankLbl = document.createElement('div');
    bankLbl.style.cssText = 'font-size:11px;font-weight:700;color:#636e72;margin-bottom:3px;';
    bankLbl.textContent = 'Words:';
    wrap.appendChild(bankLbl);

    const bank = document.createElement('div');
    bank.className = 'rb-word-bank';
    bank.id = 'rbWordBank_' + player;

    const ansLbl = document.createElement('div');
    ansLbl.style.cssText = 'font-size:11px;font-weight:700;color:#636e72;margin-bottom:3px;margin-top:5px;';
    ansLbl.textContent = 'Your answer:';
    wrap.appendChild(ansLbl);

    const ansArea = document.createElement('div');
    ansArea.className = 'rb-arrange-answer';
    ansArea.id = 'rbArrangeAns_' + player;

    const placed = [];

    q.words.forEach(word => {
        const chip = rbWordChip(word, bank, ansArea, false, placed, q.words.length, player, q.answer);
        bank.appendChild(chip);
    });

    wrap.appendChild(bank);
    wrap.appendChild(ansArea);
    container.appendChild(wrap);
}

function rbWordChip(word, bank, ansArea, inAnswer, placed, total, player, correct) {
    const chip = document.createElement('div');
    chip.className = 'rb-word-chip' + (inAnswer ? ' placed' : '');
    chip.textContent = word;
    chip.addEventListener('click', () => {
        if (RBS.locked[player]) return;
        chip.remove();
        if (!inAnswer) {
            placed.push(word);
            ansArea.appendChild(rbWordChip(word, bank, ansArea, true, placed, total, player, correct));
        } else {
            const i = placed.indexOf(word);
            if (i > -1) placed.splice(i, 1);
            bank.appendChild(rbWordChip(word, bank, ansArea, false, placed, total, player, correct));
        }
        // Auto-submit when all words placed
        if (placed.length === total) {
            const ans = Array.from(ansArea.querySelectorAll('.rb-word-chip')).map(c => c.textContent).join(' ');
            rbSubmitAnswer(player, ans, correct, 'arrange', null);
        }
    });
    return chip;
}

function rbBuildDrag(q, container, player) {
    const wrap = document.createElement('div');
    wrap.className = 'rb-drag-mini';

    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:10px;color:#636e72;font-weight:600;text-align:center;';
    hint.textContent = '🖱️ Click to set hands, then submit';
    wrap.appendChild(hint);

    const clock = document.createElement('div');
    clock.className = 'rb-drag-clock';
    clock.id = 'rbDragClock_' + player;

    const face = document.createElement('div');
    face.className = 'clock-face';

    // Tick marks
    for (let i = 0; i < 12; i++) {
        const tick = document.createElement('div');
        tick.className = 'clock-tick';
        tick.style.transform = `translateX(-50%) rotate(${i*30}deg)`;
        tick.style.top = '4px';
        face.appendChild(tick);
    }

    // Hour numbers
    [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((n, i) => {
        const a = (i * 30 - 90) * Math.PI / 180;
        const r = 0.36;
        const num = document.createElement('span');
        num.className = 'num-label';
        num.textContent = n;
        num.style.left = (50 + r * 100 * Math.cos(a)) + '%';
        num.style.top = (50 + r * 100 * Math.sin(a)) + '%';
        num.style.transform = 'translate(-50%,-50%)';
        face.appendChild(num);
    });

    RBS.dragAngle[player] = { hour: 0, minute: 0 };
    let dragMode = 'hour';

    const hHand = document.createElement('div');
    hHand.className = 'drag-h-hand';
    hHand.style.transform = 'translateX(-50%) rotate(0deg)';
    const mHand = document.createElement('div');
    mHand.className = 'drag-m-hand';
    mHand.style.transform = 'translateX(-50%) rotate(0deg)';
    const ctr = document.createElement('div');
    ctr.className = 'drag-center';

    face.appendChild(hHand);
    face.appendChild(mHand);
    face.appendChild(ctr);
    clock.appendChild(face);

    const display = document.createElement('div');
    display.className = 'rb-drag-time-show';
    display.id = 'rbDragDisplay_' + player;
    display.textContent = '12:00';

    const modeRow = document.createElement('div');
    modeRow.className = 'rb-drag-btn-row';
    const hBtn = document.createElement('button');
    hBtn.className = 'rb-drag-mode-btn selected';
    hBtn.textContent = '🕐 Hour';
    const mBtn = document.createElement('button');
    mBtn.className = 'rb-drag-mode-btn';
    mBtn.textContent = '⏱ Min';
    hBtn.onclick = () => {
        dragMode = 'hour';
        hBtn.classList.add('selected');
        mBtn.classList.remove('selected');
    };
    mBtn.onclick = () => {
        dragMode = 'minute';
        mBtn.classList.add('selected');
        hBtn.classList.remove('selected');
    };
    modeRow.appendChild(hBtn);
    modeRow.appendChild(mBtn);

    const submitBtn = document.createElement('button');
    submitBtn.className = 'rb-option-btn';
    submitBtn.style.cssText = 'grid-column:1/-1;margin-top:4px;';
    submitBtn.textContent = '✓ Submit Time';
    submitBtn.onclick = () => {
        if (RBS.locked[player]) return;
        const h = Math.round(RBS.dragAngle[player].hour / 30) % 12 || 12;
        const m = Math.round(RBS.dragAngle[player].minute / 6) % 60;
        rbSubmitAnswer(player, { h, m }, q.answer, 'drag', null);
    };

    clock.addEventListener('click', e => {
        if (RBS.locked[player]) return;
        const rect = clock.getBoundingClientRect();
        let angle = Math.atan2(e.clientY - rect.top - rect.height / 2,
            e.clientX - rect.left - rect.width / 2) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        if (dragMode === 'hour') {
            RBS.dragAngle[player].hour = angle;
            hHand.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        } else {
            RBS.dragAngle[player].minute = angle;
            mHand.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        }
        const h = Math.round(RBS.dragAngle[player].hour / 30) % 12 || 12;
        const m = Math.round(RBS.dragAngle[player].minute / 6) % 60;
        display.textContent = `${h}:${m.toString().padStart(2,'0')}`;
    });

    wrap.appendChild(clock);
    wrap.appendChild(modeRow);
    wrap.appendChild(display);
    wrap.appendChild(submitBtn);
    container.appendChild(wrap);
}

// ─────────────────────────────────────────────
//  SUBMIT ANSWER — correct OR wrong → new Q
// ─────────────────────────────────────────────
function rbSubmitAnswer(player, given, correct, type, optGrid) {
    if (!RBS || !RBS.active || RBS.locked[player]) return;

    // Lock immediately to prevent double-tap
    RBS.locked[player] = true;

    // Evaluate correctness
    let isCorrect = false;
    if (type === 'mc') {
        isCorrect = String(given).trim() === String(correct).trim();
    } else if (type === 'arrange') {
        isCorrect = String(given).trim().toLowerCase() === String(correct).trim().toLowerCase();
    } else if (type === 'drag') {
        isCorrect = Math.abs((given.h % 12) - ((correct.hour12 || 12) % 12)) <= 1 &&
            Math.abs(given.m - (correct.minute || 0)) <= 3;
    }

    // Visual feedback on options grid
    if (optGrid) {
        optGrid.querySelectorAll('.rb-option-btn').forEach(btn => {
            const v = btn.dataset.value || btn.textContent;
            if (String(v).trim() === String(correct).trim()) btn.classList.add('rb-correct');
            if (btn.classList.contains('rb-selected') && !isCorrect) btn.classList.add('rb-wrong');
            btn.disabled = true;
        });
    }

    // Card glow feedback
    const cardId = player === 'p1' ? 'rbP1Card' : 'rbP2Card';
    const card = document.getElementById(cardId);
    if (card) {
        card.classList.remove('rb-glow-correct', 'rb-glow-wrong');
        void card.offsetWidth;
        card.classList.add(isCorrect ? 'rb-glow-correct' : 'rb-glow-wrong');
        setTimeout(() => card.classList.remove('rb-glow-correct', 'rb-glow-wrong'), 500);
    }

    // Flash emoji
    rbShowFlash(player, isCorrect);

    if (isCorrect) {
        playAppSound('right');
        RBS.score[player] += CORRECT_SCORE;
        RBS.correct[player] += 1;
        RBS.combo[player] += 1;
        if (RBS.combo[player] > RBS.bestCombo[player]) RBS.bestCombo[player] = RBS.combo[player];

        // Progress & speed
        let prog = RB.PROGRESS_RIGHT;
        let speedValue = RB.SPEED_RIGHT;
        let baseGain = Math.round(RB.SPEED_RIGHT * 0.35);

        if (RBS.combo[player] >= RB.TURBO) {
            prog += RB.PROGRESS_TURBO;
            speedValue += RB.SPEED_TURBO;
            baseGain += Math.round(RB.SPEED_TURBO * 0.35);
            rbTriggerTurbo(player);
        } else if (RBS.combo[player] >= RB.COMBO3) {
            prog += RB.PROGRESS_COMBO3;
            speedValue += RB.SPEED_COMBO3;
            baseGain += Math.round(RB.SPEED_COMBO3 * 0.35);
            rbShowGlow(player);
        }

        RBS.speedBase[player] = Math.min(RBS.speedBase[player] + baseGain, 55);
        RBS.speedBurst[player] = Math.min(RBS.speedBurst[player] + speedValue, 75);
        RBS.speed[player] = Math.min(RBS.speedBase[player] + RBS.speedBurst[player], 70);
        RBS.progress[player] = Math.min(RBS.progress[player] + prog, RB.FINISH);

        rbShowComboBadge(player);
        rbUpdateHUD();
        rbCheckMilestone(player);

        // WIN CHECK
        if (RBS.progress[player] >= RB.FINISH) {
            setTimeout(() => rbEndRace(player), 300);
            return;
        }
    } else {
        playAppSound('wrong');
        RBS.combo[player] = 0;
        rbUpdateHUD();
    }

    // ★ ALWAYS load next question after brief delay (correct OR wrong)
    setTimeout(() => {
        if (!RBS || !RBS.active) return;
        RBS.locked[player] = false;
        rbRenderQuestion(player);
    }, isCorrect ? 500 : 650);
}

// ─────────────────────────────────────────────
//  VISUAL EFFECTS
// ─────────────────────────────────────────────
function rbShowFlash(player, isCorrect) {
    const id = player === 'p1' ? 'rbFlashP1' : 'rbFlashP2';
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = isCorrect ? '✅' : '❌';
    el.classList.remove('hidden');
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'feedbackFadeOut .9s ease forwards';
    setTimeout(() => el.classList.add('hidden'), 900);
}

function rbTriggerTurbo(player) {
    const turboId = player === 'p1' ? 'rbTurboRed' : 'rbTurboBlue';
    const carId = player === 'p1' ? 'rbCarRed' : 'rbCarBlue';
    const turbo = document.getElementById(turboId);
    const car = document.getElementById(carId);

    if (turbo) {
        turbo.classList.add('active');
        setTimeout(() => turbo.classList.remove('active'), 1400);
    }
    if (car) {
        car.classList.add('rb-boosting');
        setTimeout(() => car.classList.remove('rb-boosting'), 600);
    }

    rbPlayOnce('boost');

    // Screen flash
    const flash = document.createElement('div');
    flash.className = 'rb-turbo-flash ' + (player === 'p1' ? 'p1-flash' : 'p2-flash');
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    // Boost particles burst
    rbBurstParticles(player);
}

function rbShowGlow(player) {
    const carId = player === 'p1' ? 'rbCarRed' : 'rbCarBlue';
    const car = document.getElementById(carId);
    if (!car) return;
    car.style.filter = 'drop-shadow(2px 4px 5px rgba(0,0,0,.28)) drop-shadow(0 0 10px rgba(255,230,109,.8))';
    setTimeout(() => { car.style.filter = 'drop-shadow(2px 4px 5px rgba(0,0,0,.28))'; }, 700);
}

function rbBurstParticles(player) {
    const containerId = player === 'p1' ? 'rbBoostP1' : 'rbBoostP2';
    const container = document.getElementById(containerId);
    if (!container) return;
    const colors = ['#FFE66D', '#FF6B6B', '#4ECDC4', '#A29BFE', '#fd79a8'];
    for (let i = 0; i < 8; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position:absolute;
            width:${4+Math.random()*5}px;
            height:${4+Math.random()*5}px;
            border-radius:50%;
            background:${colors[Math.floor(Math.random()*colors.length)]};
            left:${Math.random()*30}px;
            top:${Math.random()*30}px;
            animation:particleBurst .6s ease-out forwards;
            animation-delay:${i*0.04}s;
        `;
        container.appendChild(dot);
        setTimeout(() => dot.remove(), 700);
    }
}

function rbShowComboBadge(player) {
    const combo = RBS.combo[player];
    if (combo < RB.COMBO3) return;
    const badgeId = player === 'p1' ? 'rbComboBadgeP1' : 'rbComboBadgeP2';
    const el = document.getElementById(badgeId);
    if (!el) return;
    el.textContent = combo >= RB.TURBO ? `🚀 TURBO x${combo}` : `🔥 x${combo}`;
    el.classList.remove('visible');
    void el.offsetWidth;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 2200);
}

// ─────────────────────────────────────────────
//  MILESTONE CHECKPOINTS
// ─────────────────────────────────────────────
const RB_MS_LABELS = { 25: '🏁 Checkpoint!', 50: '⚡ Halfway!', 75: '🔥 Final Stretch!' };

function rbCheckMilestone(player) {
    RB.MILESTONES.forEach(ms => {
        if (!RBS.msTriggered[player][ms] && RBS.progress[player] >= ms) {
            RBS.msTriggered[player][ms] = true;
            rbShowMilestone(RB_MS_LABELS[ms]);
        }
    });
}

function rbShowMilestone(text) {
    const el = document.getElementById('rbMilestonePopup');
    if (!el) return;
    el.textContent = text;
    el.className = 'rb-milestone-popup';
    void el.offsetWidth;
    el.classList.add('show');
    playAppSound('right');
    setTimeout(() => { el.className = 'rb-milestone-popup hidden'; }, 2800);
}

// ─────────────────────────────────────────────
//  END RACE
// ─────────────────────────────────────────────
function rbEndRace(winnerPlayer) {
    if (!RBS || !RBS.active) return;
    RBS.active = false;
    RBS.winner = winnerPlayer;

    clearInterval(RBS.physicsLoop);
    cancelAnimationFrame(RBS.renderLoop);
    rbStopEngine();
    rbLockBoth(true);

    // Winner car final burst
    rbTriggerTurbo(winnerPlayer);

    // Play winner sound
    playAppSound('winner');
    launchConfetti();

    setTimeout(() => rbShowResult(winnerPlayer), 1800);
}

// ─────────────────────────────────────────────
//  RESULT SCREEN
// ─────────────────────────────────────────────
function rbShowResult(winnerPlayer) {
    showPage('racing-result');

    const isP1 = winnerPlayer === 'p1';
    const name = isP1 ? 'Player 1' : 'Player 2';
    const emoji = isP1 ? '🏎️' : '🚙';

    const titleEl = document.getElementById('rbWinnerTitle');
    if (titleEl) titleEl.textContent = `${emoji} ${name} Wins! 🏆`;

    const trophyEl = document.getElementById('rbResultTrophy');
    if (trophyEl) trophyEl.textContent = '🏆';

    // Winner car SVG
    const carDisplay = document.getElementById('rbWinnerCarDisplay');
    if (carDisplay) {
        const carSvg = document.createElement('div');
        carSvg.className = 'rb-win-car';
        carSvg.style.cssText = 'width:clamp(110px,15vw,190px);margin:0 auto;filter:drop-shadow(0 8px 16px rgba(0,0,0,.2));';
        carSvg.innerHTML = isP1 ?
            `<svg viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="60" cy="62" rx="44" ry="4" fill="rgba(0,0,0,.18)"/>
                <circle cx="28" cy="52" r="12" fill="#1a1a1a"/><circle cx="28" cy="52" r="8" fill="#333"/><circle cx="28" cy="52" r="3" fill="#888"/>
                <circle cx="92" cy="52" r="12" fill="#1a1a1a"/><circle cx="92" cy="52" r="8" fill="#333"/><circle cx="92" cy="52" r="3" fill="#888"/>
                <rect x="8" y="28" width="104" height="24" rx="10" fill="#E74C3C"/>
                <rect x="4" y="32" width="112" height="16" rx="7" fill="#C0392B"/>
                <rect x="22" y="10" width="72" height="22" rx="8" fill="#E74C3C"/>
                <rect x="26" y="12" width="28" height="17" rx="4" fill="#AED6F1" opacity=".92"/>
                <rect x="62" y="12" width="28" height="17" rx="4" fill="#AED6F1" opacity=".9"/>
                <rect x="5" y="26" width="14" height="5" rx="2" fill="#C0392B"/>
                <ellipse cx="113" cy="38" rx="5" ry="4" fill="#FFE66D" opacity=".9"/>
                <rect x="47" y="36" width="26" height="10" rx="5" fill="#E74C3C" stroke="white" stroke-width="1.5"/>
                <text x="60" y="43.5" text-anchor="middle" fill="white" font-size="7" font-weight="900" font-family="Fredoka One,cursive">P1</text>
              </svg>` :
            `<svg viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="60" cy="62" rx="44" ry="4" fill="rgba(0,0,0,.18)"/>
                <circle cx="28" cy="52" r="12" fill="#1a1a1a"/><circle cx="28" cy="52" r="8" fill="#333"/><circle cx="28" cy="52" r="3" fill="#888"/>
                <circle cx="92" cy="52" r="12" fill="#1a1a1a"/><circle cx="92" cy="52" r="8" fill="#333"/><circle cx="92" cy="52" r="3" fill="#888"/>
                <rect x="8" y="28" width="104" height="24" rx="10" fill="#2980B9"/>
                <rect x="4" y="32" width="112" height="16" rx="7" fill="#1A5276"/>
                <rect x="22" y="10" width="72" height="22" rx="8" fill="#2980B9"/>
                <rect x="26" y="12" width="28" height="17" rx="4" fill="#AED6F1" opacity=".92"/>
                <rect x="62" y="12" width="28" height="17" rx="4" fill="#AED6F1" opacity=".9"/>
                <rect x="5" y="26" width="14" height="5" rx="2" fill="#1A5276"/>
                <ellipse cx="113" cy="38" rx="5" ry="4" fill="#AED6F1" opacity=".9"/>
                <rect x="47" y="36" width="26" height="10" rx="5" fill="#2980B9" stroke="white" stroke-width="1.5"/>
                <text x="60" y="43.5" text-anchor="middle" fill="white" font-size="7" font-weight="900" font-family="Fredoka One,cursive">P2</text>
              </svg>`;
        carDisplay.innerHTML = '';
        carDisplay.appendChild(carSvg);
    }

    // Stats
    const ids = {
        score: ['rbResFinalScoreP1', 'rbResFinalScoreP2'],
        correct: ['rbResCorrectP1', 'rbResCorrectP2'],
        combo: ['rbResBestComboP1', 'rbResBestComboP2'],
    };
    document.getElementById(ids.score[0]).textContent = RBS.score.p1;
    document.getElementById(ids.score[1]).textContent = RBS.score.p2;
    document.getElementById(ids.correct[0]).textContent = RBS.correct.p1;
    document.getElementById(ids.correct[1]).textContent = RBS.correct.p2;
    document.getElementById(ids.combo[0]).textContent = RBS.bestCombo.p1;
    document.getElementById(ids.combo[1]).textContent = RBS.bestCombo.p2;

    // Highlight winner stats card
    const p1s = document.querySelector('.rb-res-p1');
    const p2s = document.querySelector('.rb-res-p2');
    if (p1s) p1s.style.transform = isP1 ? 'scale(1.04)' : 'scale(1)';
    if (p2s) p2s.style.transform = isP1 ? 'scale(1)' : 'scale(1.04)';
    if (p1s) p1s.style.boxShadow = isP1 ? '0 0 0 3px #E74C3C, 0 8px 24px rgba(231,76,60,.3)' : '';
    if (p2s) p2s.style.boxShadow = isP1 ? '' : '0 0 0 3px #2980B9, 0 8px 24px rgba(41,128,185,.3)';

    launchConfetti();
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function rbLockBoth(locked) {
    RBS.locked.p1 = locked;
    RBS.locked.p2 = locked;

    ['P1', 'P2'].forEach(s => {
        const area = document.getElementById('rbAnswerArea' + s);
        if (area) area.querySelectorAll('button').forEach(b => b.disabled = locked);
    });
}

function confirmRacingExit() {
    if (confirm('Exit Racing Battle? Race progress will be lost.')) {
        if (RBS) {
            RBS.active = false;
            clearInterval(RBS.physicsLoop);
            cancelAnimationFrame(RBS.renderLoop);
            clearTimeout(RBS.lightsTimer);
        }
        rbStopEngine();
        showPage('quiz-menu');
        playAppSound('landing');
    }
}

function rbUpdateCamera() {

    const leader =
        Math.max(
            RBS.carPos.p1,
            RBS.carPos.p2
        );

    RBS.cameraX =
        Math.max(
            0,
            leader - 450
        );

}

// Inject particle burst keyframe if not already present
(function rbInjectKeyframes() {
    if (document.getElementById('rb-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'rb-keyframes';
    style.textContent = `
        @keyframes particleBurst {
            from { transform: translate(0,0) scale(1); opacity:1; }
            to   { transform: translate(${Math.random()>0.5?'':'-'}${20+Math.random()*30}px, -${15+Math.random()*25}px) scale(0); opacity:0; }
        }
        @keyframes winCarFloat {
            from { transform:translateX(-60px) rotate(-4deg); opacity:0; }
            60%  { transform:translateX(6px) rotate(2deg); opacity:1; }
            to   { transform:translateX(0) rotate(0deg); opacity:1; }
        }
        .rb-win-car { animation: winCarFloat .8s cubic-bezier(.175,.885,.32,1.275) both; }
    `;
    document.head.appendChild(style);
})();
/* ================================================================
   TICKTOCK TIME — CANVAS RACING ENGINE (Override)
   Replaces DOM-based race world with a true scrolling canvas world.
   All question logic, sounds, HUD, and result screens are UNCHANGED.
   Only the race world visual is overridden here.
================================================================ */

(function() {
'use strict';

// ── WORLD CONSTANTS ──
const RBW = {
  WORLD_LEN  : 6000,
  BASE_SPD   : 0.3,
  MAX_SPD    : 20,
  SPD_DECAY  : 0.983,
};

// ── CANVAS STATE ──
let _canvas = null, _ctx = null;
let _camX = 0, _rafId = null, _lastTs = 0;
let _worldTrees = [], _worldSigns = [], _worldClouds = [], _worldStars = [];
let _dustParticles = [];
let _prevLeaderCanvas = null;
let _p1visX = 0, _p2visX = 0; // visual world positions (for canvas)
let _canvasActive = false;

// ── SPEED TRACKING (canvas speed separate from RBS progress speed) ──
let _cvSpd = { p1: RBW.BASE_SPD, p2: RBW.BASE_SPD };
let _cvPos = { p1: 0, p2: 0 };
let _cvBoostTimer = { p1: 0, p2: 0 };
let _cvNitroTimer = { p1: 0, p2: 0 };
let _cvWheelAng  = { p1: 0, p2: 0 };
let _cvBounce    = { p1: 0, p2: Math.PI };

// ── BUILD WORLD DECORATIONS ──
function _buildCanvasWorld() {
  const W = RBW.WORLD_LEN + 1200;
  _worldStars = Array.from({length:65}, () => ({
    wx: Math.random()*W, wy: Math.random()*0.42,
    r: Math.random()*1.3+0.3, blink: Math.random()*Math.PI*2
  }));
  _worldTrees = [];
  for (let x = 280; x < W; x += 85+Math.random()*145) {
    _worldTrees.push({x, side: Math.random()>.5?'t':'b',
      h: 34+Math.random()*42, w: 18+Math.random()*14,
      c: Math.random()>.5?'#2e7d32':'#388e3c', tc: '#5c3a1a'});
  }
  _worldSigns = [];
  for (let x = 650; x < W; x += 820+Math.random()*680) {
    _worldSigns.push({x,
      lbl: ['CHECKPOINT','FASTER!','⏰ QUIZ!','GO GO GO!','TICK TOCK!'][Math.floor(Math.random()*5)]});
  }
  _worldClouds = Array.from({length:24}, (_, i) => ({
    wx: i*(W/22)+Math.random()*200, wy: 0.05+Math.random()*0.25,
    w: 65+Math.random()*85
  }));
  _dustParticles = [];
}

// ── RESIZE CANVAS ──
function _resizeRaceCanvas() {
  const world = document.getElementById('rbRaceWorld');
  if (!_canvas || !world) return;
  _canvas.width  = world.clientWidth  || window.innerWidth;
  _canvas.height = world.clientHeight || 200;
}

// ── SPAWN DUST ──
function _spawnDust(player) {
  if (!_canvas) return;
  const H = _canvas.height;
  const roadTop = H*0.58, roadBot = H*0.82;
  const laneY = player==='p1' ? roadTop+(roadBot-roadTop)*0.28 : roadTop+(roadBot-roadTop)*0.72;
  const col = player==='p1' ? 'rgba(231,76,60,0.65)' : 'rgba(41,128,185,0.65)';
  for (let i=0;i<7;i++) {
    _dustParticles.push({
      x: _cvPos[player]-_camX-32+(Math.random()-.5)*8,
      y: laneY+(Math.random()-.5)*10,
      vx: -(1.2+Math.random()*3.2), vy: (Math.random()-.5)*2.2,
      life: 1, decay: 0.038+Math.random()*0.042,
      r: 2.5+Math.random()*4.5, color: col
    });
  }
}

// ── LERP ──
function _lerp(a,b,t){return a+(b-a)*t;}

// ── RRECT ──
function _rrect(ctx,x,y,w,h,r){
  r=Math.min(r,Math.abs(w)/2,Math.abs(h)/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

// ── CANVAS RAF LOOP ──
function _canvasLoop(ts) {
  if (!_canvasActive) return;
  const dt = Math.min((ts - _lastTs)/16.667, 3);
  _lastTs = ts;
  _updateCanvas(dt);
  _drawCanvas();
  _rafId = requestAnimationFrame(_canvasLoop);
}

function _updateCanvas(dt) {
  ['p1','p2'].forEach(p => {
    _cvBounce[p]   += 0.11*dt;
    _cvWheelAng[p] += _cvSpd[p]*0.2*dt;
    if (_cvBoostTimer[p]>0) _cvBoostTimer[p]-=dt;
    if (_cvNitroTimer[p]>0) _cvNitroTimer[p]-=dt;

    // Mirror RBS progress to canvas world position
    if (RBS) {
      const prog = RBS.progress[p] / 100;
      const target = prog * RBW.WORLD_LEN;
      // Smoothly catch up canvas pos to RBS progress
      _cvPos[p] = _lerp(_cvPos[p], target, Math.min(0.12*dt*3, 1));
      // Canvas speed tracks RBS speed
      _cvSpd[p] = _lerp(_cvSpd[p], Math.max(RBW.BASE_SPD, RBS.speed[p]*0.28), 0.1*dt*3);
    }
  });

  // Camera
  const leadX = Math.max(_cvPos.p1, _cvPos.p2);
  const tCam  = leadX - (_canvas ? _canvas.width*0.52 : 300);
  _camX = _lerp(_camX, tCam, 0.055*dt*3);
  _camX = Math.max(0, Math.min(_camX, RBW.WORLD_LEN - (_canvas?_canvas.width*0.38:200)));

  // Dust
  for (let i=_dustParticles.length-1;i>=0;i--) {
    const d=_dustParticles[i];
    d.x+=d.vx*dt; d.y+=d.vy*dt; d.life-=d.decay*dt;
    if(d.life<=0) _dustParticles.splice(i,1);
  }
}

function _drawCanvas() {
  if (!_canvas || !_ctx) return;
  const W = _canvas.width, H = _canvas.height;
  const ctx = _ctx;
  ctx.clearRect(0,0,W,H);
  _dSky(W,H); _dClouds(W,H); _dMountains(W,H);
  _dGrass(W,H); _dRoad(W,H);
  _dTrees(W,H); _dSigns(W,H);
  _dDust(W,H);
  _dFinish(W,H);
  _dCar('p2',W,H); _dCar('p1',W,H);
  _dGap(W,H); _dSpeedLines(W,H);
}

function _dSky(W,H){
  const ctx=_ctx, hy=H*0.57;
  const g=ctx.createLinearGradient(0,0,0,hy);
  g.addColorStop(0,'#4fc3f7'); g.addColorStop(.5,'#81d4fa'); g.addColorStop(1,'#b3e5fc');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,hy);
  // Sun
  ctx.save(); ctx.shadowBlur=24; ctx.shadowColor='rgba(255,230,109,.7)';
  const sunR=Math.max(16, W*0.025);
  const sg=ctx.createRadialGradient(W*.82,H*.08,0,W*.82,H*.08,sunR*2);
  sg.addColorStop(0,'#FFE66D'); sg.addColorStop(1,'rgba(255,230,109,0)');
  ctx.fillStyle=sg;
  ctx.beginPath(); ctx.arc(W*.82,H*.08,sunR*2,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function _dClouds(W,H){
  const ctx=_ctx;
  _worldClouds.forEach(c=>{
    const sx=((c.wx-_camX*.13)%(W+200)+W+200)%(W+200);
    if(sx>W+180) return;
    ctx.globalAlpha=.78; ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.ellipse(sx,c.wy*H,c.w*.52,c.w*.19,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx-c.w*.22,c.wy*H+4,c.w*.3,c.w*.13,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx+c.w*.24,c.wy*H+3,c.w*.26,c.w*.12,0,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  });
}

function _dMountains(W,H){
  const ctx=_ctx, hy=H*.57;
  ctx.fillStyle='#a8d5ea'; _mtnRow(W,hy,_camX*.08,12,.22);
  ctx.fillStyle='#78c5e0'; _mtnRow(W,hy,_camX*.14,9,.31);
}
function _mtnRow(W,hy,off,n,hf){
  const ctx=_ctx, sp=W/(n-1);
  ctx.beginPath(); ctx.moveTo(0,hy);
  for(let i=0;i<n+2;i++){
    const bx=(i*sp-(off%sp)+sp)%(W+sp*2)-sp;
    const mh=hy*hf*(.55+.45*Math.sin(i*2.7+off*.008));
    ctx.lineTo(bx-sp*.5,hy); ctx.lineTo(bx,hy-mh); ctx.lineTo(bx+sp*.5,hy);
  }
  ctx.lineTo(W+50,hy); ctx.lineTo(0,hy); ctx.closePath(); ctx.fill();
}

function _dGrass(W,H){
  const ctx=_ctx, roadTop=H*.58, roadBot=H*.82, sky=H*.57;
  const g1=ctx.createLinearGradient(0,sky,0,roadTop);
  g1.addColorStop(0,'#66bb6a'); g1.addColorStop(1,'#43a047');
  ctx.fillStyle=g1; ctx.fillRect(0,sky,W,roadTop-sky);
  const g2=ctx.createLinearGradient(0,roadBot,0,H);
  g2.addColorStop(0,'#43a047'); g2.addColorStop(1,'#2e7d32');
  ctx.fillStyle=g2; ctx.fillRect(0,roadBot,W,H-roadBot);
  const goff=(_camX*.9)%80;
  ctx.fillStyle='#5fa84a';
  for(let x=-goff;x<W+80;x+=80){
    ctx.fillRect(x,sky,40,roadTop-sky);
    ctx.fillRect(x,roadBot,40,H-roadBot);
  }
}

function _dRoad(W,H){
  const ctx=_ctx, roadTop=H*.58, roadBot=H*.82, rh=roadBot-roadTop;
  const rg=ctx.createLinearGradient(0,roadTop,0,roadBot);
  rg.addColorStop(0,'#546e7a'); rg.addColorStop(.5,'#455a64'); rg.addColorStop(1,'#37474f');
  ctx.fillStyle=rg; ctx.fillRect(0,roadTop,W,rh);
  // Kerb
  const koff=(_camX*.9)%28;
  for(let x=-koff;x<W+28;x+=28){
    ctx.fillStyle='#e53935'; ctx.fillRect(x,roadTop,14,5);
    ctx.fillStyle='#fff'; ctx.fillRect(x+14,roadTop,14,5);
    ctx.fillStyle='#e53935'; ctx.fillRect(x,roadBot-5,14,5);
    ctx.fillStyle='#fff'; ctx.fillRect(x+14,roadBot-5,14,5);
  }
  // Edges
  ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(0,roadTop+2); ctx.lineTo(W,roadTop+2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,roadBot-2); ctx.lineTo(W,roadBot-2); ctx.stroke();
  // Yellow dashes
  const dlen=46,dgap=34,du=dlen+dgap;
  const doff=(_camX*.9)%du;
  const cy=(roadTop+roadBot)/2;
  ctx.strokeStyle='#FFE66D'; ctx.lineWidth=3;
  ctx.setLineDash([dlen,dgap]); ctx.lineDashOffset=-doff;
  ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
  ctx.setLineDash([]);
}

function _dTrees(W,H){
  const ctx=_ctx, roadTop=H*.58, roadBot=H*.82;
  _worldTrees.forEach(tr=>{
    const sx=tr.x-_camX;
    if(sx<-80||sx>W+80) return;
    const y=tr.side==='t'?roadTop-tr.h*.1:roadBot+tr.h*.1;
    const flip=tr.side==='b';
    const ty=flip?y:y-tr.h;
    ctx.fillStyle=tr.tc; ctx.fillRect(sx-tr.w*.07,ty+tr.h*.62,tr.w*.14,tr.h*.38);
    ctx.fillStyle=tr.c;
    ctx.beginPath(); ctx.ellipse(sx,ty+tr.h*.42,tr.w*.52,tr.h*.42,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(165,214,167,.3)';
    ctx.beginPath(); ctx.ellipse(sx+tr.w*.1,ty+tr.h*.32,tr.w*.28,tr.h*.2,.3,0,Math.PI*2); ctx.fill();
  });
}

function _dSigns(W,H){
  const ctx=_ctx, roadTop=H*.58;
  _worldSigns.forEach(s=>{
    const sx=s.x-_camX;
    if(sx<-130||sx>W+130) return;
    ctx.fillStyle='#888'; ctx.fillRect(sx-2,roadTop-52,4,52);
    ctx.save();
    ctx.font='bold 11px Baloo 2,sans-serif';
    const tw=ctx.measureText(s.lbl).width+18;
    ctx.fillStyle='#FFE66D';
    _rrect(ctx,sx-tw/2,roadTop-72,tw,22,4); ctx.fill();
    ctx.strokeStyle='#FF9F43'; ctx.lineWidth=1.5;
    _rrect(ctx,sx-tw/2,roadTop-72,tw,22,4); ctx.stroke();
    ctx.fillStyle='#2D3436'; ctx.textAlign='center';
    ctx.fillText(s.lbl,sx,roadTop-55);
    ctx.restore();
  });
}

function _dDust(W,H){
  const ctx=_ctx;
  _dustParticles.forEach(d=>{
    ctx.globalAlpha=d.life*.5;
    ctx.fillStyle=d.color;
    ctx.beginPath(); ctx.arc(d.x,d.y,Math.max(.5,d.r*d.life),0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha=1;
}

function _dFinish(W,H){
  const ctx=_ctx;
  const fx=RBW.WORLD_LEN-_camX;
  if(fx<-300||fx>W+300) return;
  const roadTop=H*.58, roadBot=H*.82, rh=roadBot-roadTop;
  const archW=80, t=performance.now()*.003;
  const pulse=.5+.5*Math.sin(t*3);

  ctx.save();
  ctx.shadowBlur=28+pulse*16; ctx.shadowColor=`rgba(255,230,109,${.5+pulse*.3})`;
  ctx.fillStyle='#FF9F43';
  ctx.fillRect(fx-archW/2-10,roadTop-100,14,rh+100);
  ctx.fillRect(fx+archW/2-4, roadTop-100,14,rh+100);
  ctx.fillStyle='#FFE66D';
  ctx.fillRect(fx-archW/2-10,roadTop-100,archW+24,16);
  ctx.restore();

  // Checkered banner
  const bw=archW+16,bh=30,bs=8;
  for(let bx=0;bx<bw;bx+=bs) for(let by=0;by<bh;by+=bs){
    ctx.fillStyle=((Math.floor(bx/bs)+Math.floor(by/bs))%2===0)?'#fff':'#2D3436';
    ctx.fillRect(fx-archW/2-8+bx,roadTop-84+by,bs,bs);
  }
  // Checkered road
  const cs=20;
  for(let rx=Math.floor(fx/cs)*cs-cs;rx<fx+cs*2;rx+=cs)
    for(let ry=0;ry<rh;ry+=cs){
      ctx.fillStyle=((Math.floor(rx/cs)+Math.floor(ry/cs))%2===0)?'rgba(255,255,255,.72)':'rgba(0,0,0,.42)';
      ctx.fillRect(rx,roadTop+ry,cs,cs);
    }
  // Flags
  _drawFlag(fx-archW/2-10,roadTop-100);
  _drawFlag(fx+archW/2+4,roadTop-100);
  // Text
  ctx.save();
  ctx.font='bold 22px Fredoka One,cursive'; ctx.textAlign='center';
  ctx.fillStyle='#E74C3C'; ctx.shadowBlur=14+pulse*10; ctx.shadowColor='#FF9F43';
  ctx.fillText('FINISH',fx+2,roadTop-107); ctx.restore();
  // Distance
  if (RBS) {
    const dist=RBW.WORLD_LEN-Math.max(_cvPos.p1,_cvPos.p2);
    if(dist>80&&dist<1400){
      ctx.save();
      ctx.font='bold 10px Fredoka One,cursive'; ctx.textAlign='center';
      ctx.fillStyle=`rgba(255,159,67,${.5+pulse*.4})`;
      ctx.fillText(Math.ceil(dist/10)+'m to go',fx+2,roadBot+14);
      ctx.restore();
    }
  }
}
function _drawFlag(x,y){
  const ctx=_ctx;
  ctx.fillStyle='#aaa'; ctx.fillRect(x,y,3,32);
  for(let fx=0;fx<16;fx+=8) for(let fy=0;fy<16;fy+=8){
    ctx.fillStyle=((Math.floor(fx/8)+Math.floor(fy/8))%2===0)?'#fff':'#2D3436';
    ctx.fillRect(x+3+fx,y+fy,8,8);
  }
}

function _dCar(player,W,H){
  const ctx=_ctx;
  const roadTop=H*.58, roadBot=H*.82;
  const laneY = player==='p1'?roadTop+(roadBot-roadTop)*.28:roadTop+(roadBot-roadTop)*.72;
  const sx  = _cvPos[player]-_camX;
  const bounce = Math.sin(_cvBounce[player])*(_cvSpd[player]>3?2.0:.6);
  const vib    = _cvSpd[player]>11?(Math.random()-.5)*1.2:0;
  const cy  = laneY+bounce+vib;
  const cw=66, ch=28;

  ctx.save(); ctx.translate(sx,cy);

  // Trail
  if (_cvBoostTimer[player]>0) {
    const a=_cvBoostTimer[player]/60;
    const tc=player==='p1'?'#E74C3C':'#2980B9';
    for(let i=1;i<=5;i++){
      ctx.globalAlpha=a*(.24-i*.04);
      ctx.fillStyle=tc;
      const tw=cw*(1-i*.1),th=ch*(1-i*.09);
      ctx.save(); ctx.translate(-cw*.5-i*14,0);
      _rrect(ctx,-tw/2+cw/2,-th/2,tw,th,4); ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha=1;
  }

  // Nitro flames
  if (_cvNitroTimer[player]>0) {
    const fa=Math.min(1,_cvNitroTimer[player]/20);
    ctx.globalAlpha=fa;
    const c1=player==='p1'?'rgba(231,76,60,':'rgba(41,128,185,';
    for(let f=0;f<3;f++){
      const fw=13+Math.random()*11+f*4, fh=6+Math.random()*5;
      const fg=ctx.createRadialGradient(-cw/2-f*3,0,0,-cw/2-f*3-fw,0,fw);
      fg.addColorStop(0,c1+fa+')');
      fg.addColorStop(.4,'rgba(255,230,109,'+(fa*.9)+')');
      fg.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=fg;
      ctx.beginPath(); ctx.ellipse(-cw/2-f*3-fw/2,(Math.random()-.5)*4,fw/2,fh/2,0,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  // Shadow
  ctx.globalAlpha=.25; ctx.fillStyle='#000';
  ctx.beginPath(); ctx.ellipse(0,ch/2+4,cw*.43,5,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;

  // Glow
  if(_cvSpd[player]>4){const ga=Math.min(.8,(_cvSpd[player]-4)/(RBW.MAX_SPD-4)*.8);
    ctx.shadowBlur=15*ga; ctx.shadowColor=player==='p1'?'rgba(231,76,60,.8)':'rgba(41,128,185,.8)';}

  // Body — exact TickTockTime brand colors
  const bc=player==='p1'?'#E74C3C':'#2980B9';
  const ac=player==='p1'?'#FF6B6B':'#5DADE2';
  const bg=ctx.createLinearGradient(0,-ch/2,0,ch/2);
  bg.addColorStop(0,ac); bg.addColorStop(.38,bc); bg.addColorStop(1,'#111');
  ctx.fillStyle=bg; _rrect(ctx,-cw/2,-ch/2,cw,ch,7); ctx.fill();

  // Spoiler
  ctx.shadowBlur=0;
  ctx.fillStyle=player==='p1'?'#C0392B':'#1A5276';
  _rrect(ctx,-cw/2-5,-ch/2,8,ch,3); ctx.fill();
  ctx.fillStyle=player==='p1'?'#FF6B6B':'#4ECDC4';
  ctx.fillRect(-cw/2-6,-ch/2,10,4); ctx.fillRect(-cw/2-6,ch/2-4,10,4);

  // Windshield
  ctx.fillStyle='rgba(174,214,241,.88)';
  _rrect(ctx,-cw*.06,-ch/2-10,cw*.4,15,4); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.3)'; ctx.fillRect(-cw*.04,-ch/2-8,7,10);

  // Stripe
  ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(-cw*.5+11,-2,cw-22,4);

  // Number plate
  ctx.fillStyle='rgba(0,0,0,.5)'; _rrect(ctx,cw*.12,-8,20,16,4); ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='bold 8px Fredoka One,cursive'; ctx.textAlign='center';
  ctx.fillText(player==='p1'?'P1':'P2',cw*.22,5);

  // Headlights
  ctx.fillStyle='#FFE66D'; ctx.shadowBlur=12; ctx.shadowColor='#FFE66D';
  ctx.fillRect(cw/2-6,-ch/2+2,5,7); ctx.fillRect(cw/2-6,ch/2-9,5,7);

  // Tail lights
  ctx.shadowBlur=8; ctx.shadowColor='#e53935';
  ctx.fillStyle=_cvBoostTimer[player]>0?'#FF9F43':'#e53935';
  ctx.fillRect(-cw/2+2,-ch/2+2,5,6); ctx.fillRect(-cw/2+2,ch/2-8,5,6);
  ctx.shadowBlur=0;

  // Wheels
  _dWheel(ctx,-cw*.3,-ch/2,_cvWheelAng[player],player);
  _dWheel(ctx, cw*.3,-ch/2,_cvWheelAng[player],player);
  _dWheel(ctx,-cw*.3, ch/2,_cvWheelAng[player],player);
  _dWheel(ctx, cw*.3, ch/2,_cvWheelAng[player],player);
  ctx.restore();

  // Name + speed tag
  ctx.save(); ctx.textAlign='center';
  ctx.font='bold 10px Fredoka One,cursive';
  ctx.fillStyle=player==='p1'?'#E74C3C':'#2980B9';
  ctx.shadowBlur=6; ctx.shadowColor=ctx.fillStyle;
  if (RBS) {
    const nm = player==='p1'
      ? (document.getElementById('rbP1Card') ? document.querySelector('.rb-p1-header .rb-player-label')?.textContent||'Player 1' : 'Player 1')
      : (document.querySelector('.rb-p2-header .rb-player-label')?.textContent||'Player 2');
    ctx.fillText(nm.toUpperCase(), sx, cy-ch/2-13);
  }
  if(_cvSpd[player]>6){
    ctx.font='bold 9px Baloo 2,sans-serif';
    ctx.fillStyle='#FFE66D'; ctx.shadowColor='#FFE66D';
    ctx.fillText('⚡'+(RBS?Math.round(RBS.speed[player]*9):0), sx, cy-ch/2-24);
  }
  ctx.restore();
}

function _dWheel(ctx,wx,wy,ang,player){
  const r=9;
  ctx.save(); ctx.translate(wx,wy);
  ctx.fillStyle='#141414'; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#555'; ctx.lineWidth=1.8;
  ctx.beginPath(); ctx.arc(0,0,r*.58,0,Math.PI*2); ctx.stroke();
  ctx.save(); ctx.rotate(ang);
  ctx.strokeStyle=player==='p1'?'#E74C3C':'#2980B9'; ctx.lineWidth=1.5;
  for(let s=0;s<4;s++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,r*.52);ctx.stroke();}
  ctx.restore(); ctx.restore();
}

function _dGap(W,H){
  if(!RBS) return;
  const gap=Math.abs(_cvPos.p1-_cvPos.p2);
  if(gap<50||gap>RBW.WORLD_LEN*.6) return;
  const ctx=_ctx, roadTop=H*.58,roadBot=H*.82,midY=(roadTop+roadBot)/2;
  const leader=_cvPos.p1>=_cvPos.p2?'p1':'p2';
  const lsx=_cvPos[leader]-_camX, tsx=_cvPos[leader==='p1'?'p2':'p1']-_camX;
  if(lsx<-80||tsx>W+80) return;
  const midX=(tsx+lsx)/2;
  if(midX>20&&midX<W-20){
    ctx.save(); ctx.globalAlpha=.52;
    ctx.strokeStyle=leader==='p1'?'rgba(231,76,60,.8)':'rgba(41,128,185,.8)';
    ctx.lineWidth=1.5; ctx.setLineDash([6,6]);
    ctx.beginPath(); ctx.moveTo(Math.max(0,tsx+32),midY); ctx.lineTo(Math.min(W,lsx-32),midY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,.9)';
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(midX-22,midY-9,44,17,9):ctx.rect(midX-22,midY-9,44,17);
    ctx.fill();
    ctx.fillStyle='#2D3436'; ctx.font='bold 9px Fredoka One,cursive';
    ctx.textAlign='center'; ctx.globalAlpha=1;
    ctx.fillText('+'+Math.round(gap/10)+'m',midX,midY+4);
    ctx.restore();
  }
}

function _dSpeedLines(W,H){
  if(!RBS) return;
  const spd=Math.max(RBS.speed.p1,RBS.speed.p2);
  if(spd<8) return;
  const ctx=_ctx, a=Math.min(.25,(spd-8)/50*.25);
  ctx.globalAlpha=a; ctx.strokeStyle='rgba(255,255,255,.6)'; ctx.lineWidth=1;
  const roadTop=H*.58,roadBot=H*.82;
  for(let i=0;i<14;i++){
    const y=roadTop+Math.random()*(roadBot-roadTop), len=10+Math.random()*75, x=Math.random()*W;
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-len,y); ctx.stroke();
  }
  ctx.globalAlpha=1;
}

// ── HOOK INTO EXISTING rbBeginRace ──
const _origRbBeginRace = window.rbBeginRace;
window.rbBeginRace = function() {
  // Call original (starts physics + question loops)
  if (_origRbBeginRace) _origRbBeginRace();

  // Init canvas
  _canvas = document.getElementById('rbRaceCanvas');
  if (!_canvas) { console.warn('rbRaceCanvas not found'); return; }
  _ctx = _canvas.getContext('2d');
  _camX = 0;
  _cvPos = {p1:0,p2:0};
  _cvSpd = {p1:RBW.BASE_SPD,p2:RBW.BASE_SPD};
  _cvBoostTimer = {p1:0,p2:0};
  _cvNitroTimer = {p1:0,p2:0};
  _cvWheelAng   = {p1:0,p2:0};
  _cvBounce     = {p1:0,p2:Math.PI};
  _prevLeaderCanvas = null;
  _buildCanvasWorld();
  _resizeRaceCanvas();
  _canvasActive = true;
  _lastTs = performance.now();
  cancelAnimationFrame(_rafId);
  _rafId = requestAnimationFrame(_canvasLoop);

  window.addEventListener('resize', _resizeRaceCanvas);
};

// ── HOOK INTO rbEndRace to stop canvas ──
const _origRbEndRace = window.rbEndRace;
window.rbEndRace = function(winnerPlayer) {
  _canvasActive = false;
  cancelAnimationFrame(_rafId);
  window.removeEventListener('resize', _resizeRaceCanvas);
  if (_origRbEndRace) _origRbEndRace(winnerPlayer);
};

// ── rbWinner alias (used in rbPhysicsTick) ──
window.rbWinner = window.rbEndRace;

// ── HOOK into rbTriggerTurbo to spawn canvas dust/boost ──
const _origRbTriggerTurbo = window.rbTriggerTurbo;
window.rbTriggerTurbo = function(player) {
  _cvBoostTimer[player] = 65;
  _cvNitroTimer[player] = 75;
  _spawnDust(player);
  if (_origRbTriggerTurbo) _origRbTriggerTurbo(player);
};

// ── HOOK into rbShowGlow for boost timer ──
const _origRbShowGlow = window.rbShowGlow;
window.rbShowGlow = function(player) {
  _cvBoostTimer[player] = 45;
  _cvNitroTimer[player] = 50;
  _spawnDust(player);
  if (_origRbShowGlow) _origRbShowGlow(player);
};

// ── ALSO boost canvas on regular correct answer ──
const _origRbSubmitAnswer = window.rbSubmitAnswer;
window.rbSubmitAnswer = function(player, given, correct, type, optGrid) {
  // Pre-check correctness to decide canvas boost
  let isOk = false;
  if (type==='mc' || type==='digital') isOk=String(given).trim()===String(correct).trim();
  else if (type==='arrange') isOk=String(given).trim().toLowerCase()===String(correct).trim().toLowerCase();
  else if (type==='drag') isOk=Math.abs((given.h%12)-((correct.hour12||12)%12))<=1&&Math.abs(given.m-(correct.minute||0))<=3;

  if (isOk) {
    _cvBoostTimer[player] = Math.max(_cvBoostTimer[player], 40);
    _cvNitroTimer[player] = Math.max(_cvNitroTimer[player], 42);
    _spawnDust(player);
  }
  // Call original
  if (_origRbSubmitAnswer) _origRbSubmitAnswer(player, given, correct, type, optGrid);
};

// ── ALSO hook startRacingBattle to reset canvas vars ──
const _origStartRacingBattle = window.startRacingBattle;
window.startRacingBattle = function() {
  _canvasActive = false;
  cancelAnimationFrame(_rafId);
  _cvPos = {p1:0,p2:0};
  _cvSpd = {p1:RBW.BASE_SPD,p2:RBW.BASE_SPD};
  _cvBoostTimer = {p1:0,p2:0};
  _cvNitroTimer = {p1:0,p2:0};
  _dustParticles = [];
  if (_origStartRacingBattle) _origStartRacingBattle();
};

// ── ALSO hook confirmRacingExit ──
const _origConfirmRacingExit = window.confirmRacingExit;
window.confirmRacingExit = function() {
  _canvasActive = false;
  cancelAnimationFrame(_rafId);
  if (_origConfirmRacingExit) _origConfirmRacingExit();
};

console.log('🏁 TickTock Racing Canvas Engine loaded');
})();

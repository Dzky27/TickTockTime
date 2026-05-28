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
    if (q.type === 'mc' || q.type === 'digital') { card.appendChild(buildGroupMCOptions(q)); } else if (q.type === 'mc_clock') { card.appendChild(buildGroupMCClockOptions(q)); } else if (q.type === 'arrange') { card.appendChild(buildArrangeWordsGroup(q)); } else if (q.type === 'drag') {
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
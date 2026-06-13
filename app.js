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



/* ═══════════════════════════════════════════════════════════════
   RACING BATTLE v3.1 — SMOOTH ARCADE ENGINE
   ZaxEduGame 2025

   SMOOTH MOTION FIXES:
   ✅ Pure rAF loop — no setInterval physics (no 80ms jumps)
   ✅ dt-based movement (frame-rate independent at any FPS)
   ✅ Pre-seeded deterministic random (no per-frame flicker)
   ✅ Speed-line pool (static, not regenerated every frame)
   ✅ Camera lerp uses dt-corrected factor (consistent at 30/60/120fps)
   ✅ Car vibration replaced by smooth sine-wave oscillation
   ✅ Wheel rotation accumulates angle smoothly
   ✅ Star positions pre-computed, blink via sine only
   ✅ will-change: transform on CSS animated elements
   ✅ All gradients cached where possible
   ✅ Particle cap prevents GC spikes
   ✅ Motion blur via trailing alpha rect (not random lines)
═══════════════════════════════════════════════════════════════ */
'use strict';

/* ────────────────────────────────────────────────────────────
   SECTION 1 — AUDIO MANAGER (global singleton)
──────────────────────────────────────────────────────────── */
const AudioManager = (() => {
  const _cache = {};
  const _loops  = {};
  let   _muted  = false;

  function _get(id) {
    if (_cache[id]) return _cache[id];
    const el = document.getElementById('sound-' + id)
            || document.getElementById('rb-sound-' + id);
    if (el) _cache[id] = el;
    return el || null;
  }

  function play(id, vol = 0.65) {
    if (_muted) return;
    const el = _get(id); if (!el) return;
    try { el.currentTime = 0; el.volume = Math.max(0, Math.min(1, vol)); el.play().catch(() => {}); } catch(e){}
  }

  function startLoop(id, vol = 0.18, rate = 1.0) {
    if (_muted) return;
    const el = _get(id); if (!el) return;
    try { el.loop = true; el.volume = vol; el.playbackRate = rate; el.play().catch(() => {}); _loops[id] = true; } catch(e){}
  }

  function updateLoop(id, vol, rate) {
    const el = _get(id); if (!el || !_loops[id]) return;
    if (vol  !== undefined) el.volume       = Math.max(0, Math.min(1, vol));
    if (rate !== undefined) el.playbackRate = rate;
  }

  function stopLoop(id) {
    const el = _get(id); if (!el) return;
    try { el.pause(); el.currentTime = 0; } catch(e){}
    delete _loops[id];
  }

  function stopAllRace() {
    ['engine','drift','boost','horn','countdown'].forEach(stopLoop);
    /* Fade out landing BGM when race ends */
    try {
      const ls = document.getElementById('sound-landing');
      if (ls && !ls.paused) {
        // Fade out gracefully
        let vol = ls.volume;
        const fade = setInterval(() => {
          vol = Math.max(0, vol - 0.01);
          ls.volume = vol;
          if (vol <= 0) { ls.pause(); clearInterval(fade); }
        }, 40);
      }
    } catch(e) {}
  }

  return { play, startLoop, updateLoop, stopLoop, stopAllRace };
})();

/* ────────────────────────────────────────────────────────────
   SECTION 2 — CONSTANTS
──────────────────────────────────────────────────────────── */
const RBV3 = {
  /* Track */
  WORLD_LEN   : 28000,
  FINISH_POS  : 26000,

  /* Speed (world-px per second) */
  IDLE_SPD    : 60,      // always-on base speed (px/s)
  BOOST_RIGHT : 220,     // burst on correct answer (px/s added)
  BOOST_COMBO3: 80,
  BOOST_TURBO : 180,
  BASE_GAIN   : 0.18,    // fraction of burst that lifts base
  MAX_SPD     : 900,
  DECAY_SEC   : 1.6,     // half-life of burst in seconds (e^(-dt/τ))

  /* Camera */
  CAM_LEAD    : 0.38,    // camera leads by this fraction of canvas width
  CAM_LERP    : 4.5,     // camera spring stiffness (higher = snappier)

  /* Progress */
  COMBO3      : 3,
  TURBO       : 5,

  /* Checkpoints (world-x) */
  CHECKPOINTS : [7000, 14000, 21000],

  /* Score */
  SCORE_RIGHT : 10,
  SCORE_COMBO : 3,

  /* Parallax multipliers */
  PARA_CLOUD  : 0.06,
  PARA_MTN    : 0.20,
  PARA_TREE   : 0.70,
};

/* ────────────────────────────────────────────────────────────
   SECTION 3 — RACE STATE
──────────────────────────────────────────────────────────── */
let RBS3 = null;

function rbv3FreshState() {
  return {
    active       : false,
    raceStarted  : false,
    winner       : null,
    carPos       : { p1: 0, p2: 0 },
    /* Speed (px/s) */
    speedBase    : { p1: RBV3.IDLE_SPD, p2: RBV3.IDLE_SPD },
    speedBurst   : { p1: 0, p2: 0 },
    speed        : { p1: 0, p2: 0 },
    progress     : { p1: 0, p2: 0 },
    score        : { p1: 0, p2: 0 },
    correct      : { p1: 0, p2: 0 },
    combo        : { p1: 0, p2: 0 },
    bestCombo    : { p1: 0, p2: 0 },
    turboCount   : { p1: 0, p2: 0 },
    locked       : { p1: false, p2: false },
    bank         : { p1: [], p2: [] },
    qIdx         : { p1: 0, p2: 0 },
    dragAngle    : { p1: { hour:0, minute:0 }, p2: { hour:0, minute:0 } },
    cpPassed     : { p1: [false,false,false], p2: [false,false,false] },
    prevLeader   : null,
    lightsTimer  : null,
    xpEarned     : { p1: 0, p2: 0 },
    coinsEarned  : { p1: 0, p2: 0 },
  };
}

/* ────────────────────────────────────────────────────────────
   SECTION 4 — CANVAS ENGINE  (all rendering)
──────────────────────────────────────────────────────────── */
let _canvas = null, _ctx = null;
let _canvasActive = false;
let _rafId = null;
let _prevTs = 0;

/* Camera (world-x of left edge of canvas) */
let _camX   = 0;
let _camXTarget = 0;

/* Visual car state — updated every rAF from physics */
let _vis = {
  p1: { x:0, spd:0, wheelAng:0, bounceT:0, burstTimer:0, nitroTimer:0 },
  p2: { x:0, spd:0, wheelAng:0, bounceT:Math.PI, burstTimer:0, nitroTimer:0 },
};

/* Pre-seeded world decorations */
let _wTrees = [], _wSigns = [], _wClouds = [], _wCheckpts = [];

/* Pre-computed star positions (never regenerated) */
let _wStars = [];

/* Speed line pool — static positions, rendered with alpha based on speed */
let _wLines = [];

/* Particles */
let _dust = [], _sparkles = [];
const DUST_CAP = 40, SPARKLE_CAP = 50;

/* ── SEEDED PRNG (Mulberry32) — deterministic, no flicker ── */
function _prng(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function _buildWorld() {
  const W = RBV3.WORLD_LEN + 3000;
  const r = _prng(0xDEAD_BEEF);

  /* Trees */
  _wTrees = [];
  const treeColors = ['#2E7D32','#388E3C','#43A047','#1B5E20','#4CAF50'];
  for (let x = 300; x < W; x += 65 + r() * 120) {
    _wTrees.push({
      x, side: r() > .5 ? 't' : 'b',
      h: 36 + r() * 44,
      w: 18 + r() * 14,
      c: treeColors[Math.floor(r() * treeColors.length)],
    });
  }

  /* Signs */
  _wSigns = [];
  const signLabels = ['QUIZ!','GO GO!','TICK TOCK!','FASTER!','⭐ COMBO!','🚀 TURBO!','KEEP GOING!'];
  for (let x = 1500; x < W; x += 1800 + r() * 900) {
    _wSigns.push({ x, lbl: signLabels[Math.floor(r() * signLabels.length)] });
  }

  /* Clouds */
  _wClouds = Array.from({ length: 32 }, (_, i) => ({
    wx : i * (W / 30) + r() * 300,
    wy : 0.04 + r() * 0.26,
    w  : 60 + r() * 90,
    a  : 0.10 + r() * 0.12,   // opacity
  }));

  /* Checkpoints */
  _wCheckpts = RBV3.CHECKPOINTS.map((wx, i) => ({
    wx, passed: false, flashT: 0,
    label : ['CHECKPOINT 1','HALFWAY!','FINAL STRETCH!'][i],
    short : ['CP 1','HALF','FINAL'][i],
  }));

  /* Stars — pre-computed; never change */
  _wStars = Array.from({ length: 70 }, (_, i) => ({
    wx  : r() * W,              // world-x (very slow parallax)
    wy  : r() * 0.85,           // fraction of sky height
    r   : 0.5 + r() * 1.0,
    phase: r() * Math.PI * 2,   // blink phase offset
    spd : 0.4 + r() * 1.0,      // blink speed
  }));

  /* Speed lines — static world-x offsets, rendered relative to camera */
  _wLines = Array.from({ length: 24 }, (_, i) => ({
    offX : r(),            // 0-1 fraction of screen width
    offY : 0.05 + r() * 0.90,   // fraction of road height
    len  : 18 + r() * 70,
  }));

  _dust = []; _sparkles = [];
}

/* ── CANVAS SETUP ─────────────────────────────────────────── */
function _resizeCanvas() {
  const world = document.getElementById('rbRaceWorld');
  if (!_canvas || !world) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w   = world.clientWidth  || window.innerWidth;
  const h   = world.clientHeight || 230;
  _canvas.width  = w * dpr;
  _canvas.height = h * dpr;
  _canvas.style.width  = w + 'px';
  _canvas.style.height = h + 'px';
  _ctx.setTransform(dpr, 0, 0, dpr, 0, 0);  // scale for DPR
}

/* ── MAIN rAF LOOP ─────────────────────────────────────────── */
function _canvasLoop(ts) {
  if (!_canvasActive) return;
  _rafId = requestAnimationFrame(_canvasLoop);

  /* dt clamped: never more than 50ms (tab was hidden, etc.) */
  const dt = Math.min((ts - _prevTs) / 1000, 0.05);
  _prevTs = ts;

  if (!RBS3 || !RBS3.active) { _drawFrame(ts, dt); return; }

  /* ── PHYSICS (dt-based, frame-rate independent) ── */
  ['p1','p2'].forEach(p => {
    /* Burst decays exponentially: burst *= e^(-dt/τ) */
    const decay = Math.exp(-dt / RBV3.DECAY_SEC);
    RBS3.speedBurst[p] *= decay;

    const totalSpd = Math.max(
      RBV3.IDLE_SPD,
      RBS3.speedBase[p] + RBS3.speedBurst[p]
    );
    RBS3.speed[p]   = Math.min(totalSpd, RBV3.MAX_SPD);

    /* Move car */
    RBS3.carPos[p] += RBS3.speed[p] * dt;
    RBS3.progress[p] = Math.min(100, (RBS3.carPos[p] / RBV3.FINISH_POS) * 100);

    /* Update visual state */
    const v = _vis[p];
    v.x   = RBS3.carPos[p];
    v.spd = RBS3.speed[p];
    v.wheelAng  += v.spd * dt * 0.045;     // smooth accumulate
    v.bounceT   += dt * (v.spd > 40 ? 11 : 4);  // suspension freq
    if (v.burstTimer > 0) v.burstTimer -= dt;
    if (v.nitroTimer > 0) v.nitroTimer -= dt;
  });

  /* ── CAMERA (spring — dt-corrected) ── */
  const leader = Math.max(_vis.p1.x, _vis.p2.x);
  const W_css  = _canvas.width  / (window.devicePixelRatio > 1 ? Math.min(window.devicePixelRatio,2) : 1);
  _camXTarget  = Math.max(0, leader - W_css * RBV3.CAM_LEAD);
  const lerpK  = 1 - Math.exp(-RBV3.CAM_LERP * dt);  // dt-correct lerp
  _camX       += (_camXTarget - _camX) * lerpK;

  /* ── CHECKPOINTS ── */
  _tickCheckpoints(ts);

  /* ── OVERTAKE ── */
  _tickOvertake();

  /* ── PARTICLES ── */
  _tickParticles(dt);

  /* ── AUDIO ── */
  const avgSpd = (RBS3.speed.p1 + RBS3.speed.p2) / 2;
  const t = Math.min(avgSpd / 600, 1);
  AudioManager.updateLoop('engine', 0.09 + t * 0.18, 0.80 + t * 0.65);

  /* ── DRAW ── */
  _drawFrame(ts, dt);

  /* ── WIN CHECK ── */
  if (RBS3.carPos.p1 >= RBV3.FINISH_POS) { rbEndRace('p1'); return; }
  if (RBS3.carPos.p2 >= RBV3.FINISH_POS) { rbEndRace('p2'); return; }

  /* ── HUD UPDATE (throttled to ~10fps to avoid DOM thrashing) ── */
  if (!_lastHudTs || ts - _lastHudTs > 100) { _rbUpdateHUD(); _lastHudTs = ts; }
}
let _lastHudTs = 0;

/* ────────────────────────────────────────────────────────────
   SECTION 5 — DRAW FUNCTIONS
──────────────────────────────────────────────────────────── */
function _drawFrame(ts, dt) {
  if (!_ctx || !_canvas) return;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const W   = _canvas.width  / DPR;
  const H   = _canvas.height / DPR;

  /* Layout constants */
  const SKY_FRAC  = 0.56;
  const ROAD_TOP  = H * SKY_FRAC;
  const ROAD_BOT  = H * 0.84;
  const ROAD_H    = ROAD_BOT - ROAD_TOP;

  _ctx.clearRect(0, 0, W, H);

  _dSky   (W, H, ROAD_TOP, ts);
  _dMtns  (W, H, ROAD_TOP);
  _dGrass (W, H, ROAD_TOP, ROAD_BOT);
  _dRoad  (W, H, ROAD_TOP, ROAD_BOT, ROAD_H, ts);
  _dTrees (W, H, ROAD_TOP, ROAD_BOT);
  _dSigns (W, H, ROAD_TOP);
  _dCheckpointsW(W, H, ROAD_TOP, ROAD_BOT, ROAD_H, ts);
  _dFinish(W, H, ROAD_TOP, ROAD_BOT, ROAD_H, ts);
  _dDust  (W, H);
  _dCar   ('p1', W, H, ROAD_TOP, ROAD_BOT, ts);
  _dCar   ('p2', W, H, ROAD_TOP, ROAD_BOT, ts);
  _dMotionBlur(W, H, ROAD_TOP, ROAD_BOT);
  _dSpeedLines(W, H, ROAD_TOP, ROAD_BOT, ts);
  _dSparkles  (W, H);
  _dGapIndicator(W, H, ROAD_TOP, ROAD_BOT);
}

/* ── SKY ──────────────────────────────────────────────────── */
function _dSky(W, H, roadTop, ts) {
  const ctx = _ctx;
  /* Daytime sky — matches landing page #8EC5E6 */
  const g = ctx.createLinearGradient(0, 0, 0, roadTop);
  g.addColorStop(0,    '#4facfe');
  g.addColorStop(0.35, '#6EC6F5');
  g.addColorStop(0.75, '#87CEEB');
  g.addColorStop(1,    '#b8e4f9');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, roadTop + 2);

  /* Sun — bright & cheerful */
  const sunX = ((W * 0.78 - _camX * 0.005) % (W + 60) + W + 60) % (W + 60);
  const sunY = roadTop * 0.18;
  ctx.shadowBlur = 28; ctx.shadowColor = 'rgba(255,230,109,.7)';
  const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 22);
  sg.addColorStop(0, '#FFE66D'); sg.addColorStop(0.5, '#FF9F43'); sg.addColorStop(1, 'rgba(255,159,67,0)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(sunX, sunY, 22, 0, 6.2832); ctx.fill();
  /* Sun rays */
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,230,109,.45)';
  ctx.lineWidth = 2;
  for (let r = 0; r < 8; r++) {
    const a = (r / 8) * Math.PI * 2 + ts * 0.0004;
    ctx.beginPath();
    ctx.moveTo(sunX + Math.cos(a) * 26, sunY + Math.sin(a) * 26);
    ctx.lineTo(sunX + Math.cos(a) * 38, sunY + Math.sin(a) * 38);
    ctx.stroke();
  }

  /* Fluffy white clouds — parallax */
  _wClouds.forEach(c => {
    const sx = ((c.wx - _camX * RBV3.PARA_CLOUD) % (W + c.w * 2 + 10) + W + c.w * 2 + 10) % (W + c.w * 2 + 10) - c.w;
    const y  = c.wy * roadTop;
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(100,181,246,.3)';
    ctx.beginPath(); ctx.ellipse(sx,             y + c.w * .14, c.w * .52, c.w * .20, 0, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx + c.w * .14, y,             c.w * .32, c.w * .16, 0, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx - c.w * .11, y + c.w * .08, c.w * .28, c.w * .13, 0, 0, 6.2832); ctx.fill();
    ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1;
}

/* ── HILLS / MOUNTAINS ─────────────────────────────────────── */
function _dMtns(W, H, roadTop) {
  /* Far hills — soft blue-green */
  _ctx.fillStyle = '#7EC8A4';
  _mtnStrip(W, roadTop, _camX * RBV3.PARA_MTN * 0.5, 7, 0.38, 0.54);
  /* Near hills — richer green */
  _ctx.fillStyle = '#5aaa7a';
  _mtnStrip(W, roadTop, _camX * RBV3.PARA_MTN, 5, 0.26, 0.65);
}

function _mtnStrip(W, hy, off, n, hf, vari) {
  const ctx = _ctx;
  const sp = W / (n - 1);
  const offMod = off % sp;
  ctx.beginPath();
  ctx.moveTo(-sp * 1.5, hy);
  for (let i = -1; i < n + 2; i++) {
    const bx = i * sp - offMod;
    /* Deterministic height via cosine so no random each frame */
    const mh = hy * hf * (vari + (1 - vari) * (0.5 + 0.5 * Math.cos(i * 2.6 + off * 0.003)));
    ctx.lineTo(bx - sp * .4, hy);
    ctx.lineTo(bx,           hy - mh);
    ctx.lineTo(bx + sp * .4, hy);
  }
  ctx.lineTo(W + sp * 1.5, hy);
  ctx.closePath();
  ctx.fill();
}

/* ── GRASS ────────────────────────────────────────────────── */
function _dGrass(W, H, roadTop, roadBot) {
  const ctx = _ctx;
  /* Bright green grass — matches landing page ground */
  ctx.fillStyle = '#6aaf4a';
  ctx.fillRect(0, roadTop - 10, W, 12);
  ctx.fillRect(0, roadBot,      W, H - roadBot);
  /* Alternating stripes for depth */
  const goff = _camX % 68;
  ctx.fillStyle = '#7ccf5a';
  for (let x = -goff; x < W + 68; x += 68) {
    ctx.fillRect(x, roadTop - 10, 34, 12);
    ctx.fillRect(x, roadBot,      34, H - roadBot);
  }
}

/* ── ROAD ─────────────────────────────────────────────────── */
function _dRoad(W, H, roadTop, roadBot, roadH, ts) {
  const ctx = _ctx;

  /* Road — warm light grey, friendly */
  const rg = ctx.createLinearGradient(0, roadTop, 0, roadBot);
  rg.addColorStop(0,   '#B0BEC5');
  rg.addColorStop(0.5, '#90A4AE');
  rg.addColorStop(1,   '#78909C');
  ctx.fillStyle = rg;
  ctx.fillRect(0, roadTop, W, roadH);

  /* Subtle road texture lines */
  ctx.strokeStyle = 'rgba(255,255,255,.15)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const y = roadTop + roadH * (i / 4);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  /* Kerb strips (top & bottom) — animated scroll */
  const koff = _camX % 28;
  for (let x = -koff; x < W + 28; x += 28) {
    ctx.fillStyle = '#D32F2F'; ctx.fillRect(x,      roadTop,     14, 6);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 14, roadTop,     14, 6);
    ctx.fillStyle = '#D32F2F'; ctx.fillRect(x,      roadBot - 6, 14, 6);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 14, roadBot - 6, 14, 6);
  }

  /* Road edge lines */
  ctx.strokeStyle = 'rgba(255,255,255,.22)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, roadTop + 7); ctx.lineTo(W, roadTop + 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, roadBot - 7); ctx.lineTo(W, roadBot - 7); ctx.stroke();

  /* Centre dashes (yellow) */
  const dLen = 44, dGap = 34, dUnit = dLen + dGap;
  const doff = _camX % dUnit;
  const cy = (roadTop + roadBot) * 0.5;
  ctx.strokeStyle = '#FFE66D';  /* Landing page accent yellow */
  ctx.lineWidth = 3;
  ctx.setLineDash([dLen, dGap]);
  ctx.lineDashOffset = -doff;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
  ctx.setLineDash([]);

  /* Lane guides (very subtle) */
  ctx.strokeStyle = 'rgba(255,255,255,.04)';
  ctx.lineWidth = 1;
  ctx.setLineDash([18, 28]); ctx.lineDashOffset = -doff;
  const p1y = roadTop + roadH * 0.27;
  const p2y = roadTop + roadH * 0.73;
  ctx.beginPath(); ctx.moveTo(0, p1y); ctx.lineTo(W, p1y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, p2y); ctx.lineTo(W, p2y); ctx.stroke();
  ctx.setLineDash([]);
}

/* ── TREES ────────────────────────────────────────────────── */
function _dTrees(W, H, roadTop, roadBot) {
  const ctx = _ctx;
  _wTrees.forEach(tr => {
    const sx = tr.x - _camX * RBV3.PARA_TREE;
    if (sx < -90 || sx > W + 90) return;
    const isTop = tr.side === 't';
    const baseY = isTop ? roadTop - 3 : roadBot + 3;
    const dir   = isTop ? -1 : 1;
    /* Trunk */
    ctx.fillStyle = '#4A2C0A';
    ctx.fillRect(sx - 3, baseY, 7, dir * tr.h * 0.33);
    /* Foliage shadow */
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(sx + 3, baseY + dir * tr.h * 0.61, tr.w * 0.5, tr.h * 0.4, 0, 0, 6.2832);
    ctx.fill();
    ctx.globalAlpha = 1;
    /* Foliage */
    const fg = ctx.createRadialGradient(sx - tr.w * .12, baseY + dir * tr.h * .52, 0, sx, baseY + dir * tr.h * .60, tr.w * .52);
    fg.addColorStop(0, '#66BB6A'); fg.addColorStop(1, tr.c);
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.ellipse(sx, baseY + dir * tr.h * 0.60, tr.w * .50, tr.h * .40, 0, 0, 6.2832);
    ctx.fill();
  });
}

/* ── SIGNS ────────────────────────────────────────────────── */
function _dSigns(W, H, roadTop) {
  const ctx = _ctx;
  _wSigns.forEach(s => {
    const sx = s.x - _camX;
    if (sx < -160 || sx > W + 160) return;
    /* Post */
    ctx.fillStyle = '#546E7A';
    ctx.fillRect(sx - 2, roadTop - 54, 4, 54);
    /* Board */
    ctx.save();
    ctx.font = 'bold 11px "Fredoka One",cursive';
    const tw = ctx.measureText(s.lbl).width + 18;
    const bx = sx - tw / 2, by = roadTop - 72, bh = 22;
    /* Background */
    _rrect(ctx, bx, by, tw, bh, 5);
    ctx.fillStyle = '#FFD600'; ctx.fill();
    ctx.strokeStyle = '#E65100'; ctx.lineWidth = 1.5; ctx.stroke();
    /* Text */
    ctx.fillStyle = '#1A237E';
    ctx.textAlign = 'center';
    ctx.fillText(s.lbl, sx, by + 15);
    ctx.restore();
  });
}

/* ── CHECKPOINTS ──────────────────────────────────────────── */
function _dCheckpointsW(W, H, roadTop, roadBot, roadH, ts) {
  const ctx = _ctx;
  const t = ts * 0.0025;

  _wCheckpts.forEach((cp, idx) => {
    const sx = cp.wx - _camX;
    if (sx < -240 || sx > W + 240) return;

    const pulse    = 0.5 + 0.5 * Math.sin(t * 2.2 + idx * 1.1);
    const col      = cp.passed ? '#4CAF50' : '#00D2D3';
    const glowCol  = cp.passed ? 'rgba(76,175,80,.6)' : 'rgba(0,210,211,.7)';
    const postW    = 7, postX1 = sx - 18, postX2 = sx + 12;
    const postTop  = roadTop - 78;

    /* Post glow */
    ctx.shadowBlur  = 10 + pulse * 8;
    ctx.shadowColor = glowCol;
    ctx.fillStyle   = col;
    ctx.fillRect(postX1, postTop, postW, roadH + 78);
    ctx.fillRect(postX2, postTop, postW, roadH + 78);
    ctx.shadowBlur  = 0;

    /* Top beam with checkered pattern */
    const beamX = postX1, beamW = postX2 - postX1 + postW, beamH = 14;
    const beamY = postTop;
    const bs = 7;
    for (let bx = 0; bx < beamW; bx += bs) {
      for (let by = 0; by < beamH; by += bs) {
        ctx.fillStyle = ((Math.floor(bx/bs) + Math.floor(by/bs)) % 2 === 0) ? '#FFFFFF' : '#1A1A2E';
        ctx.fillRect(beamX + bx, beamY + by, bs, bs);
      }
    }

    /* Label */
    ctx.save();
    ctx.font = 'bold 11px "Fredoka One",cursive';
    ctx.textAlign = 'center';
    ctx.fillStyle = cp.passed ? '#A5D6A7' : '#B2EBF2';
    ctx.shadowBlur = 5; ctx.shadowColor = glowCol;
    ctx.fillText(cp.short, sx + 5, postTop - 8);
    ctx.restore();

    /* Flash overlay on recent pass */
    if (cp.flashT > 0) {
      const fa = Math.min(1, cp.flashT) * 0.45;
      ctx.globalAlpha = fa;
      const fg = ctx.createRadialGradient(sx + 5, roadTop + roadH / 2, 0, sx + 5, roadTop + roadH / 2, 120);
      fg.addColorStop(0, '#00D2D3'); fg.addColorStop(1, 'transparent');
      ctx.fillStyle = fg;
      ctx.fillRect(sx - 120, roadTop, 240, roadH);
      ctx.globalAlpha = 1;
    }
  });
}

/* ── FINISH LINE ──────────────────────────────────────────── */
function _dFinish(W, H, roadTop, roadBot, roadH, ts) {
  const sx = RBV3.WORLD_LEN - _camX;
  if (sx < -320 || sx > W + 320) return;
  const ctx = _ctx;
  const t   = ts * 0.003;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.8);
  const archW = 80;

  /* Glow posts */
  ctx.shadowBlur  = 24 + pulse * 14;
  ctx.shadowColor = `rgba(255,200,0,${.5 + pulse * .3})`;
  ctx.fillStyle   = '#FF9800';
  ctx.fillRect(sx - archW/2 - 10, roadTop - 100, 12, roadH + 100);
  ctx.fillRect(sx + archW/2,      roadTop - 100, 12, roadH + 100);
  ctx.shadowBlur  = 0;

  /* Beam */
  const bx = sx - archW/2 - 10, bw = archW + 22, bh = 30;
  const by = roadTop - 100;
  const bs = 9;
  for (let ox = 0; ox < bw; ox += bs) for (let oy = 0; oy < bh; oy += bs) {
    ctx.fillStyle = ((Math.floor(ox/bs) + Math.floor(oy/bs)) % 2 === 0) ? '#FFFFFF' : '#111827';
    ctx.fillRect(bx + ox, by + oy, bs, bs);
  }

  /* Checkered road surface */
  const cs = 20;
  for (let rx = Math.floor(sx/cs)*cs - cs; rx < sx + cs * 2; rx += cs)
    for (let ry = 0; ry < roadH; ry += cs) {
      ctx.fillStyle = ((Math.floor(rx/cs) + Math.floor(ry/cs)) % 2 === 0)
        ? 'rgba(255,255,255,.8)' : 'rgba(0,0,0,.5)';
      ctx.fillRect(rx, roadTop + ry, cs, cs);
    }

  /* FINISH text */
  ctx.save();
  ctx.font = 'bold 22px "Fredoka One",cursive';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD700';
  ctx.shadowBlur = 12 + pulse * 8; ctx.shadowColor = '#FF9800';
  ctx.fillText('🏁 FINISH', sx + 5, roadTop - 108);
  ctx.restore();

  /* Distance indicator */
  if (RBS3 && !RBS3.winner) {
    const best = Math.max(_vis.p1.x, _vis.p2.x);
    const dist = Math.max(0, RBV3.WORLD_LEN - best);
    if (dist < 3500) {
      ctx.save();
      ctx.font = 'bold 10px "Baloo 2",cursive';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(255,215,0,${.4 + pulse * .4})`;
      ctx.fillText(Math.ceil(dist / 28) + 'm', sx + 5, roadBot + 14);
      ctx.restore();
    }
  }
}

/* ── CARS ─────────────────────────────────────────────────── */
function _dCar(player, W, H, roadTop, roadBot, ts) {
  const ctx = _ctx;
  const v   = _vis[player];
  const isP1 = player === 'p1';

  const roadH  = roadBot - roadTop;
  const laneY  = roadTop + roadH * (isP1 ? 0.25 : 0.74);

  /* Smooth sine-wave suspension — no random vibration */
  const suspAmp = Math.min(v.spd / 300, 1) * 2.8;
  const susp    = Math.sin(v.bounceT) * suspAmp;
  const cy      = laneY + susp;
  const sx      = v.x - _camX;
  const cw = 70, ch = 28;

  ctx.save();
  ctx.translate(sx, cy);

  /* ── AFTERIMAGE TRAIL ── */
  if (v.burstTimer > 0) {
    const a    = Math.min(v.burstTimer / 0.8, 1);
    const tCol = isP1 ? [255,71,87] : [30,144,255];
    for (let i = 6; i >= 1; i--) {
      ctx.globalAlpha = a * (0.18 - i * 0.026);
      ctx.fillStyle = `rgb(${tCol[0]},${tCol[1]},${tCol[2]})`;
      const tw = cw * (1 - i * .08), th = ch * (1 - i * .06);
      ctx.save();
      ctx.translate(-cw * .45 - i * 14, 0);
      _rrect(ctx, -tw/2 + cw/2, -th/2, tw, th, 6);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  /* ── NITRO FLAME ── */
  if (v.nitroTimer > 0) {
    const fa = Math.min(v.nitroTimer / 0.7, 1);
    const ft = ts * 0.012;
    ctx.globalAlpha = fa;
    /* Outer flame */
    const fg = ctx.createLinearGradient(-cw/2 - 34, 0, -cw/2, 0);
    fg.addColorStop(0,   'transparent');
    fg.addColorStop(0.3, isP1 ? 'rgba(255,152,0,.9)' : 'rgba(100,181,246,.9)');
    fg.addColorStop(1,   isP1 ? '#FF4757' : '#1E90FF');
    ctx.fillStyle = fg;
    const fh = ch * (0.55 + 0.35 * Math.sin(ft));
    _rrect(ctx, -cw/2 - 34, -fh/2, 34, fh, 4); ctx.fill();
    /* White core */
    ctx.globalAlpha = fa * 0.6;
    ctx.fillStyle = '#FFFFFF';
    _rrect(ctx, -cw/2 - 20, -fh * 0.28, 16, fh * 0.56, 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* ── SHADOW ── */
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(3, ch / 2 + 4, cw * 0.46, 4.5, 0, 0, 6.2832);
  ctx.fill();
  ctx.globalAlpha = 1;

  /* ── BODY ── */
  ctx.shadowBlur  = v.burstTimer > 0 ? 14 : 3;
  ctx.shadowColor = isP1 ? 'rgba(255,71,87,.45)' : 'rgba(30,144,255,.45)';
  const bg = ctx.createLinearGradient(-cw/2, -ch/2, cw/2, ch/2);
  if (isP1) { bg.addColorStop(0,'#FF6B81'); bg.addColorStop(.55,'#FF4757'); bg.addColorStop(1,'#C0392B'); }
  else       { bg.addColorStop(0,'#74B9FF'); bg.addColorStop(.55,'#1E90FF'); bg.addColorStop(1,'#1565C0'); }
  ctx.fillStyle = bg;
  _rrect(ctx, -cw/2, -ch/2, cw, ch, 8); ctx.fill();
  ctx.shadowBlur = 0;

  /* Body highlight */
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#FFFFFF';
  _rrect(ctx, -cw/2 + 4, -ch/2 + 2, cw - 8, ch * 0.38, 6); ctx.fill();
  ctx.globalAlpha = 1;

  /* ── SPOILER ── */
  ctx.fillStyle = isP1 ? '#B71C1C' : '#0D47A1';
  _rrect(ctx, -cw/2 - 8, -ch/2, 10, ch, 3); ctx.fill();
  ctx.fillStyle = isP1 ? '#EF5350' : '#42A5F5';
  ctx.fillRect(-cw/2 - 9, -ch/2, 11, 4);
  ctx.fillRect(-cw/2 - 9, ch/2 - 4, 11, 4);

  /* ── WINDSHIELD ── */
  const wsg = ctx.createLinearGradient(0, -ch/2, 0, -ch/2 + 14);
  wsg.addColorStop(0, 'rgba(165,235,255,.95)'); wsg.addColorStop(1, 'rgba(100,185,255,.65)');
  ctx.fillStyle = wsg;
  _rrect(ctx, -cw * .06, -ch/2 - 11, cw * .42, 15, 4); ctx.fill();
  /* Reflection glint */
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-cw * .04, -ch/2 - 9, 7, 10);
  ctx.globalAlpha = 1;

  /* ── RACING STRIPE ── */
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-cw/2 + 8, -2, cw - 16, 5);
  ctx.globalAlpha = 1;

  /* ── NUMBER PLATE ── */
  ctx.fillStyle = 'rgba(0,0,0,.7)';
  _rrect(ctx, cw * .09, -8, 22, 16, 4); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 8px "Fredoka One",cursive';
  ctx.textAlign = 'center';
  ctx.fillText(isP1 ? 'P1' : 'P2', cw * .20, 4);

  /* ── HEADLIGHTS ── */
  ctx.shadowBlur = 12; ctx.shadowColor = '#FFE066';
  ctx.fillStyle = '#FFE566';
  ctx.fillRect(cw/2 - 6, -ch/2 + 2, 5, 8);
  ctx.fillRect(cw/2 - 6, ch/2 - 10, 5, 8);

  /* ── TAIL LIGHTS ── */
  const tailCol = v.nitroTimer > 0 ? '#FF9800' : '#E53935';
  ctx.shadowBlur = 9; ctx.shadowColor = tailCol;
  ctx.fillStyle = tailCol;
  ctx.fillRect(-cw/2 + 2, -ch/2 + 2, 5, 7);
  ctx.fillRect(-cw/2 + 2, ch/2 - 9,  5, 7);
  ctx.shadowBlur = 0;

  /* ── WHEELS ── */
  _dWheel(ctx, -cw * .3, -ch/2, v.wheelAng, isP1);
  _dWheel(ctx,  cw * .3, -ch/2, v.wheelAng, isP1);
  _dWheel(ctx, -cw * .3,  ch/2, v.wheelAng, isP1);
  _dWheel(ctx,  cw * .3,  ch/2, v.wheelAng, isP1);

  ctx.restore();

  /* ── PLAYER LABEL ── */
  if (sx > -80 && sx < W + 80) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 10px "Fredoka One",cursive';
    ctx.fillStyle = isP1 ? '#FF6B81' : '#54A0FF';
    ctx.shadowBlur = 5; ctx.shadowColor = ctx.fillStyle;
    ctx.fillText(isP1 ? '🏎 P1' : '🚙 P2', sx, laneY - ch / 2 - 14);
    /* Speed badge */
    if (v.spd > 100) {
      const kmh = Math.round(v.spd / 6);
      ctx.font = 'bold 9px "Baloo 2",cursive';
      ctx.fillStyle = '#FFD700'; ctx.shadowColor = '#FFD700';
      ctx.fillText('⚡ ' + kmh + 'km/h', sx, laneY - ch / 2 - 26);
    }
    ctx.restore();
  }
}

function _dWheel(ctx, wx, wy, ang, isP1) {
  const r = 9;
  ctx.save();
  ctx.translate(wx, wy);
  /* Tire */
  const tg = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  tg.addColorStop(0, '#3A3A3A'); tg.addColorStop(1, '#111');
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.fill();
  /* White wall */
  ctx.strokeStyle = 'rgba(255,255,255,.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, r - 1, 0, 6.2832); ctx.stroke();
  /* Rim */
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, r * .52, 0, 6.2832); ctx.stroke();
  /* Spokes */
  ctx.save();
  ctx.rotate(ang);
  ctx.strokeStyle = isP1 ? '#FF6B81' : '#54A0FF';
  ctx.lineWidth = 1.8;
  for (let s = 0; s < 4; s++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, r * .48); ctx.stroke();
  }
  ctx.restore();
  /* Hub */
  ctx.fillStyle = '#888';
  ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, 6.2832); ctx.fill();
  ctx.restore();
}

/* ── MOTION BLUR ──────────────────────────────────────────── */
function _dMotionBlur(W, H, roadTop, roadBot) {
  if (!RBS3) return;
  const maxSpd = Math.max(_vis.p1.spd, _vis.p2.spd);
  if (maxSpd < 200) return;
  const a = Math.min((maxSpd - 200) / 500, 1) * 0.06;
  _ctx.globalAlpha = a;
  _ctx.fillStyle = 'rgba(142,197,230,.4)';
  _ctx.fillRect(0, roadTop, W, roadBot - roadTop);
  _ctx.globalAlpha = 1;
}

/* ── SPEED LINES (from pre-built pool, no random each frame) ─ */
function _dSpeedLines(W, H, roadTop, roadBot, ts) {
  if (!RBS3) return;
  const maxSpd = Math.max(_vis.p1.spd, _vis.p2.spd);
  if (maxSpd < 150) return;
  const ctx = _ctx;
  const roadH = roadBot - roadTop;
  const a = Math.min((maxSpd - 150) / 400, 1) * 0.32;
  ctx.globalAlpha = a;
  ctx.strokeStyle = 'rgba(255,255,255,.8)';
  ctx.lineWidth = 1.0;

  /* Offset lines by camera so they scroll smoothly */
  const camOff = (_camX * 0.15) % W;
  _wLines.forEach(ln => {
    const x = ((ln.offX * W - camOff) % W + W) % W;
    const y = roadTop + ln.offY * roadH;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - ln.len, y);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
}

/* ── DUST & SPARKLES ──────────────────────────────────────── */
function _spawnDust(player) {
  if (!_canvas || _dust.length >= DUST_CAP) return;
  const DPR   = Math.min(window.devicePixelRatio || 1, 2);
  const H_css = _canvas.height / DPR;
  const roadTop = H_css * 0.56, roadBot = H_css * 0.84, roadH = roadBot - roadTop;
  const laneY   = roadTop + roadH * (player === 'p1' ? 0.25 : 0.74);
  const r2 = _prng(Date.now() & 0xFFFF);
  const tCol = player === 'p1' ? [255,71,87] : [30,144,255];
  for (let i = 0; i < 8; i++) {
    _dust.push({
      x: _vis[player].x - _camX - 38 + (r2() - .5) * 10,
      y: laneY + (r2() - .5) * 8,
      vx: -(1.5 + r2() * 3.5),
      vy: (r2() - .5) * 2.2,
      r:  2.5 + r2() * 3.5,
      life: 1, tCol,
    });
  }
}

function _spawnSparkle(x, y, color) {
  if (_sparkles.length >= SPARKLE_CAP) return;
  const r2 = _prng((x * 1000 + y) | 0);
  for (let i = 0; i < 7; i++) {
    const ang = r2() * 6.2832;
    const spd = 1.5 + r2() * 3.5;
    _sparkles.push({ x, y, vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd - 1.5,
                     r: 1.8 + r2() * 2.8, life: 1.0, color });
  }
}

function _tickParticles(dt) {
  _dust = _dust.filter(d => {
    d.x += d.vx; d.y += d.vy; d.life -= dt * 2.8; return d.life > 0;
  });
  _sparkles = _sparkles.filter(s => {
    s.x += s.vx; s.y += s.vy; s.vy += 0.10; s.life -= dt * 2.2; return s.life > 0;
  });
}

function _dDust(W, H) {
  _dust.forEach(d => {
    _ctx.globalAlpha = d.life * 0.5;
    _ctx.fillStyle = `rgba(${d.tCol[0]},${d.tCol[1]},${d.tCol[2]},${d.life * 0.55})`;
    _ctx.beginPath(); _ctx.arc(d.x, d.y, Math.max(.5, d.r * d.life), 0, 6.2832); _ctx.fill();
  });
  _ctx.globalAlpha = 1;
}

function _dSparkles(W, H) {
  _sparkles.forEach(s => {
    _ctx.globalAlpha = s.life * 0.9;
    _ctx.shadowBlur = 4; _ctx.shadowColor = s.color;
    _ctx.fillStyle = s.color;
    _ctx.beginPath(); _ctx.arc(s.x, s.y, s.r * s.life, 0, 6.2832); _ctx.fill();
  });
  _ctx.shadowBlur = 0;
  _ctx.globalAlpha = 1;
}

/* ── GAP INDICATOR ────────────────────────────────────────── */
function _dGapIndicator(W, H, roadTop, roadBot) {
  if (!RBS3) return;
  const gap = Math.abs(_vis.p1.x - _vis.p2.x);
  if (gap < 200 || gap > RBV3.WORLD_LEN * 0.35) return;
  const ctx = _ctx;
  const leader = _vis.p1.x >= _vis.p2.x ? 'p1' : 'p2';
  const lsx    = _vis[leader].x - _camX;
  const tsx    = _vis[leader === 'p1' ? 'p2' : 'p1'].x - _camX;
  const midX   = (lsx + tsx) * 0.5;
  const midY   = (roadTop + roadBot) * 0.5;
  if (midX < 20 || midX > W - 20) return;
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = leader === 'p1' ? 'rgba(255,71,87,.7)' : 'rgba(30,144,255,.7)';
  ctx.lineWidth = 1.2; ctx.setLineDash([5,5]);
  ctx.beginPath(); ctx.moveTo(Math.max(tsx + 38, 0), midY); ctx.lineTo(Math.min(lsx - 38, W), midY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  _rrect(ctx, midX - 22, midY - 9, 44, 18, 9);
  ctx.fillStyle = 'rgba(10,14,39,.85)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#E0E0E0';
  ctx.font = 'bold 9px "Fredoka One",cursive';
  ctx.textAlign = 'center';
  ctx.fillText('+' + Math.round(gap / 28) + 'm', midX, midY + 4);
  ctx.restore();
}

/* ────────────────────────────────────────────────────────────
   SECTION 6 — CHECKPOINT & OVERTAKE TICKS
──────────────────────────────────────────────────────────── */
const _cpTriggered = { p1: [false,false,false], p2: [false,false,false] };
const CP_LABELS = ['🏁 Checkpoint 1!', '⚡ Halfway There!', '🔥 Final Stretch!'];

function _tickCheckpoints(ts) {
  if (!RBS3) return;
  /* Decay flash timers */
  _wCheckpts.forEach(cp => { if (cp.flashT > 0) cp.flashT -= 0.025; });
  /* Check passes */
  ['p1','p2'].forEach(p => {
    RBV3.CHECKPOINTS.forEach((cpX, i) => {
      if (_cpTriggered[p][i]) return;
      if (RBS3.carPos[p] >= cpX) {
        _cpTriggered[p][i] = true;
        _wCheckpts[i].flashT = 1.5;
        _showCheckpointFX(CP_LABELS[i], p);
      }
    });
  });
}

function _showCheckpointFX(label, player) {
  AudioManager.play('right', 0.5);
  const el = document.getElementById('rbMilestonePopup');
  if (el) {
    el.textContent = label;
    el.className = 'rb-milestone-popup';
    void el.offsetWidth;
    el.classList.add('show');
    setTimeout(() => { el.className = 'rb-milestone-popup hidden'; }, 2600);
  }
  if (_canvas) {
    const DPR   = Math.min(window.devicePixelRatio || 1, 2);
    const H_css = _canvas.height / DPR;
    const roadTop = H_css * 0.56, roadBot = H_css * 0.84, roadH = roadBot - roadTop;
    const laneY   = roadTop + roadH * (player === 'p1' ? 0.25 : 0.74);
    const sx      = _vis[player].x - _camX;
    const cols    = ['#FFD700','#00D2D3','#FF6B81','#A29BFE'];
    const r2      = _prng((Date.now() + laneY) | 0);
    for (let i = 0; i < 14; i++) {
      _spawnSparkle(sx + (r2() - .5) * 70, laneY + (r2() - .5) * 20, cols[Math.floor(r2() * cols.length)]);
    }
  }
}

function _tickOvertake() {
  if (!RBS3) return;
  const leader = RBS3.progress.p1 >= RBS3.progress.p2 ? 'p1' : 'p2';
  if (RBS3.prevLeader && RBS3.prevLeader !== leader) _showOvertake(leader);
  RBS3.prevLeader = leader;
}

function _showOvertake(newLeader) {
  AudioManager.play('horn', 0.4);
  const toast = document.getElementById('rbOvertakeToast');
  if (!toast) return;
  toast.textContent = `🔔 ${newLeader === 'p1' ? 'Player 1 🏎️' : 'Player 2 🚙'} Overtakes!`;
  toast.className = 'rb-overtake-toast';
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => { toast.className = 'rb-overtake-toast'; }, 3200);
}

/* ────────────────────────────────────────────────────────────
   SECTION 7 — RACE ENTRY & SETUP
──────────────────────────────────────────────────────────── */
function startRacingBattle() {
  /* Stop landing BGM — will be restarted in rbBeginRace at low volume */
  const ls = document.getElementById('sound-landing');
  if (ls) { try { ls.pause(); } catch(e){} }
  AudioManager.stopAllRace();

  _canvasActive = false;
  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }

  RBS3 = rbv3FreshState();
  RBS3.bank.p1 = shuffle(buildQuestionBank());
  RBS3.bank.p2 = shuffle(buildQuestionBank());
  if (RBS3.bank.p2.length > 3) {
    const cut = RBS3.bank.p2.splice(0, 3);
    RBS3.bank.p2.push(...cut);
  }

  /* Reset visual state */
  _vis = {
    p1: { x:0, spd:0, wheelAng:0, bounceT:0,        burstTimer:0, nitroTimer:0 },
    p2: { x:0, spd:0, wheelAng:0, bounceT:Math.PI,   burstTimer:0, nitroTimer:0 },
  };
  _camX = 0; _camXTarget = 0; _lastHudTs = 0;
  _cpTriggered.p1 = [false,false,false];
  _cpTriggered.p2 = [false,false,false];

  showPage('racing-battle');
  _rbv3BuildLayout();
  _rbv3InitCanvas();
  _rbv3ResetHUD();

  rbRenderQuestion('p1');
  rbRenderQuestion('p2');
  rbLockBoth(true);

  rbRunLightsSequence();
}

/* ────────────────────────────────────────────────────────────
   SECTION 8 — LAYOUT
──────────────────────────────────────────────────────────── */
function _rbv3BuildLayout() {
  const page = document.getElementById('racing-battle');
  if (!page) return;
  page.innerHTML = `
  <!-- HEADER -->
  <div class="rb-header">
    <button class="rb-exit-btn" onclick="confirmRacingExit()">← Exit</button>
    <div class="rb-header-center">
      <div class="rb-header-title">🏎️ Racing Battle ⏰</div>
      <div class="rb-dual-progress">
        <div class="rb-dp-row">
          <div class="rb-dp-label" style="color:#E74C3C">🏎 P1</div>
          <div class="rb-dp-track" id="rbTrackP1">
            <div class="rb-dp-fill rb-dp-p1" id="rbDpP1"></div>
            <div class="rb-ms-dot rb-ms-p1" id="rbMsDotP1"></div>
          </div>
          <div class="rb-dp-pct" id="rbDpPctP1">0%</div>
        </div>
        <div class="rb-dp-row">
          <div class="rb-dp-label" style="color:#2980B9">🚙 P2</div>
          <div class="rb-dp-track" id="rbTrackP2">
            <div class="rb-dp-fill rb-dp-p2" id="rbDpP2"></div>
            <div class="rb-ms-dot rb-ms-p2" id="rbMsDotP2"></div>
          </div>
          <div class="rb-dp-pct" id="rbDpPctP2">0%</div>
        </div>
      </div>
    </div>
    <div class="rb-question-counter">❓ Q<span id="rbQNum">1</span></div>
  </div>

  <!-- RACE TRACK -->
  <div class="rb-track-section">
    <div class="rb-race-world" id="rbRaceWorld">
      <canvas id="rbRaceCanvas"></canvas>
      <div class="rb-overtake-toast" id="rbOvertakeToast"></div>
      <div class="rb-milestone-popup hidden" id="rbMilestonePopup"></div>
      <div class="rb-lights-overlay" id="rbLightsOverlay">
        <div class="rb-lights-panel">
          <div class="rb-lights-title" id="rbLightsTitle">GET READY! ⏰</div>
          <div class="rb-lights-row" id="rbLightsRow">
            <div class="rb-light" id="rbL1"></div>
            <div class="rb-light" id="rbL2"></div>
            <div class="rb-light" id="rbL3"></div>
            <div class="rb-light" id="rbL4"></div>
            <div class="rb-light" id="rbL5"></div>
          </div>
          <div class="rb-lights-msg" id="rbLightsMsg"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- QUESTION CARDS — full height, no dead space -->
  <div class="rb-cards-section">

    <!-- P1 Card -->
    <div class="rb-player-card rb-p1-card" id="rbP1Card">
      <!-- Header strip -->
      <div class="rb-player-header">
        <div class="rb-player-badge rb-p1-badge">P1</div>
        <span class="rb-player-label">🏎️ Player 1</span>
        <div class="rb-player-stats">
          <div class="rb-stat-chip rb-score-chip">⭐ <span id="rbScoreP1">0</span></div>
          <div class="rb-stat-chip rb-combo-chip rb-p1-combo" id="rbComboChipP1" style="display:none">🔥 <span id="rbComboP1">0</span>x</div>
        </div>
      </div>
      <!-- Progress bar flush -->
      <div class="rb-card-progress">
        <div class="rb-card-progress-fill rb-card-p1-fill" id="rbCardFillP1"></div>
        <span class="rb-card-progress-label" id="rbCardPctP1">0%</span>
      </div>
      <!-- Clock -->
      <div class="rb-clock-area" id="rbClockAreaP1"></div>
      <!-- Question -->
      <div class="rb-question-text" id="rbQuestionTextP1"></div>
      <!-- Answers — fills remaining space -->
      <div class="rb-answer-area" id="rbAnswerAreaP1"></div>
      <!-- Feedback -->
      <div class="rb-feedback-flash rb-p1-flash hidden" id="rbFlashP1"></div>
    </div>

    <!-- VS Divider -->
    <div class="rb-vs-divider"><div class="rb-vs-inner">VS</div></div>

    <!-- P2 Card -->
    <div class="rb-player-card rb-p2-card" id="rbP2Card">
      <div class="rb-player-header">
        <div class="rb-player-badge rb-p2-badge">P2</div>
        <span class="rb-player-label">🚙 Player 2</span>
        <div class="rb-player-stats">
          <div class="rb-stat-chip rb-score-chip">⭐ <span id="rbScoreP2">0</span></div>
          <div class="rb-stat-chip rb-combo-chip rb-p2-combo" id="rbComboChipP2" style="display:none">🔥 <span id="rbComboP2">0</span>x</div>
        </div>
      </div>
      <div class="rb-card-progress">
        <div class="rb-card-progress-fill rb-card-p2-fill" id="rbCardFillP2"></div>
        <span class="rb-card-progress-label" id="rbCardPctP2">0%</span>
      </div>
      <div class="rb-clock-area" id="rbClockAreaP2"></div>
      <div class="rb-question-text" id="rbQuestionTextP2"></div>
      <div class="rb-answer-area" id="rbAnswerAreaP2"></div>
      <div class="rb-feedback-flash rb-p2-flash hidden" id="rbFlashP2"></div>
    </div>

  </div>`;
}

/* ────────────────────────────────────────────────────────────
   SECTION 9 — CANVAS INIT
──────────────────────────────────────────────────────────── */
function _rbv3InitCanvas() {
  _canvas = document.getElementById('rbRaceCanvas');
  if (!_canvas) return;
  _ctx = _canvas.getContext('2d', { alpha: false });
  _buildWorld();
  _resizeCanvas();
  window.addEventListener('resize', _resizeCanvas, { passive: true });
  _canvasActive = true;
  _prevTs = performance.now();
  _rafId  = requestAnimationFrame(_canvasLoop);
}

function _rbv3ResetHUD() {
  ['1','2'].forEach(n => {
    const dp = document.getElementById('rbDpP' + n);
    if (dp) dp.style.width = '0%';
    const dpPct = document.getElementById('rbDpPct' + (n==='1'?'P1':'P2'));
    if (dpPct) dpPct.textContent = '0%';
    const dot = document.getElementById('rbMsDotP' + (n==='1'?'1':'2'));
    if (dot) dot.style.left = '0%';
    const fill = document.getElementById('rbCardFillP' + n);
    if (fill) fill.style.width = '0%';
    const pct = document.getElementById('rbCardPctP' + n);
    if (pct) pct.textContent = '0%';
    const sc = document.getElementById('rbScoreP' + n);
    if (sc) sc.textContent = '0';
    const cc = document.getElementById('rbComboChipP' + (n==='1'?'1':'2'));
    if (cc) cc.style.display = 'none';
    const qn = document.getElementById('rbQNum');
    if (qn) qn.textContent = '1';
  });
}

/* ────────────────────────────────────────────────────────────
   SECTION 10 — F1 LIGHTS SEQUENCE
──────────────────────────────────────────────────────────── */
function rbRunLightsSequence() {
  const lights = [1,2,3,4,5].map(i => document.getElementById('rbL' + i));
  const msgEl  = document.getElementById('rbLightsMsg');
  const titleEl= document.getElementById('rbLightsTitle');

  const on = (el, col) => { if (el) el.className = 'rb-light ' + col; };

  const steps = [
    () => { on(lights[0],'red'); on(lights[1],'red'); AudioManager.play('countdown'); if(msgEl) msgEl.innerHTML=''; },
    () => { on(lights[2],'red'); on(lights[3],'red'); AudioManager.play('countdown'); },
    () => { on(lights[4],'red'); AudioManager.play('countdown'); },
    () => {
      lights.forEach(l => { if(l) l.className = 'rb-light'; });
      if (msgEl)   msgEl.innerHTML = '<span class="rb-go-text">GO! 🏁</span>';
      if (titleEl) titleEl.style.display = 'none';
      AudioManager.play('right', 0.85);
    },
    () => {
      const lo = document.getElementById('rbLightsOverlay');
      if (lo) { lo.classList.add('fade-out'); setTimeout(() => { if(lo) lo.style.display = 'none'; }, 600); }
      rbBeginRace();
    }
  ];

  [0, 750, 1500, 2500, 3450].forEach((ms, i) => {
    const t = setTimeout(() => { if (RBS3) steps[i](); }, ms);
    if (RBS3) RBS3.lightsTimer = t;
  });
}

/* ────────────────────────────────────────────────────────────
   SECTION 11 — BEGIN RACE
──────────────────────────────────────────────────────────── */
function rbBeginRace() {
  if (!RBS3) return;
  RBS3.active     = true;
  RBS3.raceStarted= true;
  rbLockBoth(false);
  /* Engine sound */
  AudioManager.startLoop('engine', 0.15, 0.85);
  /* Landing page BGM — very low volume so engine stays dominant */
  try {
    const ls = document.getElementById('sound-landing');
    if (ls) {
      ls.volume = 0.07;   // much quieter than engine (0.15)
      ls.loop   = true;
      ls.currentTime = ls.currentTime || 0;
      ls.play().catch(() => {});
    }
  } catch(e) {}
}

/* ────────────────────────────────────────────────────────────
   SECTION 12 — QUESTION RENDERING
──────────────────────────────────────────────────────────── */
function rbRenderQuestion(player) {
  const q = _rbNextQ(player);
  if (!q) return;
  const S = player === 'p1' ? 'P1' : 'P2';

  const clockArea  = document.getElementById('rbClockArea'  + S);
  const qText      = document.getElementById('rbQuestionText'+ S);
  const answerArea = document.getElementById('rbAnswerArea'  + S);
  if (!clockArea || !qText || !answerArea) return;

  clockArea.innerHTML = '';
  qText.innerHTML     = '';
  answerArea.innerHTML= '';
  if (RBS3) RBS3.dragAngle[player] = { hour:0, minute:0 };

  /* Type badge */
  const badge = document.createElement('div');
  badge.className = 'question-type-badge ' + getTypeBadgeClass(q.type);
  badge.textContent = getTypeLabel(q.type);
  clockArea.appendChild(badge);

  /* Analog clock */
  if (q.clockData && (q.type === 'mc' || q.type === 'arrange') && !q.isDigitalChoice) {
    clockArea.appendChild(buildAnalogClock(q.clockData, _rbClockSz()));
  }

  qText.textContent = q.question;

  if      (q.type === 'mc' || q.type === 'digital') rbBuildMC(q, answerArea, player);
  else if (q.type === 'mc_clock')                    rbBuildMCClock(q, answerArea, player);
  else if (q.type === 'arrange')                     rbBuildArrange(q, answerArea, player);
  else if (q.type === 'drag')                        rbBuildDrag(q, answerArea, player);
  else                                               rbBuildMC(q, answerArea, player);

  if (RBS3) RBS3.locked[player] = !RBS3.raceStarted;

  /* Slide-in animation */
  const card = document.getElementById('rbP' + (player === 'p1' ? '1' : '2') + 'Card');
  if (card) {
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = 'rbCardSlide .28s cubic-bezier(.25,.46,.45,.94)';
  }
}

function _rbNextQ(player) {
  if (!RBS3) return null;
  if (!RBS3.bank[player] || !RBS3.bank[player].length) {
    RBS3.bank[player] = shuffle(buildQuestionBank());
    RBS3.qIdx[player] = 0;
  }
  const q = RBS3.bank[player][RBS3.qIdx[player] % RBS3.bank[player].length];
  RBS3.qIdx[player]++;
  return q;
}

function _rbClockSz() {
  const vw = window.innerWidth;
  return vw < 520 ? 76 : vw < 900 ? 96 : 110;
}

/* ────────────────────────────────────────────────────────────
   SECTION 13 — ANSWER BUILDERS
──────────────────────────────────────────────────────────── */
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
    btn.style.padding = '4px';
    const mini = buildAnalogClock(opt, _rbClockSz() * 0.56);
    mini.style.margin = '0 auto 3px';
    btn.appendChild(mini);
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:10px;font-weight:700;color:rgba(255,255,255,.8);';
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

  const bLbl = document.createElement('div');
  bLbl.style.cssText = 'font-size:10px;font-weight:700;color:rgba(255,255,255,.5);margin-bottom:3px;font-family:"Baloo 2",cursive;';
  bLbl.textContent = 'Words:';
  wrap.appendChild(bLbl);

  const bank    = document.createElement('div'); bank.className = 'rb-word-bank'; bank.id = 'rbWordBank_' + player;
  const aLbl    = document.createElement('div');
  aLbl.style.cssText = 'font-size:10px;font-weight:700;color:rgba(255,255,255,.5);margin:6px 0 3px;font-family:"Baloo 2",cursive;';
  aLbl.textContent = 'Your answer:';
  const ansArea = document.createElement('div'); ansArea.className = 'rb-arrange-answer'; ansArea.id = 'rbArrangeAns_' + player;

  const placed = [];
  q.words.forEach(word => bank.appendChild(_rbWordChip(word, bank, ansArea, false, placed, q.words.length, player, q.answer)));
  wrap.appendChild(bank); wrap.appendChild(aLbl); wrap.appendChild(ansArea);
  container.appendChild(wrap);
}

function _rbWordChip(word, bank, ansArea, inAnswer, placed, total, player, correct) {
  const chip = document.createElement('div');
  chip.className = 'rb-word-chip' + (inAnswer ? ' placed' : '');
  chip.textContent = word;
  chip.addEventListener('click', () => {
    if (RBS3 && RBS3.locked[player]) return;
    chip.remove();
    if (!inAnswer) {
      placed.push(word);
      ansArea.appendChild(_rbWordChip(word, bank, ansArea, true, placed, total, player, correct));
    } else {
      const i = placed.indexOf(word);
      if (i > -1) placed.splice(i, 1);
      bank.appendChild(_rbWordChip(word, bank, ansArea, false, placed, total, player, correct));
    }
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
  hint.style.cssText = 'font-size:10px;color:rgba(255,255,255,.5);font-weight:600;text-align:center;font-family:"Baloo 2",cursive;';
  hint.textContent = '🖱 Click to set hands, then submit';
  wrap.appendChild(hint);

  const clock = document.createElement('div');
  clock.className = 'rb-drag-clock';

  const face = document.createElement('div');
  face.className = 'clock-face';

  for (let i = 0; i < 12; i++) {
    const tick = document.createElement('div');
    tick.className = 'clock-tick';
    tick.style.transform = `translateX(-50%) rotate(${i * 30}deg)`;
    tick.style.top = '4px';
    face.appendChild(tick);
  }
  [12,1,2,3,4,5,6,7,8,9,10,11].forEach((n, i) => {
    const a = (i * 30 - 90) * Math.PI / 180;
    const num = document.createElement('span');
    num.className = 'num-label';
    num.textContent = n;
    num.style.left = (50 + 36 * Math.cos(a)) + '%';
    num.style.top  = (50 + 36 * Math.sin(a)) + '%';
    num.style.transform = 'translate(-50%,-50%)';
    face.appendChild(num);
  });

  if (RBS3) RBS3.dragAngle[player] = { hour:0, minute:0 };
  let dragMode = 'hour';
  const hHand = document.createElement('div'); hHand.className = 'drag-h-hand';
  const mHand = document.createElement('div'); mHand.className = 'drag-m-hand';
  const ctr   = document.createElement('div'); ctr.className   = 'drag-center';
  hHand.style.transform = 'translateX(-50%) rotate(0deg)';
  mHand.style.transform = 'translateX(-50%) rotate(0deg)';
  face.appendChild(hHand); face.appendChild(mHand); face.appendChild(ctr);
  clock.appendChild(face);

  const display = document.createElement('div');
  display.className = 'rb-drag-time-show';
  display.textContent = '12:00';

  const modeRow = document.createElement('div');
  modeRow.className = 'rb-drag-btn-row';
  const hBtn = document.createElement('button'); hBtn.className = 'rb-drag-mode-btn selected'; hBtn.textContent = '🕐 Hour';
  const mBtn = document.createElement('button'); mBtn.className = 'rb-drag-mode-btn'; mBtn.textContent = '⏱ Min';
  hBtn.onclick = () => { dragMode='hour';   hBtn.classList.add('selected'); mBtn.classList.remove('selected'); };
  mBtn.onclick = () => { dragMode='minute'; mBtn.classList.add('selected'); hBtn.classList.remove('selected'); };
  modeRow.appendChild(hBtn); modeRow.appendChild(mBtn);

  const subGrid = document.createElement('div');
  subGrid.className = 'rb-answer-area';
  subGrid.style.gridTemplateColumns = '1fr';
  const submitBtn = document.createElement('button');
  submitBtn.className = 'rb-option-btn';
  submitBtn.textContent = '✓ Submit Time';
  submitBtn.onclick = () => {
    if (RBS3 && RBS3.locked[player]) return;
    const h = Math.round(RBS3.dragAngle[player].hour / 30) % 12 || 12;
    const m = Math.round(RBS3.dragAngle[player].minute / 6) % 60;
    rbSubmitAnswer(player, { h, m }, q.answer, 'drag', null);
  };
  subGrid.appendChild(submitBtn);

  clock.addEventListener('click', e => {
    if (RBS3 && RBS3.locked[player]) return;
    const rect = clock.getBoundingClientRect();
    let angle = Math.atan2(e.clientY - rect.top - rect.height/2, e.clientX - rect.left - rect.width/2) * (180/Math.PI) + 90;
    if (angle < 0) angle += 360;
    if (RBS3) {
      if (dragMode === 'hour') { RBS3.dragAngle[player].hour = angle; hHand.style.transform = `translateX(-50%) rotate(${angle}deg)`; }
      else { RBS3.dragAngle[player].minute = angle; mHand.style.transform = `translateX(-50%) rotate(${angle}deg)`; }
      const h = Math.round(RBS3.dragAngle[player].hour / 30) % 12 || 12;
      const m = Math.round(RBS3.dragAngle[player].minute / 6) % 60;
      display.textContent = `${h}:${m.toString().padStart(2,'0')}`;
    }
  });

  wrap.appendChild(clock); wrap.appendChild(display); wrap.appendChild(modeRow); wrap.appendChild(subGrid);
  container.appendChild(wrap);
}

/* ────────────────────────────────────────────────────────────
   SECTION 14 — ANSWER SUBMISSION
──────────────────────────────────────────────────────────── */
function rbSubmitAnswer(player, given, correct, type, optGrid) {
  if (!RBS3 || !RBS3.active || RBS3.locked[player]) return;
  RBS3.locked[player] = true;

  let ok = false;
  if (type === 'mc' || type === 'digital')
    ok = String(given).trim() === String(correct).trim();
  else if (type === 'arrange')
    ok = String(given).trim().toLowerCase() === String(correct).trim().toLowerCase();
  else if (type === 'drag')
    ok = Math.abs((given.h % 12) - ((correct.hour12 || 12) % 12)) <= 1
      && Math.abs(given.m - (correct.minute || 0)) <= 3;

  /* Button feedback */
  if (optGrid) {
    optGrid.querySelectorAll('.rb-option-btn').forEach(btn => {
      if (String(btn.dataset.value || btn.textContent).trim() === String(correct).trim()) btn.classList.add('rb-correct');
      else if (!ok && (btn.dataset.value || btn.textContent) === String(given))           btn.classList.add('rb-wrong');
      btn.disabled = true;
    });
  }

  /* Card glow */
  const card = document.getElementById('rbP' + (player === 'p1' ? '1' : '2') + 'Card');
  if (card) {
    card.classList.remove('rb-glow-correct','rb-glow-wrong');
    void card.offsetWidth;
    card.classList.add(ok ? 'rb-glow-correct' : 'rb-glow-wrong');
    setTimeout(() => card.classList.remove('rb-glow-correct','rb-glow-wrong'), 500);
  }

  _rbShowFlash(player, ok);

  if (ok) {
    AudioManager.play('right', 0.6);
    RBS3.score[player]   += RBV3.SCORE_RIGHT;
    RBS3.correct[player] += 1;
    RBS3.combo[player]   += 1;
    if (RBS3.combo[player] > RBS3.bestCombo[player]) RBS3.bestCombo[player] = RBS3.combo[player];

    let burst = RBV3.BOOST_RIGHT;
    let base  = burst * RBV3.BASE_GAIN;

    if (RBS3.combo[player] >= RBV3.TURBO) {
      burst += RBV3.BOOST_TURBO; base  += RBV3.BOOST_TURBO * RBV3.BASE_GAIN;
      _rbTriggerTurbo(player); RBS3.score[player] += RBV3.SCORE_COMBO * 2; RBS3.turboCount[player]++;
    } else if (RBS3.combo[player] >= RBV3.COMBO3) {
      burst += RBV3.BOOST_COMBO3; base += RBV3.BOOST_COMBO3 * RBV3.BASE_GAIN;
      _vis[player].nitroTimer = 0.5;
      RBS3.score[player] += RBV3.SCORE_COMBO;
    }

    RBS3.speedBase[player]  = Math.min(RBS3.speedBase[player] + base, 450);
    RBS3.speedBurst[player] = Math.min(RBS3.speedBurst[player] + burst, 700);

    _vis[player].burstTimer = 0.85;
    _vis[player].nitroTimer = Math.max(_vis[player].nitroTimer, 0.7);
    _spawnDust(player);
    _rbShowComboBadge(player);

    RBS3.xpEarned[player]    += 15;
    RBS3.coinsEarned[player] += 5 + RBS3.combo[player];

    if (RBS3.carPos[player] >= RBV3.FINISH_POS) { setTimeout(() => rbEndRace(player), 320); return; }
  } else {
    AudioManager.play('wrong', 0.55);
    RBS3.combo[player] = 0;
    _hideComboBadge(player);
  }

  _rbUpdateHUD();
  setTimeout(() => {
    if (!RBS3 || !RBS3.active) return;
    RBS3.locked[player] = false;
    rbRenderQuestion(player);
  }, ok ? 460 : 600);
}

/* ────────────────────────────────────────────────────────────
   SECTION 15 — VFX HELPERS
──────────────────────────────────────────────────────────── */
function _rbShowFlash(player, ok) {
  const el = document.getElementById(player === 'p1' ? 'rbFlashP1' : 'rbFlashP2');
  if (!el) return;
  el.textContent = ok ? '✅' : '❌';
  el.classList.remove('hidden');
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'rbFeedbackFade .85s ease forwards';
  setTimeout(() => el.classList.add('hidden'), 860);
}

function _rbTriggerTurbo(player) {
  _vis[player].burstTimer = 0.9;
  _vis[player].nitroTimer = 0.8;
  _spawnDust(player);

  const flash = document.createElement('div');
  flash.className = 'rb-turbo-flash ' + (player === 'p1' ? 'p1-flash' : 'p2-flash');
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 400);

  if (_canvas) {
    const DPR   = Math.min(window.devicePixelRatio || 1, 2);
    const H_css = _canvas.height / DPR;
    const roadTop = H_css * 0.56, roadBot = H_css * 0.84, roadH = roadBot - roadTop;
    const laneY   = roadTop + roadH * (player === 'p1' ? 0.25 : 0.74);
    const sx      = _vis[player].x - _camX;
    const r2 = _prng((sx * 7 + laneY) | 0);
    for (let i = 0; i < 16; i++)
      _spawnSparkle(sx + (r2()-.5)*65, laneY + (r2()-.5)*18,
        player === 'p1' ? '#FF6B81' : '#54A0FF');
  }
  AudioManager.play('boost', 0.52);
}

function _rbShowComboBadge(player) {
  const combo = RBS3.combo[player];
  if (combo < RBV3.COMBO3) return;
  const S = player === 'p1' ? 'P1' : 'P2';
  const chip = document.getElementById('rbComboChip' + S);
  const cVal = document.getElementById('rbCombo' + S);
  if (chip && cVal) { cVal.textContent = combo; chip.style.display = 'inline-flex'; }

  if (combo >= RBV3.TURBO) {
    const cardId = 'rbP' + (player === 'p1' ? '1' : '2') + 'Card';
    const card   = document.getElementById(cardId);
    if (card) {
      const old = card.querySelector('.rb-combo-toast');
      if (old) old.remove();
      const b = document.createElement('div');
      b.className = 'rb-combo-toast';
      b.textContent = combo >= RBV3.TURBO ? `🚀 TURBO x${combo}!` : `🔥 COMBO x${combo}`;
      card.appendChild(b);
      setTimeout(() => b.remove(), 1600);
    }
  }
}

function _hideComboBadge(player) {
  const S = player === 'p1' ? 'P1' : 'P2';
  const chip = document.getElementById('rbComboChip' + S);
  if (chip) chip.style.display = 'none';
}

/* ────────────────────────────────────────────────────────────
   SECTION 16 — HUD UPDATE
──────────────────────────────────────────────────────────── */
function _rbUpdateHUD() {
  if (!RBS3) return;
  ['p1','p2'].forEach(p => {
    const N = p === 'p1' ? '1' : '2';
    const S = p === 'p1' ? 'P1' : 'P2';
    const pct = RBS3.progress[p];
    const dp    = document.getElementById('rbDpP' + N);     if (dp)    dp.style.width = pct + '%';
    const dpPct = document.getElementById('rbDpPct' + S);   if (dpPct) dpPct.textContent = Math.round(pct) + '%';
    const dot   = document.getElementById('rbMsDot' + S);   if (dot)   dot.style.left = Math.min(pct, 96) + '%';
    const sc    = document.getElementById('rbScore' + S);   if (sc)    sc.textContent = RBS3.score[p];
    const cf    = document.getElementById('rbCardFill' + S); if (cf)   cf.style.width = pct + '%';
    const cl    = document.getElementById('rbCardPct' + S);  if (cl)   cl.textContent = Math.round(pct) + '%';
    const qn    = document.getElementById('rbQNum');         if (qn)   qn.textContent = Math.max(RBS3.qIdx.p1, RBS3.qIdx.p2);
  });
}

/* ────────────────────────────────────────────────────────────
   SECTION 17 — END RACE & RESULT
──────────────────────────────────────────────────────────── */
function rbEndRace(winnerPlayer) {
  if (!RBS3 || !RBS3.active) return;
  RBS3.active = false;
  RBS3.winner = winnerPlayer;
  _canvasActive = false;
  window.removeEventListener('resize', _resizeCanvas);
  AudioManager.stopAllRace();
  rbLockBoth(true);
  AudioManager.play('winner', 0.8);
  launchConfetti();
  _cpTriggered.p1 = [false,false,false];
  _cpTriggered.p2 = [false,false,false];
  setTimeout(() => rbShowResult(winnerPlayer), 1800);
}

function rbShowResult(winnerPlayer) {
  showPage('racing-result');
  const isP1 = winnerPlayer === 'p1';
  const el   = id => document.getElementById(id);

  const titleEl = el('rbWinnerTitle');
  if (titleEl) titleEl.textContent = (isP1 ? '🏎️ Player 1' : '🚙 Player 2') + ' Wins! 🏆';

  const trophy = el('rbResultTrophy');
  if (trophy) { trophy.textContent = '🏆'; trophy.style.animation = 'none'; void trophy.offsetWidth; trophy.style.animation = 'trophyBounce .8s cubic-bezier(.175,.885,.32,1.275) both'; }

  const carD = el('rbWinnerCarDisplay');
  if (carD) {
    carD.innerHTML = `<div class="rb-win-car" style="width:clamp(120px,18vw,200px);margin:0 auto;filter:drop-shadow(0 8px 24px ${isP1?'rgba(255,71,87,.5)':'rgba(30,144,255,.5)'});">
<svg viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="60" cy="62" rx="44" ry="4" fill="rgba(0,0,0,.2)"/>
<circle cx="28" cy="52" r="11" fill="#111"/><circle cx="28" cy="52" r="7" fill="#333"/><circle cx="28" cy="52" r="3" fill="#777"/>
<circle cx="92" cy="52" r="11" fill="#111"/><circle cx="92" cy="52" r="7" fill="#333"/><circle cx="92" cy="52" r="3" fill="#777"/>
<rect x="8" y="28" width="104" height="24" rx="11" fill="${isP1?'#FF4757':'#1E90FF'}"/>
<rect x="4" y="32" width="112" height="16" rx="7" fill="${isP1?'#C0392B':'#1565C0'}"/>
<rect x="22" y="10" width="72" height="22" rx="8" fill="${isP1?'#FF4757':'#1E90FF'}"/>
<rect x="26" y="12" width="28" height="17" rx="4" fill="#B3E5FC" opacity=".92"/>
<rect x="62" y="12" width="28" height="17" rx="4" fill="#B3E5FC" opacity=".88"/>
<ellipse cx="113" cy="38" rx="5" ry="4" fill="${isP1?'#FFE66D':'#B3E5FC'}" opacity=".9"/>
<rect x="46" y="35" width="28" height="11" rx="5" fill="${isP1?'#FF4757':'#1E90FF'}" stroke="white" stroke-width="1.5"/>
<text x="60" y="43" text-anchor="middle" fill="white" font-size="7" font-weight="900" font-family="Fredoka One,cursive">${isP1?'P1':'P2'}</text>
</svg></div>`;
  }

  el('rbResFinalScoreP1').textContent = RBS3.score.p1;
  el('rbResFinalScoreP2').textContent = RBS3.score.p2;
  el('rbResCorrectP1').textContent    = RBS3.correct.p1;
  el('rbResCorrectP2').textContent    = RBS3.correct.p2;
  el('rbResBestComboP1').textContent  = RBS3.bestCombo.p1;
  el('rbResBestComboP2').textContent  = RBS3.bestCombo.p2;

  /* Highlight winner card */
  const p1c = document.querySelector('.rb-res-p1');
  const p2c = document.querySelector('.rb-res-p2');
  if (p1c) { p1c.style.transform = isP1 ? 'scale(1.04)' : ''; p1c.style.boxShadow = isP1 ? '0 0 0 3px rgba(255,71,87,.5), 0 12px 32px rgba(255,71,87,.2)' : ''; }
  if (p2c) { p2c.style.transform = isP1 ? '' : 'scale(1.04)'; p2c.style.boxShadow = isP1 ? '' : '0 0 0 3px rgba(30,144,255,.5), 0 12px 32px rgba(30,144,255,.2)'; }

  /* Rewards */
  if (carD) {
    const rdiv = document.createElement('div');
    rdiv.style.cssText = 'display:flex;justify-content:center;gap:10px;margin-top:14px;flex-wrap:wrap;';
    ['p1','p2'].forEach(p => {
      const b = document.createElement('div');
      b.style.cssText = 'background:rgba(255,215,0,.1);border:1.5px solid rgba(255,215,0,.25);border-radius:12px;padding:8px 14px;text-align:center;font-family:"Fredoka One",cursive;font-size:13px;color:#FFD700;animation:titleReveal .5s ease .3s both;';
      b.innerHTML = `${p==='p1'?'🏎️':'🚙'}<br>💰 ${RBS3.coinsEarned[p]} Coins<br>⭐ ${RBS3.xpEarned[p]} XP${RBS3.bestCombo[p]>=5?'<br>🏆 Combo Master!':''}`;
      rdiv.appendChild(b);
    });
    carD.appendChild(rdiv);
  }
  launchConfetti();
}

/* ────────────────────────────────────────────────────────────
   SECTION 18 — UTILITIES
──────────────────────────────────────────────────────────── */
function rbLockBoth(locked) {
  if (!RBS3) return;
  RBS3.locked.p1 = locked; RBS3.locked.p2 = locked;
  ['P1','P2'].forEach(s => {
    const a = document.getElementById('rbAnswerArea' + s);
    if (a) a.querySelectorAll('button').forEach(b => b.disabled = locked);
  });
}

function confirmRacingExit() {
  if (!confirm('Exit Racing Battle? Race progress will be lost.')) return;
  _cleanupRace();
  showPage('quiz-menu');
  AudioManager.play('click');
  const ls = document.getElementById('sound-landing');
  if (ls) { try { ls.volume=0.3; ls.currentTime=0; ls.loop=true; ls.play().catch(()=>{}); } catch(e){} }
}

function _cleanupRace() {
  if (RBS3) { RBS3.active = false; clearTimeout(RBS3.lightsTimer); }
  _canvasActive = false;
  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  window.removeEventListener('resize', _resizeCanvas);
  AudioManager.stopAllRace();
  _cpTriggered.p1 = [false,false,false];
  _cpTriggered.p2 = [false,false,false];
}

function _rrect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  ctx.closePath();
}

/* ────────────────────────────────────────────────────────────
   SECTION 19 — INJECT KEYFRAMES & STYLES
──────────────────────────────────────────────────────────── */
(function _injectStyles() {
  if (document.getElementById('rbv3-kf')) return;
  const s = document.createElement('style');
  s.id = 'rbv3-kf';
  s.textContent = `
    /* Card slide-in */
    @keyframes rbCardSlide {
      from { opacity:.4; transform:translateY(10px) scale(.97); }
      to   { opacity:1;  transform:translateY(0)    scale(1);   }
    }
    /* Feedback flash */
    @keyframes rbFeedbackFade {
      0%   { opacity:1; transform:translate(-50%,-50%) scale(1.3); }
      40%  { opacity:1; transform:translate(-50%,-50%) scale(1.4); }
      100% { opacity:0; transform:translate(-50%,-65%) scale(.95); }
    }
    /* Combo pop toast */
    .rb-combo-toast {
      position:absolute; top:38%; left:50%;
      transform:translate(-50%,-50%) scale(0);
      background:linear-gradient(135deg,#FF9F43,#FF6B6B);
      color:white; font-family:'Fredoka One',cursive;
      font-size:clamp(13px,1.7vw,21px); padding:8px 22px;
      border-radius:999px; z-index:20; pointer-events:none;
      box-shadow:0 8px 24px rgba(255,159,67,.5);
      animation:rbComboPop .38s cubic-bezier(.175,.885,.32,1.275) forwards,
                rbComboFade 1.1s .38s ease forwards;
    }
    @keyframes rbComboPop  { to { transform:translate(-50%,-50%) scale(1); } }
    @keyframes rbComboFade { to { opacity:0; transform:translate(-50%,-62%) scale(.88); } }
    /* Trophy */
    @keyframes trophyBounce {
      from { transform:scale(0) rotate(-18deg); opacity:0; }
      60%  { transform:scale(1.22) rotate(4deg); opacity:1; }
      to   { transform:scale(1) rotate(0deg); opacity:1; }
    }
    /* Title reveal */
    @keyframes titleReveal {
      from { opacity:0; transform:translateY(14px); }
      to   { opacity:1; transform:translateY(0); }
    }
    /* Win car drive */
    .rb-win-car {
      animation:rbWinCarDrive .75s cubic-bezier(.175,.885,.32,1.275) both;
    }
    @keyframes rbWinCarDrive {
      from { transform:translateX(-70px) rotate(-4deg); opacity:0; }
      60%  { transform:translateX(6px)   rotate(2deg);  opacity:1; }
      to   { transform:translateX(0)     rotate(0deg);  opacity:1; }
    }
    /* Turbo flash */
    .rb-turbo-flash {
      position:fixed; inset:0; pointer-events:none; z-index:9990;
      animation:rbTurboFlash .38s ease forwards;
    }
    .rb-turbo-flash.p1-flash { background:radial-gradient(ellipse at center,rgba(255,71,87,.22) 0%,transparent 68%); }
    .rb-turbo-flash.p2-flash { background:radial-gradient(ellipse at center,rgba(30,144,255,.22) 0%,transparent 68%); }
    @keyframes rbTurboFlash { 0%{opacity:1;} 100%{opacity:0;} }
    /* will-change hints for GPU layers */
    .rb-dp-fill, .rb-card-progress-fill, .rb-ms-dot { will-change:width,left; }
    .rb-combo-chip { will-change:transform; }
    #rbRaceCanvas  { will-change:transform; }
  `;
  document.head.appendChild(s);
})();

console.log('🏁 TickTock Racing Battle v3.1 — Smooth Engine loaded');

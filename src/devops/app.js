(function () {
  const CONTENT_FILES = ['content/Part-1-syllabus.json', 'content/Part-2-syllabus-Act-3.json'];
  const STORAGE_KEY = 'devops-lab-progress';

  function getProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { completedLessons: [], quizScores: {} };
    } catch (_) {
      return { completedLessons: [], quizScores: {} };
    }
  }
  function setProgress(p) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }
  function markLessonDone(lessonId) {
    const p = getProgress();
    if (!p.completedLessons.includes(lessonId)) {
      p.completedLessons.push(lessonId);
      setProgress(p);
    }
  }
  function totalLessons(syllabi) {
    let n = 0;
    syllabi.forEach(s => s.modules.forEach(m => n += m.lessons.length));
    return n;
  }
  function completedCount(syllabi, progress) {
    let n = 0;
    syllabi.forEach(s => s.modules.forEach(m => m.lessons.forEach(l => {
      if (progress.completedLessons.includes(l.id)) n++;
    })));
    return n;
  }

  let syllabi = [];
  let currentPart = 0;
  let currentModule = 0;
  let currentLesson = 0;
  let mode = 'learn';

  const progressWrap = document.getElementById('progress-wrap');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const moduleList = document.getElementById('module-list');
  const viewLearn = document.getElementById('view-learn');
  const viewQuiz = document.getElementById('view-quiz');
  const lessonTitle = document.getElementById('lesson-title');
  const lessonContent = document.getElementById('lesson-content');
  const lessonNav = document.getElementById('lesson-nav');
  const quizContainer = document.getElementById('quiz-container');
  const resultsContainer = document.getElementById('results-container');
  const resultsScore = document.getElementById('results-score');
  const resultsWeak = document.getElementById('results-weak');
  const btnLearn = document.getElementById('btn-mode-learn');
  const btnQuiz = document.getElementById('btn-mode-quiz');
  const btnReset = document.getElementById('btn-reset');

  function renderProgress() {
    const progress = getProgress();
    const total = totalLessons(syllabi);
    const done = total ? completedCount(syllabi, progress) : 0;
    const pct = total ? Math.round((done / total) * 100) : 0;
    progressBar.style.width = pct + '%';
    progressText.textContent = done + ' / ' + total + ' lessons';
  }

  function buildModuleList() {
    moduleList.innerHTML = '';
    syllabi.forEach((part, pi) => {
      part.modules.forEach((mod, mi) => {
        const progress = getProgress();
        const total = mod.lessons.length;
        const done = mod.lessons.filter(l => progress.completedLessons.includes(l.id)).length;
        const allDone = total && done === total;
        const li = document.createElement('li');
        li.innerHTML = '<a class="module-card' + (allDone ? ' done' : '') + '" href="#learn/' + pi + '/' + mi + '/0" data-p="' + pi + '" data-m="' + mi + '">' +
          '<span class="ring"></span><span class="title">' + mod.title + '</span><span class="meta">' + done + '/' + total + ' lessons</span></a>';
        moduleList.appendChild(li);
      });
    });
    renderProgress();
  }

  function showLesson(pi, mi, li) {
    currentPart = pi;
    currentModule = mi;
    currentLesson = li;
    const mod = syllabi[pi].modules[mi];
    const lesson = mod.lessons[li];
    if (!lesson) return;
    markLessonDone(lesson.id);
    lessonTitle.textContent = lesson.title;
    lessonContent.innerHTML = '<p>' + lesson.content.replace(/\n/g, '</p><p>') + '</p>';
    const prev = li > 0 ? '<a href="#learn/' + pi + '/' + mi + '/' + (li - 1) + '">← Previous</a>' : '';
    const next = li < mod.lessons.length - 1 ? '<a href="#learn/' + pi + '/' + mi + '/' + (li + 1) + '">Next →</a>' : '';
    lessonNav.innerHTML = (prev ? prev + ' | ' : '') + (next || '');
    viewLearn.classList.add('active');
    viewQuiz.classList.remove('active');
    buildModuleList();
  }

  function showQuiz() {
    quizContainer.style.display = 'block';
    viewQuiz.classList.add('active');
    viewLearn.classList.remove('active');
    const allQuestions = [];
    syllabi.forEach(p => p.quiz.forEach((q, i) => allQuestions.push({ ...q, part: p.title })));
    quizContainer.innerHTML = '';
    allQuestions.forEach((q, idx) => {
      const div = document.createElement('div');
      div.className = 'quiz-q';
      div.innerHTML = '<h3>' + (idx + 1) + '. ' + q.question + '</h3><ul id="q' + idx + '"></ul>';
      quizContainer.appendChild(div);
      const ul = document.getElementById('q' + idx);
      q.options.forEach((opt, oi) => {
        const li = document.createElement('li');
        li.innerHTML = '<label><input type="radio" name="q' + idx + '" value="' + oi + '"> ' + opt + '</label>';
        ul.appendChild(li);
      });
    });
    resultsContainer.style.display = 'none';
    buildModuleList();
  }

  function submitQuiz() {
    const allQuestions = [];
    syllabi.forEach(p => p.quiz.forEach(q => allQuestions.push(q)));
    let correct = 0;
    const wrong = [];
    allQuestions.forEach((q, idx) => {
      const sel = document.querySelector('input[name="q' + idx + '"]:checked');
      const val = sel ? parseInt(sel.value, 10) : -1;
      if (val === q.correct) correct++; else wrong.push(q.question);
    });
    const pct = allQuestions.length ? Math.round((correct / allQuestions.length) * 100) : 0;
    const progress = getProgress();
    progress.quizScores.last = pct;
    progress.quizScores.lastWrong = wrong;
    setProgress(progress);
    resultsScore.textContent = pct + '%';
    resultsWeak.textContent = wrong.length ? 'Review: ' + wrong.slice(0, 3).join(' · ') : 'All correct.';
    resultsWeak.style.display = wrong.length ? 'block' : 'none';
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
  }

  function route() {
    const hash = (window.location.hash || '#learn').slice(1);
    const parts = hash.split('/');
    if (parts[0] === 'quiz') {
      mode = 'quiz';
      btnQuiz.classList.add('active');
      btnLearn.classList.remove('active');
      showQuiz();
      return;
    }
    mode = 'learn';
    btnLearn.classList.add('active');
    btnQuiz.classList.remove('active');
    if (parts[0] === 'learn' && parts.length >= 4 && syllabi[parts[1]] && syllabi[parts[1]].modules[parts[2]]) {
      showLesson(parseInt(parts[1], 10), parseInt(parts[2], 10), parseInt(parts[3], 10));
      return;
    }
    viewLearn.classList.add('active');
    viewQuiz.classList.remove('active');
    lessonTitle.textContent = '';
    lessonContent.innerHTML = '<p>Pick a module above to start.</p>';
    lessonNav.innerHTML = '';
    buildModuleList();
  }

  btnLearn.addEventListener('click', function () { window.location.hash = 'learn'; route(); });
  btnQuiz.addEventListener('click', function () { window.location.hash = 'quiz'; route(); });
  document.getElementById('btn-submit-quiz').addEventListener('click', submitQuiz);
  btnReset.addEventListener('click', function () {
    if (confirm('Reset all progress?')) { setProgress({ completedLessons: [], quizScores: {} }); route(); }
  });
  window.addEventListener('hashchange', route);
  window.addEventListener('click', function (e) {
    const card = e.target.closest('.module-card');
    if (card && card.dataset.p != null) {
      e.preventDefault();
      showLesson(parseInt(card.dataset.p, 10), parseInt(card.dataset.m, 10), 0);
      window.location.hash = 'learn/' + card.dataset.p + '/' + card.dataset.m + '/0';
    }
  });

  Promise.all(CONTENT_FILES.map(f => fetch(f).then(r => r.json()))).then(function (loaded) {
    syllabi = loaded;
    route();
  }).catch(function (err) {
    progressText.textContent = 'Could not load content.';
    moduleList.innerHTML = '<li><p style="color:var(--muted);">Check that content/Part-1-syllabus.json and content/Part-2-syllabus-Act-3.json exist.</p></li>';
  });
})();

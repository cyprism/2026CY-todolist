const YEAR = 2026;
const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const shortWeekdays = ['일', '월', '화', '수', '목', '금', '토'];
const priorityLabel = { high: '높음', medium: '보통', low: '낮음' };

const today = new Date();
const effectiveToday = today.getFullYear() === YEAR ? today : new Date(YEAR, 0, 1);
let selectedDate = new Date(effectiveToday.getFullYear(), effectiveToday.getMonth(), effectiveToday.getDate());
let displayMonth = selectedDate.getMonth();
let currentView = 'day';

const demoTasks = {
  '2026-01-01': [
    { id: 'welcome-1', text: '올해 이루고 싶은 목표 3가지 적기', priority: 'high', done: false },
    { id: 'welcome-2', text: '새 달력에 중요한 일정 표시하기', priority: 'medium', done: true }
  ],
  '2026-01-03': [{ id: 'welcome-3', text: '오후에 천천히 산책하기', priority: 'low', done: false }]
};

let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = localStorage.getItem('green-planner-2026-tasks');
    return saved ? JSON.parse(saved) : demoTasks;
  } catch { return demoTasks; }
}

function saveTasks() {
  localStorage.setItem('green-planner-2026-tasks', JSON.stringify(tasks));
}

function keyOf(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function keepIn2026(date) {
  if (date.getFullYear() < YEAR) return new Date(YEAR, 0, 1);
  if (date.getFullYear() > YEAR) return new Date(YEAR, 11, 31);
  return date;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function renderMiniCalendar() {
  const grid = document.getElementById('miniCalendar');
  document.getElementById('monthTitle').textContent = `2026년 ${monthNames[displayMonth]}`;
  const first = new Date(YEAR, displayMonth, 1);
  const lastDate = new Date(YEAR, displayMonth + 1, 0).getDate();
  let html = ''.padStart(0);
  for (let i = 0; i < first.getDay(); i++) html += '<span class="calendar-spacer"></span>';
  for (let day = 1; day <= lastDate; day++) {
    const date = new Date(YEAR, displayMonth, day);
    const classes = ['calendar-day'];
    if (isSameDay(date, selectedDate)) classes.push('selected');
    if (today.getFullYear() === YEAR && isSameDay(date, today)) classes.push('today');
    if ((tasks[keyOf(date)] || []).length) classes.push('has-task');
    html += `<button class="${classes.join(' ')}" data-date="${keyOf(date)}" aria-label="2026년 ${displayMonth + 1}월 ${day}일">${day}</button>`;
  }
  grid.innerHTML = html;
}

function renderDay() {
  const dateKey = keyOf(selectedDate);
  const items = tasks[dateKey] || [];
  const doneCount = items.filter(item => item.done).length;
  const percent = items.length ? Math.round(doneCount / items.length * 100) : 0;
  document.getElementById('dateEyebrow').textContent = `${YEAR} · ${monthNames[selectedDate.getMonth()]}`;
  document.getElementById('viewTitle').textContent = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일의 할 일`;
  document.getElementById('selectedDay').textContent = String(selectedDate.getDate()).padStart(2, '0');
  document.getElementById('selectedWeekday').textContent = weekdays[selectedDate.getDay()];
  document.getElementById('dayGreeting').textContent = percent === 100 && items.length ? '오늘의 계획을 모두 마쳤어요!' : '가볍게 시작해 볼까요?';
  document.getElementById('completionSummary').textContent = items.length ? `${items.length}개 중 ${doneCount}개를 완료했어요.` : '할 일을 추가해 하루를 채워보세요.';
  document.getElementById('completionPercent').textContent = `${percent}%`;
  document.getElementById('completionRing').style.transform = `rotate(${Math.min(percent, 100) * 1.8}deg)`;
  document.getElementById('completionPercent').style.transform = `rotate(-${Math.min(percent, 100) * 1.8}deg)`;

  const list = document.getElementById('taskList');
  if (!items.length) {
    list.innerHTML = '<div class="empty-state"><span class="empty-icon">🌱</span><strong>아직 비어 있어요</strong><span>작은 할 일 하나부터 심어보세요.</span></div>';
    return;
  }
  const sorted = [...items].sort((a, b) => Number(a.done) - Number(b.done));
  list.innerHTML = sorted.map(item => `
    <article class="task-item priority-${item.priority} ${item.done ? 'done' : ''}" data-id="${item.id}">
      <input class="task-check" type="checkbox" ${item.done ? 'checked' : ''} aria-label="${escapeHTML(item.text)} 완료">
      <span class="task-color" title="중요도 ${priorityLabel[item.priority]}"></span>
      <span class="task-text">${escapeHTML(item.text)}</span>
      <button class="delete-task" type="button" aria-label="${escapeHTML(item.text)} 삭제">×</button>
    </article>`).join('');
}

function startOfWeek(date) {
  const result = new Date(date);
  result.setDate(date.getDate() - date.getDay());
  return result;
}

function renderWeek() {
  const start = startOfWeek(selectedDate);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  document.getElementById('weekRange').textContent = `${start.getMonth() + 1}.${String(start.getDate()).padStart(2, '0')} — ${end.getMonth() + 1}.${String(end.getDate()).padStart(2, '0')}`;
  let html = '';
  for (let i = 0; i < 7; i++) {
    const date = new Date(start); date.setDate(start.getDate() + i);
    const inYear = date.getFullYear() === YEAR;
    const items = inYear ? (tasks[keyOf(date)] || []) : [];
    html += `<article class="week-day ${isSameDay(date, selectedDate) ? 'selected' : ''}" data-date="${inYear ? keyOf(date) : ''}" ${inYear ? '' : 'aria-disabled="true"'}>
      <div class="week-day-head"><span>${shortWeekdays[date.getDay()]}</span><strong>${date.getDate()}</strong></div>
      ${items.length ? items.map(item => `<div class="week-task priority-${item.priority} ${item.done ? 'done' : ''}">${escapeHTML(item.text)}</div>`).join('') : '<div class="week-empty">비어 있음</div>'}
    </article>`;
  }
  document.getElementById('weekGrid').innerHTML = html;
}

function renderMonthBoard() {
  document.getElementById('largeMonthTitle').textContent = `2026년 ${monthNames[displayMonth]}`;
  const first = new Date(YEAR, displayMonth, 1);
  const start = new Date(YEAR, displayMonth, 1 - first.getDay());
  let html = '';
  for (let i = 0; i < 42; i++) {
    const date = new Date(start); date.setDate(start.getDate() + i);
    const items = date.getFullYear() === YEAR ? (tasks[keyOf(date)] || []) : [];
    const shown = items.slice(0, 2);
    html += `<div class="month-cell ${date.getMonth() !== displayMonth ? 'outside' : ''} ${isSameDay(date, selectedDate) ? 'selected' : ''}" data-date="${date.getFullYear() === YEAR ? keyOf(date) : ''}">
      <div class="month-cell-number"><span>${date.getDate()}</span>${items.length ? `<span class="task-count">${items.filter(item => item.done).length}/${items.length}</span>` : ''}</div>
      ${shown.map(item => `<div class="month-task priority-${item.priority}">${item.done ? '✓ ' : ''}${escapeHTML(item.text)}</div>`).join('')}
      ${items.length > 2 ? `<div class="more-tasks">+${items.length - 2}개 더</div>` : ''}
    </div>`;
  }
  document.getElementById('monthBoard').innerHTML = html;
}

function renderProgress() {
  const start = new Date(YEAR, 0, 1);
  const end = new Date(YEAR + 1, 0, 1);
  const cursor = today < start ? start : today > end ? end : today;
  const percent = Math.round((cursor - start) / (end - start) * 100);
  document.getElementById('yearProgress').style.width = `${percent}%`;
  document.getElementById('yearProgressText').textContent = `${percent}%`;
}

function renderAll() {
  renderMiniCalendar();
  renderDay();
  renderWeek();
  renderMonthBoard();
}

function selectDate(date) {
  selectedDate = keepIn2026(date);
  displayMonth = selectedDate.getMonth();
  renderAll();
}

function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) { input.focus(); showToast('할 일을 먼저 적어주세요.'); return; }
  const dateKey = keyOf(selectedDate);
  const task = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text, priority: document.getElementById('prioritySelect').value, done: false };
  tasks[dateKey] = [...(tasks[dateKey] || []), task];
  saveTasks(); input.value = ''; renderAll(); input.focus(); showToast('할 일을 추가했어요.');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view-tab').forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.view').forEach(panel => panel.classList.remove('active'));
  document.getElementById(`${view}View`).classList.add('active');
  const titles = { day: `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일의 할 일`, week: '이번 주의 흐름', month: `${displayMonth + 1}월 한눈에 보기` };
  document.getElementById('viewTitle').textContent = titles[view];
}

document.getElementById('addTaskButton').addEventListener('click', addTask);
document.getElementById('taskInput').addEventListener('keydown', event => { if (event.key === 'Enter') addTask(); });
document.getElementById('miniCalendar').addEventListener('click', event => {
  const button = event.target.closest('[data-date]'); if (!button) return;
  const [y, m, d] = button.dataset.date.split('-').map(Number); selectDate(new Date(y, m - 1, d));
});
document.getElementById('taskList').addEventListener('click', event => {
  const item = event.target.closest('.task-item'); if (!item) return;
  const dateKey = keyOf(selectedDate); const index = (tasks[dateKey] || []).findIndex(task => task.id === item.dataset.id); if (index < 0) return;
  if (event.target.matches('.delete-task')) { tasks[dateKey].splice(index, 1); if (!tasks[dateKey].length) delete tasks[dateKey]; showToast('할 일을 삭제했어요.'); }
  if (event.target.matches('.task-check')) { tasks[dateKey][index].done = event.target.checked; showToast(event.target.checked ? '하나를 완료했어요!' : '다시 진행 중으로 바꿨어요.'); }
  saveTasks(); renderAll();
});
document.querySelectorAll('.view-tab').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));

function changeMonth(delta) {
  displayMonth = Math.max(0, Math.min(11, displayMonth + delta));
  selectedDate = new Date(YEAR, displayMonth, Math.min(selectedDate.getDate(), new Date(YEAR, displayMonth + 1, 0).getDate()));
  renderAll(); if (currentView === 'month') switchView('month');
}
document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
document.getElementById('prevMonthLarge').addEventListener('click', () => changeMonth(-1));
document.getElementById('nextMonthLarge').addEventListener('click', () => changeMonth(1));
document.getElementById('todayButton').addEventListener('click', () => { selectDate(effectiveToday); switchView('day'); });
document.getElementById('prevWeek').addEventListener('click', () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); selectDate(d); switchView('week'); });
document.getElementById('nextWeek').addEventListener('click', () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); selectDate(d); switchView('week'); });
document.getElementById('weekGrid').addEventListener('click', event => {
  const cell = event.target.closest('[data-date]'); if (!cell?.dataset.date) return;
  const [y, m, d] = cell.dataset.date.split('-').map(Number); selectDate(new Date(y, m - 1, d)); switchView('day');
});
document.getElementById('monthBoard').addEventListener('click', event => {
  const cell = event.target.closest('[data-date]'); if (!cell?.dataset.date) return;
  const [y, m, d] = cell.dataset.date.split('-').map(Number); selectDate(new Date(y, m - 1, d)); switchView('day');
});

renderProgress();
renderAll();

// ====================================================================
// 遊戲主邏輯 + 晶體百科渲染
// ====================================================================

// --- DOM 元素快取 ---
const EL = {
  startScreen: document.getElementById('start-screen'),
  gameScreen: document.getElementById('game-screen'),
  resultScreen: document.getElementById('result-screen'),
  startBtn: document.getElementById('start-btn'),
  restartBtn: document.getElementById('restart-btn'),
  player1: document.getElementById('player1'),
  qcount: document.getElementById('qcount'),
  scoreDisplay: document.getElementById('score-display'),
  qIndex: document.getElementById('q-index'),
  qTotal: document.getElementById('q-total'),
  timeBar: document.getElementById('time-bar'),
  timeText: document.getElementById('time-text'),
  qText: document.getElementById('q-text'),
  choices: document.getElementById('choices'),
  feedback: document.getElementById('feedback'),
  nextBtn: document.getElementById('next-btn'),
  summary: document.getElementById('summary'),
  records: document.getElementById('records')
};

// --- 遊戲狀態 ---
let state = {
  playerName: '玩家',
  totalQuestions: 10,
  questions: [],
  index: 0,
  timer: null,
  timeLimit: 15000,
  timeLeft: 15000,
  totalScore: 0,
  records: []
};

// ====================================================================
// 初始化：綁定事件 + 渲染晶體百科
// ====================================================================
function init() {
  EL.startBtn.addEventListener('click', startGame);
  EL.restartBtn.addEventListener('click', () => location.reload());
  EL.nextBtn.addEventListener('click', nextQuestion);

  // 分頁導覽按鈕
  initTabNavigation();

  // 渲染晶體百科內容（介紹卡片、比較表格、特殊案例）
  renderCrystalCards();
  renderComparisonTable();
  renderSpecialCases();
}

// ====================================================================
// 分頁導覽邏輯
// ====================================================================
function initTabNavigation() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 取得點擊的分頁名稱（game 或 wiki）
      const targetTab = btn.dataset.tab;

      // 移除所有按鈕的 active 狀態，再加到點擊的按鈕
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 隱藏所有分頁內容，再顯示目標分頁
      tabContents.forEach(tc => tc.classList.remove('active'));
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });
}

// ====================================================================
// 晶體介紹卡片渲染
// ====================================================================
function renderCrystalCards() {
  const container = document.getElementById('crystal-cards');
  if (!container) return;

  // 遍歷每一種晶體資料，產生一張可展開的卡片
  CRYSTAL_DATA.forEach(crystal => {
    const card = document.createElement('div');
    card.className = 'crystal-card';
    // 設定卡片背景漸層
    card.style.background = crystal.gradient;

    // 頂部裝飾條的顏色
    card.style.setProperty('--card-color', crystal.color);

    card.innerHTML = `
      <!-- 卡片標題列：圖示 + 名稱 + 展開箭頭 -->
      <div class="crystal-card-header">
        <span class="crystal-card-icon">${crystal.icon}</span>
        <span class="crystal-card-name">${crystal.name}</span>
        <span class="crystal-card-toggle">▼</span>
      </div>
      <!-- 摘要文字（始終顯示） -->
      <div class="crystal-card-summary">${crystal.summary}</div>
      <!-- 展開後的詳細內容 -->
      <div class="crystal-card-detail">
        <div class="crystal-card-desc">${crystal.description}</div>
        <!-- 屬性標籤 -->
        <div class="crystal-props">
          <span class="crystal-prop">
            <span class="crystal-prop-label">組成粒子：</span>
            <span class="crystal-prop-value">${crystal.particles}</span>
          </span>
          <span class="crystal-prop">
            <span class="crystal-prop-label">鍵結：</span>
            <span class="crystal-prop-value">${crystal.bondType}</span>
          </span>
          <span class="crystal-prop">
            <span class="crystal-prop-label">熔沸點：</span>
            <span class="crystal-prop-value">${crystal.meltingPoint}</span>
          </span>
          <span class="crystal-prop">
            <span class="crystal-prop-label">導電性：</span>
            <span class="crystal-prop-value">${crystal.conductivity}</span>
          </span>
          <span class="crystal-prop">
            <span class="crystal-prop-label">硬度：</span>
            <span class="crystal-prop-value">${crystal.hardness}</span>
          </span>
          <span class="crystal-prop">
            <span class="crystal-prop-label">溶解性：</span>
            <span class="crystal-prop-value">${crystal.solubility}</span>
          </span>
        </div>
        <!-- 代表範例 -->
        <div class="crystal-examples">
          ${crystal.examples.map(ex =>
            `<span class="crystal-example-tag" style="background:${crystal.color}">${ex}</span>`
          ).join('')}
        </div>
      </div>
    `;

    // 點擊卡片時切換展開/收合
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });

    container.appendChild(card);
  });
}

// ====================================================================
// 比較表格渲染
// ====================================================================
function renderComparisonTable() {
  const table = document.getElementById('comparison-table');
  if (!table) return;

  // 建立表頭 <thead>
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  COMPARISON_TABLE.headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  // 建立表身 <tbody>
  const tbody = document.createElement('tbody');
  COMPARISON_TABLE.rows.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

// ====================================================================
// 特殊案例渲染
// ====================================================================
function renderSpecialCases() {
  const container = document.getElementById('special-cases');
  if (!container) return;

  SPECIAL_CASES.forEach(sc => {
    const card = document.createElement('div');
    card.className = 'special-card';

    card.innerHTML = `
      <div class="special-card-header">
        <span class="special-card-icon">${sc.icon}</span>
        <span class="special-card-name">${sc.name}</span>
      </div>
      <div class="special-card-desc">${sc.description}</div>
      <ul class="special-key-points">
        ${sc.keyPoints.map(kp => `<li>${kp}</li>`).join('')}
      </ul>
    `;

    container.appendChild(card);
  });
}

// ====================================================================
// 以下為原有的遊戲邏輯（未修改）
// ====================================================================

function startGame(){
  state.playerName = EL.player1.value.trim() || '玩家';
  state.totalQuestions = parseInt(EL.qcount.value,10);
  // 隨機取題
  state.questions = shuffleArray(QUESTION_BANK).slice(0,state.totalQuestions);
  state.index = 0;
  state.totalScore = 0;
  state.records = [];

  EL.startScreen.classList.add('hidden');
  EL.gameScreen.classList.remove('hidden');
  EL.qTotal.textContent = state.totalQuestions;
  EL.scoreDisplay.textContent = '分數: 0';
  renderQuestion();
}

function renderQuestion(){
  const q = state.questions[state.index];
  EL.qIndex.textContent = state.index+1;
  EL.qText.textContent = q.q;
  EL.choices.innerHTML = '';
  EL.feedback.classList.add('hidden');
  EL.nextBtn.classList.add('hidden');
  // 建立選項按鈕
  q.choices.forEach((c,i)=>{
    const d = document.createElement('div');
    d.className = 'choice';
    d.textContent = `${String.fromCharCode(65+i)}. ${c}`;
    d.dataset.idx = i;
    d.addEventListener('click', onChoose);
    EL.choices.appendChild(d);
  });
  // 啟動倒數計時
  state.timeLeft = state.timeLimit;
  updateTimerUI();
  startTimer();
}

function startTimer(){
  const start = Date.now();
  if(state.timer) clearInterval(state.timer);
  state.timer = setInterval(()=>{
    const elapsed = Date.now()-start;
    state.timeLeft = Math.max(0, state.timeLimit - elapsed);
    updateTimerUI();
    if(state.timeLeft<=0){
      clearInterval(state.timer);
      handleAnswer(null,true);
    }
  },100);
}

function updateTimerUI(){
  const pct = state.timeLeft/state.timeLimit*100;
  EL.timeBar.style.width = pct+'%';
  const secs = Math.ceil(state.timeLeft/1000);
  EL.timeText.textContent = `${secs}s`;
}

function onChoose(e){
  const idx = parseInt(e.currentTarget.dataset.idx,10);
  clearInterval(state.timer);
  handleAnswer(idx,false);
}

function handleAnswer(chosenIdx, isTimeout){
  const q = state.questions[state.index];
  const correct = q.a;
  const secsLeft = Math.max(0, Math.ceil(state.timeLeft/1000));
  let score = 0;
  if(!isTimeout && chosenIdx===correct){
    score = Math.round(secsLeft/15*10);
  }
  // 記錄答題
  const playerName = state.playerName;
  state.records.push({
    q: q.q,
    choices: q.choices,
    chosen: chosenIdx,
    correct,
    explain: q.explain,
    player: playerName,
    score
  });
  // 更新分數
  state.totalScore += score;
  
  // 標記選項狀態：正確/錯誤/淡化
  Array.from(EL.choices.children).forEach((ch)=>{
    ch.classList.add('disabled');
    const idx = parseInt(ch.dataset.idx,10);
    if(chosenIdx === null){
      // 超時：顯示正確答案，其餘淡化
      if(idx === correct) ch.classList.add('correct');
      else ch.classList.add('dim');
    } else if(chosenIdx === correct){
      // 答對：標記正確，其餘淡化
      if(idx === correct) ch.classList.add('correct');
      else ch.classList.add('dim');
    } else {
      // 答錯：標記錯誤(紅) + 正確(綠)，其餘淡化
      if(idx === correct) ch.classList.add('correct');
      else if(idx === chosenIdx) ch.classList.add('wrong');
      else ch.classList.add('dim');
    }
  });
  // 顯示回饋與解析
  const correctText = `正確答案：${String.fromCharCode(65+correct)}. ${q.choices[correct]}`;
  const chosenText = chosenIdx===null? '（未作答或超時）': `你的答案：${String.fromCharCode(65+chosenIdx)}. ${q.choices[chosenIdx]}`;
  EL.feedback.innerHTML = `<div><strong>${chosenIdx===correct? '答對':'答錯'}</strong> （得分：${score}）</div><div>${chosenText}</div><div>${correctText}</div><div style="margin-top:6px;color:#333">解析：${q.explain}</div>`;
  EL.feedback.classList.remove('hidden');
  EL.nextBtn.classList.remove('hidden');
  EL.scoreDisplay.textContent = '分數: ' + state.totalScore;
}

function nextQuestion(){
  state.index++;
  if(state.index>=state.totalQuestions){
    endGame();
  } else {
    renderQuestion();
  }
}

function endGame(){
  EL.gameScreen.classList.add('hidden');
  EL.resultScreen.classList.remove('hidden');
  // 結果摘要
  const total = state.totalScore||0;
  const correctCount = state.records.filter(r=>r.chosen===r.correct).length;
  const rate = Math.round(correctCount/state.totalQuestions*100);
  EL.summary.innerHTML = `<div>總分：${total}</div><div>答對：${correctCount} / ${state.totalQuestions}</div><div>正確率：${rate}%</div>`;

  // 答題紀錄列表
  EL.records.innerHTML = '<h3>答題紀錄</h3>';
  const ul = document.createElement('ul');
  state.records.forEach((r,i)=>{
    const li = document.createElement('li');
    const chosen = r.chosen===null? '未作答' : `${String.fromCharCode(65+r.chosen)}. ${r.choices[r.chosen]}`;
    li.innerHTML = `<strong>Q${i+1}</strong> ${r.q} <br>你的回答：${chosen} <br>正確：${String.fromCharCode(65+r.correct)}. ${r.choices[r.correct]} <br>得分：${r.score} <br>解析：${r.explain}`;
    ul.appendChild(li);
  });
  EL.records.appendChild(ul);
}

// ====================================================================
// 工具函式：Fisher-Yates 洗牌演算法
// ====================================================================
function shuffleArray(a){
  const arr = a.slice();
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

// 啟動應用
init();

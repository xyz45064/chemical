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

  // 初始化互動實驗室（元素合成功能）
  initLab();
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

// ====================================================================
// 互動實驗室 — 元素合成邏輯
// ====================================================================

// --- 實驗室狀態 ---
const labState = {
  selectedElements: [],   // 已選取的元素（最多 2 個）
  history: [],            // 合成歷史紀錄
  currentFilter: 'all'    // 目前的元素篩選條件
};

/**
 * 初始化互動實驗室
 * 渲染元素網格、綁定篩選器與操作按鈕
 */
function initLab() {
  renderElementGrid();
  bindFilterButtons();
  bindLabButtons();
}

/**
 * 渲染元素選取網格
 * 根據 ELEMENT_POOL 動態生成元素按鈕
 */
function renderElementGrid() {
  const grid = document.getElementById('element-grid');
  if (!grid) return;
  grid.innerHTML = '';

  ELEMENT_POOL.forEach(el => {
    const tile = document.createElement('button');
    tile.className = `element-tile element-${el.category}`;
    tile.dataset.symbol = el.symbol;

    // 若目前有篩選條件且不符合，加上 hidden class
    if (labState.currentFilter !== 'all' && el.category !== labState.currentFilter) {
      tile.classList.add('filtered-out');
    }

    // 若已被選取，加上 selected class
    if (labState.selectedElements.some(s => s.symbol === el.symbol)) {
      tile.classList.add('selected');
    }

    // 元素磚塊的 HTML 結構：符號 + 名稱 + 分類標籤
    tile.innerHTML = `
      <span class="element-symbol" style="color:${el.color}">${el.symbol}</span>
      <span class="element-name">${el.name}</span>
      <span class="element-group">${el.group}</span>
    `;

    // 綁定點擊事件
    tile.addEventListener('click', () => onElementClick(el));

    grid.appendChild(tile);
  });
}

/**
 * 綁定元素分類篩選按鈕
 */
function bindFilterButtons() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 切換 active 狀態
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 更新篩選狀態並重新渲染
      labState.currentFilter = btn.dataset.filter;
      renderElementGrid();
    });
  });
}

/**
 * 綁定合成與重置按鈕
 */
function bindLabButtons() {
  const synthesizeBtn = document.getElementById('synthesize-btn');
  const resetBtn = document.getElementById('reset-lab-btn');

  if (synthesizeBtn) {
    synthesizeBtn.addEventListener('click', performSynthesis);
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', resetLab);
  }
}

/**
 * 元素被點擊時的處理邏輯
 * @param {Object} el - 被點擊的元素物件
 */
function onElementClick(el) {
  // 檢查是否已選取此元素（若已選取則取消）
  const existingIdx = labState.selectedElements.findIndex(s => s.symbol === el.symbol);
  if (existingIdx !== -1) {
    labState.selectedElements.splice(existingIdx, 1);
    updateReactionSlots();
    renderElementGrid();
    return;
  }

  // 最多選 2 個
  if (labState.selectedElements.length >= 2) return;

  labState.selectedElements.push(el);
  updateReactionSlots();
  renderElementGrid();
}

/**
 * 更新反應欄位（顯示已選取的元素）
 */
function updateReactionSlots() {
  const slot1 = document.getElementById('slot-1');
  const slot2 = document.getElementById('slot-2');
  const resultSlot = document.getElementById('slot-result');
  const synthesizeBtn = document.getElementById('synthesize-btn');

  // 重置結果欄位
  resultSlot.className = 'reaction-slot result-slot empty';
  resultSlot.querySelector('.slot-symbol').textContent = '?';
  resultSlot.querySelector('.slot-label').textContent = '產物';
  resultSlot.style.borderColor = '';

  // 更新元素 1
  if (labState.selectedElements.length >= 1) {
    const el1 = labState.selectedElements[0];
    slot1.className = 'reaction-slot filled';
    slot1.querySelector('.slot-symbol').textContent = el1.symbol;
    slot1.querySelector('.slot-label').textContent = el1.name;
    slot1.style.borderColor = el1.color;
    slot1.style.boxShadow = `0 0 20px ${el1.color}40`;
  } else {
    slot1.className = 'reaction-slot empty';
    slot1.querySelector('.slot-symbol').textContent = '?';
    slot1.querySelector('.slot-label').textContent = '元素 1';
    slot1.style.borderColor = '';
    slot1.style.boxShadow = '';
  }

  // 更新元素 2
  if (labState.selectedElements.length >= 2) {
    const el2 = labState.selectedElements[1];
    slot2.className = 'reaction-slot filled';
    slot2.querySelector('.slot-symbol').textContent = el2.symbol;
    slot2.querySelector('.slot-label').textContent = el2.name;
    slot2.style.borderColor = el2.color;
    slot2.style.boxShadow = `0 0 20px ${el2.color}40`;
  } else {
    slot2.className = 'reaction-slot empty';
    slot2.querySelector('.slot-symbol').textContent = '?';
    slot2.querySelector('.slot-label').textContent = '元素 2';
    slot2.style.borderColor = '';
    slot2.style.boxShadow = '';
  }

  // 啟用/停用合成按鈕
  if (synthesizeBtn) {
    synthesizeBtn.disabled = labState.selectedElements.length < 2;
  }
}

/**
 * 執行合成：查詢反應資料庫或推斷晶體類型，並以動畫顯示結果
 */
function performSynthesis() {
  if (labState.selectedElements.length < 2) return;

  const el1 = labState.selectedElements[0];
  const el2 = labState.selectedElements[1];

  // 先從資料庫查詢
  let reaction = lookupReaction(el1.symbol, el2.symbol);

  // 若資料庫沒有，用通用規則推斷
  if (!reaction) {
    const inferred = inferCrystalType(el1, el2);
    if (inferred) {
      reaction = {
        product: `${el1.symbol} + ${el2.symbol} 化合物`,
        name: `${el1.name}${el2.name}化合物（推斷）`,
        crystalType: inferred.crystalType,
        icon: inferred.icon,
        color: inferred.color,
        equation: `${el1.symbol} + ${el2.symbol} → ?`,
        description: inferred.description,
        properties: inferred.properties,
        structureHint: '依化合物種類而定',
        isInferred: true
      };
    }
  }

  // 播放合成動畫
  playSynthesisAnimation(reaction);
}

/**
 * 播放合成動畫並顯示結果
 * @param {Object|null} reaction - 反應結果物件
 */
function playSynthesisAnimation(reaction) {
  const resultSlot = document.getElementById('slot-result');
  const resultPanel = document.getElementById('result-panel');
  const synthesizeBtn = document.getElementById('synthesize-btn');

  // 停用合成按鈕，避免重複點擊
  synthesizeBtn.disabled = true;

  // 反應欄位閃爍動畫
  resultSlot.className = 'reaction-slot result-slot synthesizing';
  resultSlot.querySelector('.slot-symbol').textContent = '⚡';
  resultSlot.querySelector('.slot-label').textContent = '合成中...';

  // 延遲後顯示結果
  setTimeout(() => {
    if (reaction) {
      // 合成成功
      resultSlot.className = 'reaction-slot result-slot success';
      resultSlot.querySelector('.slot-symbol').textContent = reaction.icon;
      resultSlot.querySelector('.slot-label').textContent = reaction.product;
      resultSlot.style.borderColor = reaction.color;
      resultSlot.style.boxShadow = `0 0 30px ${reaction.color}60`;

      // 顯示詳細結果面板
      showResultPanel(reaction);

      // 加入歷史紀錄
      addToHistory(reaction);
    } else {
      // 找不到反應
      resultSlot.className = 'reaction-slot result-slot fail';
      resultSlot.querySelector('.slot-symbol').textContent = '❌';
      resultSlot.querySelector('.slot-label').textContent = '無資料';

      resultPanel.innerHTML = `
        <div class="result-error">
          <span class="result-error-icon">🔬</span>
          <p>目前資料庫中沒有這兩個元素的組合資料。<br>試試其他元素組合吧！</p>
        </div>
      `;
      resultPanel.classList.remove('hidden');
    }

    synthesizeBtn.disabled = false;
  }, 1200);
}

/**
 * 顯示合成結果的詳細面板
 * @param {Object} reaction - 反應結果物件
 */
function showResultPanel(reaction) {
  const panel = document.getElementById('result-panel');

  // 根據晶體類型對應不同的背景漸層
  const gradientMap = {
    '離子晶體': 'linear-gradient(135deg, rgba(185,28,90,0.3) 0%, rgba(232,69,122,0.15) 100%)',
    '共價網狀晶體': 'linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(168,85,247,0.15) 100%)',
    '分子晶體': 'linear-gradient(135deg, rgba(14,116,144,0.3) 0%, rgba(34,211,238,0.15) 100%)',
    '金屬晶體': 'linear-gradient(135deg, rgba(180,83,9,0.3) 0%, rgba(245,158,11,0.15) 100%)'
  };

  const bg = gradientMap[reaction.crystalType] || 'rgba(255,255,255,0.05)';

  panel.innerHTML = `
    <div class="result-card" style="background:${bg}">
      <!-- 結果標題 -->
      <div class="result-header">
        <span class="result-icon">${reaction.icon}</span>
        <div class="result-title-group">
          <h3 class="result-name">${reaction.name}</h3>
          <span class="result-crystal-type" style="background:${reaction.color}">${reaction.crystalType}</span>
        </div>
      </div>

      <!-- 化學反應式 -->
      <div class="result-equation">
        <span class="equation-label">反應式：</span>
        <span class="equation-text">${reaction.equation}</span>
      </div>

      <!-- 詳細說明 -->
      <div class="result-description">
        ${reaction.description}
      </div>

      <!-- 性質標籤 -->
      <div class="result-properties">
        <span class="properties-label">主要性質：</span>
        <div class="properties-tags">
          ${reaction.properties.map(p => `<span class="property-tag" style="border-color:${reaction.color}40">${p}</span>`).join('')}
        </div>
      </div>

      ${reaction.structureHint ? `
      <!-- 結構提示 -->
      <div class="result-structure">
        <span class="structure-label">🔍 結構提示：</span>
        <span class="structure-text">${reaction.structureHint}</span>
      </div>
      ` : ''}

      ${reaction.isInferred ? `
      <!-- 推斷提示 -->
      <div class="result-inferred">
        <span class="inferred-icon">💡</span>
        <span>此結果為系統根據元素分類推斷，實際化合物可能更複雜。</span>
      </div>
      ` : ''}
    </div>
  `;

  panel.classList.remove('hidden');
  // 觸發動畫
  panel.style.animation = 'none';
  // 使用 requestAnimationFrame 確保動畫重新觸發
  requestAnimationFrame(() => {
    panel.style.animation = 'resultSlideIn 0.5s ease forwards';
  });
}

/**
 * 將合成結果加入歷史紀錄
 * @param {Object} reaction - 反應結果物件
 */
function addToHistory(reaction) {
  const el1 = labState.selectedElements[0];
  const el2 = labState.selectedElements[1];

  labState.history.unshift({
    el1Symbol: el1.symbol,
    el1Name: el1.name,
    el2Symbol: el2.symbol,
    el2Name: el2.name,
    reaction: reaction
  });

  renderHistory();
}

/**
 * 渲染歷史紀錄列表
 */
function renderHistory() {
  const container = document.getElementById('lab-history');
  const list = document.getElementById('history-list');
  if (!container || !list) return;

  if (labState.history.length === 0) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  list.innerHTML = '';

  labState.history.forEach(record => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <span class="history-elements">
        <span class="history-el">${record.el1Symbol}</span>
        <span class="history-plus">+</span>
        <span class="history-el">${record.el2Symbol}</span>
      </span>
      <span class="history-arrow">→</span>
      <span class="history-result">
        <span class="history-icon">${record.reaction.icon}</span>
        <span class="history-product">${record.reaction.product}</span>
      </span>
      <span class="history-type" style="background:${record.reaction.color}">${record.reaction.crystalType}</span>
    `;

    // 點擊歷史紀錄可重新顯示結果
    item.addEventListener('click', () => {
      showResultPanel(record.reaction);
    });

    list.appendChild(item);
  });
}

/**
 * 重置實驗室（清空選取與結果）
 */
function resetLab() {
  labState.selectedElements = [];
  updateReactionSlots();
  renderElementGrid();

  const resultPanel = document.getElementById('result-panel');
  if (resultPanel) {
    resultPanel.classList.add('hidden');
    resultPanel.innerHTML = '';
  }

  // 重置結果欄位的自訂樣式
  const resultSlot = document.getElementById('slot-result');
  if (resultSlot) {
    resultSlot.style.borderColor = '';
    resultSlot.style.boxShadow = '';
  }
  const slot1 = document.getElementById('slot-1');
  const slot2 = document.getElementById('slot-2');
  if (slot1) { slot1.style.borderColor = ''; slot1.style.boxShadow = ''; }
  if (slot2) { slot2.style.borderColor = ''; slot2.style.boxShadow = ''; }
}

// ====================================================================
// 啟動應用
// ====================================================================
init();

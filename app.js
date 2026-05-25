// 遊戲主邏輯
const EL = {
  startScreen: document.getElementById('start-screen'),
  gameScreen: document.getElementById('game-screen'),
  resultScreen: document.getElementById('result-screen'),
  startBtn: document.getElementById('start-btn'),
  restartBtn: document.getElementById('restart-btn'),
  modeRadios: document.getElementsByName('mode'),
  player1: document.getElementById('player1'),
  player2: document.getElementById('player2'),
  player2Label: document.getElementById('player2-label'),
  qcount: document.getElementById('qcount'),
  playerIndicator: document.getElementById('player-indicator'),
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

let state = {
  mode: 'single',
  players: [],
  totalQuestions: 10,
  questions: [],
  index: 0,
  timer: null,
  timeLimit: 15000,
  timeLeft: 15000,
  totalScore: [0,0],
  records: [],
  currentPlayer: 0
};

function init() {
  // mode toggle
  for (let r of EL.modeRadios) r.addEventListener('change', onModeChange);
  EL.startBtn.addEventListener('click', startGame);
  EL.restartBtn.addEventListener('click', () => location.reload());
  EL.nextBtn.addEventListener('click', nextQuestion);
}

function onModeChange(){
  const mode = Array.from(EL.modeRadios).find(r=>r.checked).value;
  if(mode==='duo'){
    EL.player2.disabled = false;
  } else {
    EL.player2.disabled = true;
  }
}

function startGame(){
  state.mode = Array.from(EL.modeRadios).find(r=>r.checked).value;
  const p1 = EL.player1.value.trim()||'玩家1';
  const p2 = EL.player2.value.trim()||'玩家2';
  state.players = state.mode==='duo'?[p1,p2]:[p1];
  state.totalQuestions = parseInt(EL.qcount.value,10);
  // pick questions
  state.questions = shuffleArray(QUESTION_BANK).slice(0,state.totalQuestions);
  state.index = 0;
  state.totalScore = state.mode==='duo'?[0,0]:[0];
  state.records = [];
  state.currentPlayer = 0;

  EL.startScreen.classList.add('hidden');
  EL.gameScreen.classList.remove('hidden');
  EL.qTotal.textContent = state.totalQuestions;
  EL.scoreDisplay.textContent = '分數: 0';
  renderQuestion();
}

function renderQuestion(){
  const q = state.questions[state.index];
  EL.qIndex.textContent = state.index+1;
  EL.playerIndicator.textContent = state.mode==='duo'?`目前：${state.players[state.currentPlayer]}`:`玩家：${state.players[0]}`;
  EL.qText.textContent = q.q;
  EL.choices.innerHTML = '';
  EL.feedback.classList.add('hidden');
  EL.nextBtn.classList.add('hidden');
  // choices
  q.choices.forEach((c,i)=>{
    const d = document.createElement('div');
    d.className = 'choice';
    d.textContent = `${String.fromCharCode(65+i)}. ${c}`;
    d.dataset.idx = i;
    d.addEventListener('click', onChoose);
    EL.choices.appendChild(d);
  });
  // timer
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
  // record
  const playerName = state.players[state.currentPlayer];
  state.records.push({
    q: q.q,
    choices: q.choices,
    chosen: chosenIdx,
    correct,
    explain: q.explain,
    player: playerName,
    score
  });
  // update player score
  if(state.mode==='duo'){
    state.totalScore[state.currentPlayer] += score;
  } else {
    state.totalScore[0] += score;
  }
  // disable choices and mark correct / wrong / dim states
  Array.from(EL.choices.children).forEach((ch)=>{
    ch.classList.add('disabled');
    const idx = parseInt(ch.dataset.idx,10);
    if(chosenIdx === null){
      // timeout: show correct, dim others
      if(idx === correct) ch.classList.add('correct');
      else ch.classList.add('dim');
    } else if(chosenIdx === correct){
      // answered correctly: mark chosen as correct, dim others
      if(idx === correct) ch.classList.add('correct');
      else ch.classList.add('dim');
    } else {
      // answered incorrectly: chosen wrong -> red, correct -> green, others dim
      if(idx === correct) ch.classList.add('correct');
      else if(idx === chosenIdx) ch.classList.add('wrong');
      else ch.classList.add('dim');
    }
  });
  // show feedback
  const correctText = `正確答案：${String.fromCharCode(65+correct)}. ${q.choices[correct]}`;
  const chosenText = chosenIdx===null? '（未作答或超時）': `你的答案：${String.fromCharCode(65+chosenIdx)}. ${q.choices[chosenIdx]}`;
  EL.feedback.innerHTML = `<div><strong>${chosenIdx===correct? '答對':'答錯'}</strong> （得分：${score}）</div><div>${chosenText}</div><div>${correctText}</div><div style="margin-top:6px;color:#333">解析：${q.explain}</div>`;
  EL.feedback.classList.remove('hidden');
  EL.nextBtn.classList.remove('hidden');
  EL.scoreDisplay.textContent = '分數: ' + (state.mode==='duo'? state.totalScore[state.currentPlayer] : state.totalScore[0]);
  // for duo, still show current player's cumulative only; next will switch
}

function nextQuestion(){
  // advance player if duo
  if(state.mode==='duo'){
    // switch player
    state.currentPlayer = (state.currentPlayer+1) % 2;
  }
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
  // summary
  if(state.mode==='duo'){
    const p0 = state.players[0];
    const p1 = state.players[1];
    const s0 = state.totalScore[0]||0;
    const s1 = state.totalScore[1]||0;
    const winner = s0===s1? '平手' : (s0>s1? `${p0} 勝利` : `${p1} 勝利`);
    EL.summary.innerHTML = `<div>${p0}：${s0} 分</div><div>${p1}：${s1} 分</div><div><strong>${winner}</strong></div>`;
  } else {
    const total = state.totalScore[0]||0;
    const correctCount = state.records.filter(r=>r.chosen===r.correct).length;
    const rate = Math.round(correctCount/state.totalQuestions*100);
    EL.summary.innerHTML = `<div>總分：${total}</div><div>答對：${correctCount} / ${state.totalQuestions}</div><div>正確率：${rate}%</div>`;
  }
  // records table
  EL.records.innerHTML = '<h3>答題紀錄</h3>';
  const ul = document.createElement('ul');
  state.records.forEach((r,i)=>{
    const li = document.createElement('li');
    const chosen = r.chosen===null? '未作答' : `${String.fromCharCode(65+r.chosen)}. ${r.choices[r.chosen]}`;
    li.innerHTML = `<strong>Q${i+1}</strong> (${r.player}) ${r.q} <br>你的回答：${chosen} <br>正確：${String.fromCharCode(65+r.correct)}. ${r.choices[r.correct]} <br>得分：${r.score} <br>解析：${r.explain}`;
    ul.appendChild(li);
  });
  EL.records.appendChild(ul);
}

// util
function shuffleArray(a){
  const arr = a.slice();
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

init();

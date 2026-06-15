// ====================================================================
// 互動實驗室：元素資料 + 反應組合資料
// 使用者可以選擇兩個元素，系統會自動判斷產生的化合物屬於哪種晶體類型
// ====================================================================

// --- 元素資料庫 ---
// 每個元素都有符號、名稱、分類（metal/nonmetal/metalloid）與電子組態摘要
const ELEMENT_POOL = [
  // ── 金屬元素 ──
  { symbol: 'Na',  name: '鈉',   category: 'metal',     group: '鹼金屬',     color: '#f59e0b', charge: '+1' },
  { symbol: 'K',   name: '鉀',   category: 'metal',     group: '鹼金屬',     color: '#f59e0b', charge: '+1' },
  { symbol: 'Ca',  name: '鈣',   category: 'metal',     group: '鹼土金屬',   color: '#fb923c', charge: '+2' },
  { symbol: 'Mg',  name: '鎂',   category: 'metal',     group: '鹼土金屬',   color: '#fb923c', charge: '+2' },
  { symbol: 'Al',  name: '鋁',   category: 'metal',     group: '其他金屬',   color: '#a3a3a3', charge: '+3' },
  { symbol: 'Fe',  name: '鐵',   category: 'metal',     group: '過渡金屬',   color: '#78716c', charge: '+2/+3' },
  { symbol: 'Cu',  name: '銅',   category: 'metal',     group: '過渡金屬',   color: '#c2855a', charge: '+1/+2' },
  { symbol: 'Zn',  name: '鋅',   category: 'metal',     group: '過渡金屬',   color: '#94a3b8', charge: '+2' },
  { symbol: 'Ag',  name: '銀',   category: 'metal',     group: '過渡金屬',   color: '#cbd5e1', charge: '+1' },
  { symbol: 'Au',  name: '金',   category: 'metal',     group: '過渡金屬',   color: '#fbbf24', charge: '+1/+3' },

  // ── 非金屬元素 ──
  { symbol: 'Cl',  name: '氯',   category: 'nonmetal',  group: '鹵素',       color: '#22d3ee', charge: '-1' },
  { symbol: 'Br',  name: '溴',   category: 'nonmetal',  group: '鹵素',       color: '#a855f7', charge: '-1' },
  { symbol: 'F',   name: '氟',   category: 'nonmetal',  group: '鹵素',       color: '#34d399', charge: '-1' },
  { symbol: 'I',   name: '碘',   category: 'nonmetal',  group: '鹵素',       color: '#c084fc', charge: '-1' },
  { symbol: 'O',   name: '氧',   category: 'nonmetal',  group: '非金屬',     color: '#f87171', charge: '-2' },
  { symbol: 'S',   name: '硫',   category: 'nonmetal',  group: '非金屬',     color: '#facc15', charge: '-2' },
  { symbol: 'N',   name: '氮',   category: 'nonmetal',  group: '非金屬',     color: '#60a5fa', charge: '-3' },
  { symbol: 'C',   name: '碳',   category: 'nonmetal',  group: '非金屬',     color: '#6b7280', charge: '±4' },
  { symbol: 'H',   name: '氫',   category: 'nonmetal',  group: '非金屬',     color: '#e2e8f0', charge: '+1/-1' },
  { symbol: 'P',   name: '磷',   category: 'nonmetal',  group: '非金屬',     color: '#fb7185', charge: '-3/+5' },

  // ── 類金屬 ──
  { symbol: 'Si',  name: '矽',   category: 'metalloid', group: '類金屬',     color: '#8b5cf6', charge: '±4' },
];

// ====================================================================
// 反應組合資料庫
// key 格式為 "元素1+元素2"（依字母排序），確保查詢一致性
// ====================================================================
const REACTION_DATABASE = {
  // ── 離子晶體（金屬 + 非金屬） ──
  'Cl+Na': {
    product: 'NaCl',
    name: '氯化鈉（食鹽）',
    crystalType: '離子晶體',
    icon: '🧂',
    color: '#ff6eb4',
    equation: '2Na + Cl₂ → 2NaCl',
    description: 'Na 失去一個電子形成 Na⁺，Cl 獲得一個電子形成 Cl⁻，兩者以離子鍵結合，形成面心立方（FCC）結構的離子晶體。NaCl 是最經典的離子晶體範例。',
    properties: ['高熔點（801°C）', '固態不導電', '水溶液可導電', '硬但脆', '可溶於水'],
    structureHint: 'Na⁺ 與 Cl⁻ 交替排列成三維立方晶格'
  },
  'K+Cl': {
    product: 'KCl',
    name: '氯化鉀',
    crystalType: '離子晶體',
    icon: '🧂',
    color: '#ff6eb4',
    equation: '2K + Cl₂ → 2KCl',
    description: 'K 失去一個電子形成 K⁺，與 Cl⁻ 以離子鍵結合，結構與 NaCl 相似。',
    properties: ['高熔點（770°C）', '固態不導電', '水溶液可導電', '硬但脆'],
    structureHint: 'K⁺ 與 Cl⁻ 交替排列成三維立方晶格'
  },
  'Ca+Cl': {
    product: 'CaCl₂',
    name: '氯化鈣',
    crystalType: '離子晶體',
    icon: '🧂',
    color: '#ff6eb4',
    equation: 'Ca + Cl₂ → CaCl₂',
    description: 'Ca 失去兩個電子形成 Ca²⁺，與兩個 Cl⁻ 以離子鍵結合，形成離子晶體。',
    properties: ['高熔點（772°C）', '易溶於水', '可做乾燥劑', '水溶液可導電'],
    structureHint: 'Ca²⁺ 與 Cl⁻ 以 1:2 比例交替排列'
  },
  'Ca+O': {
    product: 'CaO',
    name: '氧化鈣（生石灰）',
    crystalType: '離子晶體',
    icon: '🧂',
    color: '#ff6eb4',
    equation: '2Ca + O₂ → 2CaO',
    description: 'Ca²⁺ 與 O²⁻ 以離子鍵結合，由於離子電荷較高（+2 與 -2），庫侖力更強，熔點比 NaCl 更高。',
    properties: ['極高熔點（2613°C）', '強離子鍵', '可溶於水生成 Ca(OH)₂', '固態不導電'],
    structureHint: 'NaCl 型晶格結構，但離子鍵更強'
  },
  'Mg+O': {
    product: 'MgO',
    name: '氧化鎂',
    crystalType: '離子晶體',
    icon: '🧂',
    color: '#ff6eb4',
    equation: '2Mg + O₂ → 2MgO',
    description: 'Mg²⁺ 與 O²⁻ 以離子鍵結合，離子半徑小且電荷高，離子鍵極強，熔點為離子晶體中數一數二高的。',
    properties: ['極高熔點（2852°C）', '離子鍵極強', '不易溶於水', '可做耐火材料'],
    structureHint: 'NaCl 型晶格結構，鍵強度極高'
  },
  'Na+O': {
    product: 'Na₂O',
    name: '氧化鈉',
    crystalType: '離子晶體',
    icon: '🧂',
    color: '#ff6eb4',
    equation: '4Na + O₂ → 2Na₂O',
    description: 'Na 失去一個電子形成 Na⁺，而 O 獲得兩個電子形成 O²⁻，以 2:1 的比例組成離子晶體。',
    properties: ['高熔點', '溶於水生成 NaOH', '固態不導電', '強鹼性氧化物'],
    structureHint: 'Na⁺ 與 O²⁻ 以反螢石結構排列'
  },
  'K+Br': {
    product: 'KBr',
    name: '溴化鉀',
    crystalType: '離子晶體',
    icon: '🧂',
    color: '#ff6eb4',
    equation: '2K + Br₂ → 2KBr',
    description: 'K⁺ 與 Br⁻ 以離子鍵結合，與 NaCl 結構相似的離子晶體。',
    properties: ['高熔點（734°C）', '可溶於水', '固態不導電', '水溶液可導電'],
    structureHint: 'NaCl 型晶格結構'
  },
  'Na+F': {
    product: 'NaF',
    name: '氟化鈉',
    crystalType: '離子晶體',
    icon: '🧂',
    color: '#ff6eb4',
    equation: '2Na + F₂ → 2NaF',
    description: 'Na⁺ 與 F⁻ 以離子鍵結合。由於 F⁻ 半徑小，離子鍵相對較強，熔點高於 NaCl。',
    properties: ['高熔點（993°C）', '微溶於水', '牙膏成分', '毒性'],
    structureHint: 'NaCl 型晶格結構'
  },
  'Al+O': {
    product: 'Al₂O₃',
    name: '氧化鋁',
    crystalType: '離子晶體',
    icon: '🧂',
    color: '#ff6eb4',
    equation: '4Al + 3O₂ → 2Al₂O₃',
    description: 'Al³⁺ 與 O²⁻ 以強離子鍵結合（但帶有部分共價特性），熔點極高，自然界中以剛玉的形式存在。',
    properties: ['極高熔點（2072°C）', '極硬（莫氏硬度 9）', '不溶於水', '紅寶石、藍寶石的主要成分'],
    structureHint: '剛玉結構（六方最密堆積）'
  },
  'Na+S': {
    product: 'Na₂S',
    name: '硫化鈉',
    crystalType: '離子晶體',
    icon: '🧂',
    color: '#ff6eb4',
    equation: '2Na + S → Na₂S',
    description: 'Na⁺ 與 S²⁻ 以離子鍵結合，形成離子晶體。',
    properties: ['高熔點', '可溶於水', '水溶液呈鹼性', '有臭味'],
    structureHint: '反螢石結構'
  },

  // ── 共價網狀晶體 ──
  'C+C': {
    product: '鑽石 / 石墨',
    name: '碳同素異形體',
    crystalType: '共價網狀晶體',
    icon: '💎',
    color: '#a855f7',
    equation: 'C（碳原子排列方式不同）',
    description: '碳原子之間以共價鍵結合。sp³ 混成排列形成鑽石（三維網狀），sp² 混成排列則形成石墨（層狀結構，層間為凡德瓦力）。',
    properties: ['鑽石：極硬、不導電、熔點極高', '石墨：軟、層內可導電', '同素異形體', '鑽石為自然界最硬物質'],
    structureHint: '鑽石：四面體、sp³ / 石墨：六角平面、sp²'
  },
  'O+Si': {
    product: 'SiO₂',
    name: '二氧化矽（石英）',
    crystalType: '共價網狀晶體',
    icon: '🔮',
    color: '#a855f7',
    equation: 'Si + O₂ → SiO₂',
    description: '每個 Si 原子以 sp³ 混成與 4 個 O 原子形成共價鍵，每個 O 原子連接 2 個 Si 原子，構成延伸的三維共價網狀結構。SiO₂ 僅代表最簡比，不是分子式。',
    properties: ['極高熔點（≈1713°C）', '不溶於一般溶劑', '可被 HF 溶解', '硬度高（莫氏硬度 7）'],
    structureHint: 'Si-O 交替連結的三維網狀結構'
  },
  'Si+Si': {
    product: 'Si',
    name: '矽晶體',
    crystalType: '共價網狀晶體',
    icon: '💎',
    color: '#a855f7',
    equation: 'Si（矽原子以共價鍵連結）',
    description: '矽原子以 sp³ 混成形成四面體共價網狀結構，結構類似鑽石。矽是重要的半導體材料。',
    properties: ['高熔點（1414°C）', '半導體', '不溶於一般溶劑', '可用於晶片製造'],
    structureHint: '鑽石型四面體結構'
  },
  'C+Si': {
    product: 'SiC',
    name: '碳化矽',
    crystalType: '共價網狀晶體',
    icon: '💎',
    color: '#a855f7',
    equation: 'Si + C → SiC',
    description: 'Si 與 C 以共價鍵交替排列形成三維網狀結構，硬度極高，被用作砂紙和高溫材料。',
    properties: ['極高熔點（≈2730°C）', '極硬（莫氏硬度 ≈ 9.5）', '不導電', '耐高溫材料'],
    structureHint: 'Si 和 C 交替排列的鑽石型結構'
  },

  // ── 分子晶體 ──
  'C+O': {
    product: 'CO₂',
    name: '二氧化碳（乾冰）',
    crystalType: '分子晶體',
    icon: '❄️',
    color: '#22d3ee',
    equation: 'C + O₂ → CO₂',
    description: 'CO₂ 是由共價鍵組成的獨立分子，分子間僅靠凡德瓦力（倫敦分散力）維繫。固態 CO₂ 稱為乾冰，在常壓下直接昇華為氣體。',
    properties: ['低熔點（-78°C 昇華）', '不導電', '非極性分子', '分子間為凡德瓦力'],
    structureHint: '線形分子（O=C=O）以凡德瓦力排列'
  },
  'H+O': {
    product: 'H₂O',
    name: '水（冰）',
    crystalType: '分子晶體',
    icon: '❄️',
    color: '#22d3ee',
    equation: '2H₂ + O₂ → 2H₂O',
    description: 'H₂O 分子內為共價鍵，分子間靠氫鍵維繫。固態水（冰）為分子晶體，由於氫鍵形成有方向性的四面體結構，冰的密度反而比液態水小。',
    properties: ['低熔點（0°C）', '不導電', '分子間有氫鍵', '固態密度 < 液態密度'],
    structureHint: '四面體氫鍵網絡排列'
  },
  'H+Cl': {
    product: 'HCl',
    name: '氯化氫',
    crystalType: '分子晶體',
    icon: '❄️',
    color: '#22d3ee',
    equation: 'H₂ + Cl₂ → 2HCl',
    description: 'H 與 Cl 以共價鍵結合形成極性分子 HCl。固態 HCl 為分子晶體，分子間靠偶極-偶極力維繫。溶於水後形成鹽酸（強酸）。',
    properties: ['低熔點（-114°C）', '極性共價分子', '溶於水形成鹽酸', '氣態不導電，水溶液導電'],
    structureHint: '極性分子以偶極-偶極力排列'
  },
  'H+N': {
    product: 'NH₃',
    name: '氨',
    crystalType: '分子晶體',
    icon: '❄️',
    color: '#22d3ee',
    equation: 'N₂ + 3H₂ → 2NH₃',
    description: 'N 與 H 以共價鍵結合形成三角錐形分子，分子間有氫鍵。固態氨為分子晶體。',
    properties: ['低熔點（-78°C）', '極性分子', '分子間有氫鍵', '易溶於水呈弱鹼性'],
    structureHint: '三角錐形分子以氫鍵排列'
  },
  'H+S': {
    product: 'H₂S',
    name: '硫化氫',
    crystalType: '分子晶體',
    icon: '❄️',
    color: '#22d3ee',
    equation: 'H₂ + S → H₂S',
    description: 'H₂S 為彎曲形極性分子，分子間靠凡德瓦力維繫，熔沸點低。有臭蛋氣味。',
    properties: ['低熔點（-86°C）', '極性分子', '有毒', '有臭蛋味'],
    structureHint: '彎曲形分子以凡德瓦力排列'
  },
  'N+N': {
    product: 'N₂',
    name: '氮氣',
    crystalType: '分子晶體',
    icon: '❄️',
    color: '#22d3ee',
    equation: 'N + N → N₂（三鍵）',
    description: '兩個氮原子以三鍵（N≡N）結合形成 N₂ 分子。固態 N₂ 為分子晶體，分子間僅有微弱的凡德瓦力。',
    properties: ['極低熔點（-210°C）', '非極性分子', '不導電', '化學性質不活潑'],
    structureHint: '線形分子（N≡N）以凡德瓦力排列'
  },
  'Cl+H': {   // 別名，與 H+Cl 相同
    alias: 'H+Cl'
  },

  // ── 金屬晶體（金屬 + 金屬） ──
  'Cu+Cu': {
    product: 'Cu',
    name: '銅（金屬晶體）',
    crystalType: '金屬晶體',
    icon: '⚙️',
    color: '#f59e0b',
    equation: 'Cu（金屬鍵結合）',
    description: '銅原子釋出外層電子形成 Cu²⁺ 陽離子，電子形成「電子海」包圍所有陽離子。銅是優良的導電體和導熱體。',
    properties: ['中高熔點（1085°C）', '良好導電性', '延展性佳', '不溶於水'],
    structureHint: '面心立方最密堆積（FCC）'
  },
  'Fe+Fe': {
    product: 'Fe',
    name: '鐵（金屬晶體）',
    crystalType: '金屬晶體',
    icon: '⚙️',
    color: '#f59e0b',
    equation: 'Fe（金屬鍵結合）',
    description: '鐵原子以金屬鍵結合，形成體心立方（BCC）結構。鐵是最重要的工業金屬之一。',
    properties: ['高熔點（1538°C）', '良好導電性', '可磁化', '延展性佳'],
    structureHint: '體心立方（BCC）結構'
  },
  'Au+Au': {
    product: 'Au',
    name: '金（金屬晶體）',
    crystalType: '金屬晶體',
    icon: '⚙️',
    color: '#f59e0b',
    equation: 'Au（金屬鍵結合）',
    description: '金原子以金屬鍵結合，形成面心立方結構。金是延展性最好的金屬，化學性質非常穩定。',
    properties: ['高熔點（1064°C）', '優良導電性', '延展性極佳', '化學性質穩定'],
    structureHint: '面心立方最密堆積（FCC）'
  },
  'Na+Na': {
    product: 'Na',
    name: '鈉（金屬晶體）',
    crystalType: '金屬晶體',
    icon: '⚙️',
    color: '#f59e0b',
    equation: 'Na（金屬鍵結合）',
    description: '鈉原子以金屬鍵結合。由於只有一個價電子，金屬鍵相對較弱，熔點較低，質地柔軟。',
    properties: ['低熔點（98°C）', '質地柔軟', '可導電', '密度小、可浮於水'],
    structureHint: '體心立方（BCC）結構'
  },
  'Cu+Zn': {
    product: '黃銅（合金）',
    name: '黃銅（Cu-Zn 合金）',
    crystalType: '金屬晶體',
    icon: '⚙️',
    color: '#f59e0b',
    equation: 'Cu + Zn → 黃銅（合金，非化合物）',
    description: '銅與鋅的合金稱為黃銅，屬於金屬晶體。合金中原子大小不同，使得原子層不容易滑動，硬度比純金屬更高。',
    properties: ['比純銅更硬', '仍具良好導電性', '延展性較純銅低', '廣泛用於工業'],
    structureHint: '合金結構（原子隨機混合或有序排列）'
  },
  'Fe+C': {
    product: '鋼（合金）',
    name: '鋼（Fe-C 合金）',
    crystalType: '金屬晶體',
    icon: '⚙️',
    color: '#f59e0b',
    equation: 'Fe + C → 鋼（合金，碳含量 0.02-2.1%）',
    description: '鐵與少量碳形成的合金稱為鋼，碳原子嵌入鐵的晶格間隙中，阻止原子層滑動，因此鋼比純鐵硬得多。',
    properties: ['比純鐵更硬', '可導電', '延展性較純鐵低', '最重要的工業材料'],
    structureHint: '碳原子嵌入鐵的 BCC 或 FCC 晶格間隙'
  },
  'Ag+Ag': {
    product: 'Ag',
    name: '銀（金屬晶體）',
    crystalType: '金屬晶體',
    icon: '⚙️',
    color: '#f59e0b',
    equation: 'Ag（金屬鍵結合）',
    description: '銀原子以金屬鍵結合，是導電性最好的金屬。',
    properties: ['高熔點（962°C）', '導電性為所有金屬之冠', '延展性佳', '化學性質較穩定'],
    structureHint: '面心立方最密堆積（FCC）'
  }
};

// ====================================================================
// 查詢反應結果的函式
// 自動將兩個元素符號依字母排序後查詢，確保 Na+Cl = Cl+Na
// ====================================================================
function lookupReaction(symbol1, symbol2) {
  // 先依字母排序組合成 key
  const sorted = [symbol1, symbol2].sort();
  const key = sorted.join('+');

  // 查詢資料庫
  let result = REACTION_DATABASE[key];

  // 若查到別名（alias），再查一次
  if (result && result.alias) {
    result = REACTION_DATABASE[result.alias];
  }

  return result || null;
}

// ====================================================================
// 通用規則推斷：若資料庫中沒有該組合，根據元素類別推斷可能的晶體類型
// ====================================================================
function inferCrystalType(el1, el2) {
  const cat1 = el1.category;
  const cat2 = el2.category;

  // 兩個都是金屬 → 金屬晶體
  if (cat1 === 'metal' && cat2 === 'metal') {
    return {
      crystalType: '金屬晶體',
      icon: '⚙️',
      color: '#f59e0b',
      description: `${el1.name}（${el1.symbol}）與${el2.name}（${el2.symbol}）皆為金屬元素，兩者結合會形成金屬晶體（合金）。金屬晶體中，金屬陽離子被自由電子（電子海）包圍，具有良好的導電性與延展性。`,
      properties: ['具金屬鍵', '可導電', '有延展性', '合金硬度通常比純金屬高']
    };
  }

  // 一個金屬 + 一個非金屬 → 離子晶體（簡化規則）
  if ((cat1 === 'metal' && cat2 === 'nonmetal') ||
      (cat1 === 'nonmetal' && cat2 === 'metal')) {
    const metal = cat1 === 'metal' ? el1 : el2;
    const nonmetal = cat1 === 'nonmetal' ? el1 : el2;
    return {
      crystalType: '離子晶體',
      icon: '🧂',
      color: '#ff6eb4',
      description: `${metal.name}（${metal.symbol}）為金屬，${nonmetal.name}（${nonmetal.symbol}）為非金屬。金屬原子失去電子形成陽離子，非金屬原子獲得電子形成陰離子，兩者以離子鍵結合形成離子晶體。`,
      properties: ['高熔點', '固態不導電', '水溶液或熔融態可導電', '硬但脆']
    };
  }

  // 兩個都是非金屬 → 分子晶體（簡化規則，忽略共價網狀特殊情況）
  if (cat1 === 'nonmetal' && cat2 === 'nonmetal') {
    return {
      crystalType: '分子晶體',
      icon: '❄️',
      color: '#22d3ee',
      description: `${el1.name}（${el1.symbol}）與${el2.name}（${el2.symbol}）皆為非金屬，兩者以共價鍵結合形成分子，分子間以分子間作用力（凡德瓦力、氫鍵等）維繫，形成分子晶體。`,
      properties: ['低熔沸點', '不導電', '分子間作用力弱', '依極性決定溶解性']
    };
  }

  // 涉及類金屬 → 可能是共價網狀
  if (cat1 === 'metalloid' || cat2 === 'metalloid') {
    return {
      crystalType: '共價網狀晶體',
      icon: '💎',
      color: '#a855f7',
      description: `含有類金屬元素（如 Si），傾向以共價鍵形成延伸的三維網狀結構，屬於共價網狀晶體。`,
      properties: ['極高熔點', '極硬', '通常不導電', '不溶於一般溶劑']
    };
  }

  return null;
}

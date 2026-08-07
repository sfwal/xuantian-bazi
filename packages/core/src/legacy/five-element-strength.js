const ELEMENT_ORDER = ['木', '火', '土', '金', '水'];

const STEM_ELEMENT = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

const ELEMENT_GENERATE_MAP = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const ELEMENT_CONTROL_MAP = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' };

// 易算五行量化口径：月令决定明干分值，地支按本气/中气/余气拆分。
const MONTH_STEM_ELEMENT_STRENGTH = {
  寅: { 木: 1.14, 火: 1.2, 土: 1.06, 金: 1, 水: 1 },
  卯: { 木: 1.2, 火: 1.2, 土: 1, 金: 1, 水: 1 },
  辰: { 木: 1.1, 火: 1.06, 土: 1.1, 金: 1.1, 水: 1.04 },
  巳: { 木: 1, 火: 1.14, 土: 1.14, 金: 1.06, 水: 1.06 },
  午: { 木: 1, 火: 1.2, 土: 1.2, 金: 1, 水: 1 },
  未: { 木: 1.04, 火: 1.1, 土: 1.16, 金: 1.1, 水: 1 },
  申: { 木: 1.06, 火: 1, 土: 1, 金: 1.14, 水: 1.2 },
  酉: { 木: 1, 火: 1, 土: 1, 金: 1.2, 水: 1.2 },
  戌: { 木: 1, 火: 1.04, 土: 1.14, 金: 1.16, 水: 1.06 },
  亥: { 木: 1.2, 火: 1, 土: 1, 金: 1, 水: 1.14 },
  子: { 木: 1.2, 火: 1, 土: 1, 金: 1, 水: 1.2 },
  丑: { 木: 1.06, 火: 1, 土: 1.1, 金: 1.14, 水: 1.1 },
};

const BRANCH_ELEMENT_RATIOS = {
  子: { 水: 1 },
  丑: { 土: 0.5, 水: 0.3, 金: 0.2 },
  寅: { 木: 0.7, 火: 0.3 },
  卯: { 木: 1 },
  辰: { 土: 0.5, 木: 0.3, 水: 0.2 },
  巳: { 火: 0.7, 金: 0.3 },
  午: { 火: 1 },
  未: { 土: 0.5, 火: 0.3, 木: 0.2 },
  申: { 金: 0.7, 水: 0.3 },
  酉: { 金: 1 },
  戌: { 土: 0.5, 金: 0.3, 火: 0.2 },
  亥: { 水: 0.7, 木: 0.3 },
};

// 交界月令的少量干支分值不等于通用比例乘积，需使用原表值。
const STEM_STRENGTH_OVERRIDES = {
  巳: { 庚: 1 },
};
const BRANCH_SCORE_OVERRIDES = {
  辰: { 丑: { 金: 0.23 } },
  巳: { 辰: { 水: 0.2, 土: 0.6 }, 巳: { 火: 0.84, 金: 0.3 } },
  未: { 巳: { 火: 0.798 } },
  酉: { 丑: { 金: 0.248 } },
  戌: { 寅: { 火: 0.342 } },
};
const BRANCH_ELEMENT_STRENGTH_OVERRIDES = {
  亥: { 火: 1.06 },
};

function calculateFiveElementScores(pillars) {
  const monthBranch = pillars?.find((pillar) => pillar.type === 'month')?.diZhi
    || pillars?.[1]?.diZhi;
  const monthStrength = MONTH_STEM_ELEMENT_STRENGTH[monthBranch];
  if (!monthStrength || !Array.isArray(pillars) || pillars.length !== 4) return null;

  const scores = Object.fromEntries(ELEMENT_ORDER.map((element) => [element, 0]));
  for (const pillar of pillars) {
    const stemElement = STEM_ELEMENT[pillar.tianGan];
    if (stemElement) {
      scores[stemElement] += STEM_STRENGTH_OVERRIDES[monthBranch]?.[pillar.tianGan]
        ?? monthStrength[stemElement];
    }

    const ratios = BRANCH_ELEMENT_RATIOS[pillar.diZhi] || {};
    for (const [element, ratio] of Object.entries(ratios)) {
      scores[element] += BRANCH_SCORE_OVERRIDES[monthBranch]?.[pillar.diZhi]?.[element]
        ?? ratio * (BRANCH_ELEMENT_STRENGTH_OVERRIDES[monthBranch]?.[element]
          ?? monthStrength[element]);
    }
  }

  return Object.fromEntries(ELEMENT_ORDER.map((element) => [
    element,
    Number(scores[element].toFixed(3)),
  ]));
}

function analyzeFiveElementBalance(scores, dayMaster) {
  const dayMasterElement = STEM_ELEMENT[dayMaster] || dayMaster;
  const resourceElement = ELEMENT_ORDER.find(
    (element) => ELEMENT_GENERATE_MAP[element] === dayMasterElement
  ) || '';
  const outputElement = ELEMENT_GENERATE_MAP[dayMasterElement] || '';
  const wealthElement = ELEMENT_CONTROL_MAP[dayMasterElement] || '';
  const officerElement = ELEMENT_ORDER.find(
    (element) => ELEMENT_CONTROL_MAP[element] === dayMasterElement
  ) || '';
  const supportingElements = [resourceElement, dayMasterElement].filter(Boolean);
  const opposingElements = [outputElement, wealthElement, officerElement].filter(Boolean);
  const supportScore = supportingElements.reduce(
    (sum, element) => sum + (Number(scores?.[element]) || 0), 0
  );
  const opposingScore = opposingElements.reduce(
    (sum, element) => sum + (Number(scores?.[element]) || 0), 0
  );
  const totalScore = supportScore + opposingScore;
  const needsSupport = supportScore <= opposingScore;
  const byAscendingScore = (left, right) =>
    (Number(scores?.[left]) || 0) - (Number(scores?.[right]) || 0);

  return {
    dayMasterElement,
    supportingElements,
    opposingElements,
    supportScore: Number(supportScore.toFixed(3)),
    opposingScore: Number(opposingScore.toFixed(3)),
    supportRatio: totalScore ? supportScore / totalScore : 0.5,
    overallLabel: needsSupport ? '偏弱' : '偏旺',
    needsSupport,
    useful: [...(needsSupport ? supportingElements : opposingElements)].sort(byAscendingScore),
    unfavorable: [...(needsSupport ? opposingElements : supportingElements)].sort(byAscendingScore),
  };
}

module.exports = { ELEMENT_ORDER, calculateFiveElementScores, analyzeFiveElementBalance };

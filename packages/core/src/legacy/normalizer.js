const { TERMINOLOGY_VERSION, localizeChart, normalizeLocale } = require('./i18n/chartTerms');

/**
 * 标准化输出模块
 * 将排盘引擎原始结果转换为统一业务结构
 */

/**
 * 从 shunshi-bazi-core 结果提取四柱
 */
function extractPillars(baziChart) {
  const pillars = [];
  const types = ['year', 'month', 'day', 'hour'];
  const keys = ['年柱', '月柱', '日柱', '时柱'];
  const labels = ['年柱', '月柱', '日柱', '时柱'];

  const detail = baziChart['柱位详细'] || {};

  for (let i = 0; i < keys.length; i++) {
    const raw = detail[keys[i]] || {};
    const cangGanDetail = raw['藏干详情'] || [];
    const subStar = raw['副星'] || [];
    pillars.push({
      type: types[i],
      label: labels[i],
      ganZhi: raw['干支'] || '',
      tianGan: raw['天干'] || '',
      diZhi: raw['地支'] || '',
      cangGan: raw['藏干'] || [],
      cangGanDetail: cangGanDetail.map((item, index) => ({
        gan: item['干'] || item.gan || '',
        wuXing: item['五行'] || item.wuXing || '',
        shiShen: item['十神'] || item.shiShen || subStar[index] || '',
      })),
      naYin: raw['纳音'] || '',
      wuXing: raw['五行'] || '',
      mainStar: raw['主星'] || '',
      subStar,
      empty: raw['空亡'] || '',
      xingYun: raw['星运'] || '',
      ziZuo: raw['自坐'] || '',
    });
  }

  return pillars;
}

const TEN_GOD_ORDER = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];
const ZHI_ELEMENT_MAP = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};
const GAN_ELEMENT_MAP = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};
const ELEMENT_GENERATE_MAP = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const DAY_MASTER_ELEMENT_DESCRIPTIONS = {
  '木': '五行属木，重生发、规划与成长力。',
  '火': '五行属火，重表达、热情与行动力。',
  '土': '五行属土，重承载、稳定与整合力。',
  '金': '五行属金，重规则、判断与执行力。',
  '水': '五行属水，重观察、流动与应变力。',
};

function uniqueItems(items) {
  return [...new Set((items || []).map((item) => String(item || '').trim()).filter(Boolean))];
}

function supportsElement(source, target) {
  return source === target || ELEMENT_GENERATE_MAP[source] === target;
}

function formatPatternName(star) {
  if (!star) return '';
  if (star.endsWith('格') || star.includes('元')) return star;
  return `${star}格`;
}

function classifyShenSha(name, category) {
  if (['good', 'neutral', 'caution'].includes(category)) return category;
  const text = `${name || ''}${category || ''}`;
  if (text.includes('吉') || text.includes('贵人') || text.includes('福') || text.includes('德')) return 'good';
  if (text.includes('凶') || text.includes('煞') || text.includes('劫') || text.includes('灾') || text.includes('亡')) return 'caution';
  return 'neutral';
}

function buildTenGodLegend(tenGodSummary) {
  const countMap = new Map((tenGodSummary || []).map((item) => [item.name, item.count]));
  const extraNames = (tenGodSummary || []).map((item) => item.name).filter((name) => !TEN_GOD_ORDER.includes(name));
  const names = [...TEN_GOD_ORDER, ...extraNames];
  const total = (tenGodSummary || []).reduce((sum, item) => sum + item.count, 0);

  return names.map((name) => {
    const count = countMap.get(name) || 0;
    const percentage = total ? Number(((count / total) * 100).toFixed(2)) : 0;
    return { name, count, percentage };
  });
}

function buildShenShaGroups(shenShaItems) {
  const groups = [
    { key: 'good', icon: '吉', label: '吉神参考', items: [] },
    { key: 'neutral', icon: '平', label: '中性提示', items: [] },
    { key: 'caution', icon: '忌', label: '留意项', items: [] },
  ];

  for (const item of shenShaItems || []) {
    const group = groups.find((current) => current.key === classifyShenSha(item.name, item.category));
    if (group && !group.items.includes(item.name)) group.items.push(item.name);
  }

  return groups.filter((group) => group.items.length);
}

function attachShenShaToPillars(pillars, shenShaItems) {
  return (pillars || []).map((pillar) => ({
    ...pillar,
    shenSha: (shenShaItems || [])
      .filter((item) => item.pillar === pillar.type || item.pillar === pillar.label)
      .map((item) => item.name),
  }));
}

function inferPattern(pillars, dayMaster, dayMasterElement, fiveElementSummary) {
  const dmFe = (fiveElementSummary || []).find((f) => f.element === dayMasterElement);
  const strong = dmFe && dmFe.percentage >= 25;
  const mainStars = (pillars || []).map((p) => p.mainStar).filter(Boolean);
  if (mainStars.includes('正官') && mainStars.includes('正印')) return '官印相生格';
  if (mainStars.includes('食神') && mainStars.includes('正财')) return '食神生财格';
  if (mainStars.includes('七杀') && mainStars.includes('食神')) return '食神制杀格';
  if (mainStars.includes('伤官') && mainStars.includes('正印')) return '伤官佩印格';
  if (strong && mainStars.includes('正财')) return '身强财旺格';
  if (!strong && mainStars.includes('正印')) return '身弱印扶格';
  return strong ? '身强格' : '身弱格';
}

function buildPatternSummary(pillars, dayMaster, dayMasterElement, fiveElementSummary) {
  const monthPillar = pillars.find((p) => p.type === 'month') || {};
  const dayPillar = pillars.find((p) => p.type === 'day') || {};
  const monthStar = monthPillar.cangGanDetail?.[0]?.shiShen || monthPillar.subStar?.[0] || monthPillar.mainStar || '';
  const monthStemStar = monthPillar.mainStar || '';
  const dayStar = dayPillar.mainStar || '';
  const fallbackPattern = inferPattern(pillars, dayMaster, dayMasterElement, fiveElementSummary);
  const mainPattern = monthStar ? formatPatternName(monthStar) : fallbackPattern;
  const allStars = uniqueItems([
    monthStemStar,
    ...pillars.map((pillar) => pillar.mainStar),
    ...pillars.flatMap((pillar) => pillar.subStar || []),
  ]);
  const secondaryStars = uniqueItems(allStars.filter((star) => star && star !== monthStar).slice(0, 4));
  const talentTags = uniqueItems([monthStar, ...secondaryStars, dayStar].filter(Boolean)).slice(0, 6);
  const secondaryPatterns = secondaryStars.map(formatPatternName).filter(Boolean).slice(0, 3);
  const grade = mainPattern.includes('相生') || mainPattern.includes('生财') || secondaryPatterns.length >= 2 ? '中上格' : '参考格';
  const lines = [`主格局：以月令${monthPillar.diZhi || ''}中主气为先，当前更偏${mainPattern || '未定格局'}的成事路径。`];
  if (secondaryPatterns.length) lines.push(`次格局：${secondaryPatterns.join('、')}与主气相互呼应，形成辅助格局倾向。`);
  if (dayStar) lines.push(`日主落点：日柱自身呈现${dayStar}特征，会影响个人表达与处事方式。`);
  lines.push(`格局评价：${dayMaster}${dayPillar.diZhi || ''}主以结构平衡为重，实际成局更依赖喜用是否流通。`);

  return { mainPattern, grade, secondaryPatterns, talentTags, description: lines.join(' ') };
}

function buildDayMasterAnalysis(pillars, dayMaster, dayMasterElement, fiveElementSummary, useful, unfavorable) {
  const monthPillar = pillars.find((p) => p.type === 'month') || {};
  const dmFe = (fiveElementSummary || []).find((f) => f.element === dayMasterElement);
  const dmPercentage = dmFe?.percentage || 0;
  const monthElement = ZHI_ELEMENT_MAP[monthPillar.diZhi || ''] || monthPillar.wuXing || '';
  const rootCount = pillars.filter((pillar) => supportsElement(ZHI_ELEMENT_MAP[pillar.diZhi] || '', dayMasterElement)).length;
  const supportCount = pillars.filter((pillar) => supportsElement(GAN_ELEMENT_MAP[pillar.tianGan] || '', dayMasterElement)).length;
  const seasonScore = supportsElement(monthElement, dayMasterElement) ? 1 : -1;
  const rootScore = rootCount >= 2 ? 1 : rootCount === 1 ? 0 : -1;
  const supportScore = supportCount >= 2 ? 1 : supportCount === 1 ? 0 : -1;
  const totalScore = seasonScore + rootScore + supportScore + (dmPercentage >= 25 ? 1 : 0);
  const season = seasonScore > 0
    ? { label: '得令/失令', status: '得令', description: `以月令${monthPillar.diZhi || '-'}主气衡量，当前更偏得令。` }
    : { label: '得令/失令', status: '失令', description: `以月令${monthPillar.diZhi || '-'}主气衡量，当前更偏失令。` };
  const root = rootScore > 0
    ? { label: '得地/失地', status: '得地', description: '四支通根位置较足，综合根气后更偏得地。' }
    : rootScore === 0
      ? { label: '得地/失地', status: '半得地', description: '四支有一定根气承接，综合根气后更偏半得地。' }
      : { label: '得地/失地', status: '失地', description: '四支通根位置不足，综合根气后更偏失地。' };
  const support = supportScore > 0
    ? { label: '得势/失势', status: '得势', description: '天干同类与生扶力量较明显，整体更偏得势。' }
    : supportScore === 0
      ? { label: '得势/失势', status: '半得势', description: '天干有一定同类或生扶力量，整体更偏半得势。' }
      : { label: '得势/失势', status: '失势', description: '天干同类与生扶力量不足，整体更偏失势。' };
  const overallLabel = totalScore >= 2 ? '偏旺' : totalScore <= -1 ? '偏弱' : '中和';
  const lines = [`日主${dayMaster}（${dayMasterElement}），${DAY_MASTER_ELEMENT_DESCRIPTIONS[dayMasterElement] || '需结合全局判断。'}`];
  if (useful?.length) lines.push(`喜用神：${useful.join('、')}。`);
  if (unfavorable?.length) lines.push(`忌神：${unfavorable.join('、')}。`);

  return {
    dayMaster,
    element: dayMasterElement,
    elementDescription: `${dayMaster}${dayMasterElement}日主，${DAY_MASTER_ELEMENT_DESCRIPTIONS[dayMasterElement] || '需结合全局判断。'}`,
    season,
    root,
    support,
    overall: {
      label: overallLabel,
      description: `按月令、通根、透干与五行分值综合判断，整体接近${overallLabel}，宜重平衡。`,
    },
    content: lines.join(''),
  };
}

function buildUsefulElementSummary(useful, unfavorable) {
  return {
    useful,
    unfavorable,
    description: useful.length ? `喜用方向以${useful.join('、')}为主，用来调和日主强弱与五行流通。` : '当前暂无明确喜用神数据，需结合完整排盘继续判断。',
    caution: unfavorable.length ? `忌神侧重${unfavorable.join('、')}，相关能量过旺时需留意失衡。` : '当前暂无明确忌神数据。',
  };
}

function buildDayPillarSummary(pillars, dayMaster) {
  const pillar = pillars.find((p) => p.type === 'day');
  if (!pillar) return '';
  const parts = [`${pillar.ganZhi}日柱`, `日主为${pillar.tianGan || dayMaster || '-'}`];
  if (pillar.naYin) parts.push(`纳音为${pillar.naYin}`);
  if (pillar.mainStar) parts.push(`主星显示为${pillar.mainStar}`);
  if (pillar.xingYun) parts.push(`当前星运为${pillar.xingYun}`);
  if (pillar.empty) parts.push(`空亡信息为${pillar.empty}`);
  return `${parts.join('，')}。`;
}

function relationLabel(text) {
  if (text.includes('合')) return '相合';
  if (text.includes('冲')) return '相冲';
  if (text.includes('害')) return '相害';
  if (text.includes('刑')) return '相刑';
  if (text.includes('破')) return '相破';
  return '关系';
}

function relationTone(text) {
  if (text.includes('合') || text.includes('会')) return 'good';
  if (text.includes('冲') || text.includes('害') || text.includes('刑') || text.includes('破')) return 'caution';
  return 'neutral';
}

function buildRelationshipLines(kind, interactions, pillars) {
  const source = kind === 'gan' ? interactions.tianGan : interactions.diZhi;
  const lines = [];
  (source || []).forEach((item, index) => {
    const text = `${item.name || ''}${item.detail || ''}`;
    const matchedIndexes = pillars
      .map((pillar, pillarIndex) => ({ pillar, pillarIndex }))
      .filter(({ pillar }) => text.includes(kind === 'gan' ? pillar.tianGan : pillar.diZhi));
    if (matchedIndexes.length < 2) return;
    const start = matchedIndexes[0];
    const end = matchedIndexes[matchedIndexes.length - 1];
    if (start.pillarIndex === end.pillarIndex) return;
    lines.push({
      key: `${kind}-${index}`,
      label: relationLabel(text),
      startIndex: Math.min(start.pillarIndex, end.pillarIndex),
      endIndex: Math.max(start.pillarIndex, end.pillarIndex),
      startChar: start.pillarIndex < end.pillarIndex ? (kind === 'gan' ? start.pillar.tianGan : start.pillar.diZhi) : (kind === 'gan' ? end.pillar.tianGan : end.pillar.diZhi),
      endChar: start.pillarIndex < end.pillarIndex ? (kind === 'gan' ? end.pillar.tianGan : end.pillar.diZhi) : (kind === 'gan' ? start.pillar.tianGan : start.pillar.diZhi),
      kind,
      tone: relationTone(text),
    });
  });
  if (lines.length) return lines;

  const rules = kind === 'gan'
    ? [
      { pair: ['甲', '己'], label: '相合', tone: 'good' }, { pair: ['乙', '庚'], label: '相合', tone: 'good' },
      { pair: ['丙', '辛'], label: '相合', tone: 'good' }, { pair: ['丁', '壬'], label: '相合', tone: 'good' },
      { pair: ['戊', '癸'], label: '相合', tone: 'good' }, { pair: ['甲', '庚'], label: '相冲', tone: 'caution' },
      { pair: ['乙', '辛'], label: '相冲', tone: 'caution' }, { pair: ['丙', '壬'], label: '相冲', tone: 'caution' },
      { pair: ['丁', '癸'], label: '相冲', tone: 'caution' },
    ]
    : [
      { pair: ['子', '丑'], label: '相合', tone: 'good' }, { pair: ['寅', '亥'], label: '相合', tone: 'good' },
      { pair: ['卯', '戌'], label: '相合', tone: 'good' }, { pair: ['辰', '酉'], label: '相合', tone: 'good' },
      { pair: ['巳', '申'], label: '相合', tone: 'good' }, { pair: ['午', '未'], label: '相合', tone: 'good' },
      { pair: ['子', '午'], label: '相冲', tone: 'caution' }, { pair: ['丑', '未'], label: '相冲', tone: 'caution' },
      { pair: ['寅', '申'], label: '相冲', tone: 'caution' }, { pair: ['卯', '酉'], label: '相冲', tone: 'caution' },
      { pair: ['辰', '戌'], label: '相冲', tone: 'caution' }, { pair: ['巳', '亥'], label: '相冲', tone: 'caution' },
      { pair: ['子', '未'], label: '相害', tone: 'caution' }, { pair: ['丑', '午'], label: '相害', tone: 'caution' },
      { pair: ['寅', '巳'], label: '相害', tone: 'caution' }, { pair: ['卯', '辰'], label: '相害', tone: 'caution' },
      { pair: ['申', '亥'], label: '相害', tone: 'caution' }, { pair: ['酉', '戌'], label: '相害', tone: 'caution' },
    ];

  rules.forEach((rule, ruleIndex) => {
    const matched = pillars
      .map((pillar, pillarIndex) => ({ pillarIndex, char: kind === 'gan' ? pillar.tianGan : pillar.diZhi }))
      .filter((item) => rule.pair.includes(item.char));
    if (matched.length < 2) return;
    for (let firstIndex = 0; firstIndex < matched.length - 1; firstIndex++) {
      for (let secondIndex = firstIndex + 1; secondIndex < matched.length; secondIndex++) {
        const first = matched[firstIndex];
        const second = matched[secondIndex];
        if (first.char === second.char) continue;
        lines.push({
          key: `${kind}-fallback-${ruleIndex}-${first.pillarIndex}-${second.pillarIndex}`,
          label: rule.label,
          startIndex: Math.min(first.pillarIndex, second.pillarIndex),
          endIndex: Math.max(first.pillarIndex, second.pillarIndex),
          startChar: first.pillarIndex < second.pillarIndex ? first.char : second.char,
          endChar: first.pillarIndex < second.pillarIndex ? second.char : first.char,
          kind,
          tone: rule.tone,
        });
      }
    }
  });

  return lines;
}

function buildYinYang(pillars) {
  const yangGan = ['甲', '丙', '戊', '庚', '壬'];
  const yinGan = ['乙', '丁', '己', '辛', '癸'];
  const yangZhi = ['子', '寅', '辰', '午', '申', '戌'];
  const yinZhi = ['丑', '卯', '巳', '未', '酉', '亥'];
  const state = { tianGanYin: 0, tianGanYang: 0, diZhiYin: 0, diZhiYang: 0 };
  for (const p of pillars) {
    if (yangGan.includes(p.tianGan)) state.tianGanYang++;
    else if (yinGan.includes(p.tianGan)) state.tianGanYin++;
    if (yangZhi.includes(p.diZhi)) state.diZhiYang++;
    else if (yinZhi.includes(p.diZhi)) state.diZhiYin++;
  }
  const diff = state.tianGanYang + state.diZhiYang - state.tianGanYin - state.diZhiYin;
  let summary;
  if (Math.abs(diff) <= 1) {
    summary = { label: '阴阳较平', description: '阴阳分布整体较均衡，处理问题时兼具行动与稳健。', tags: ['平衡感', '稳中有进', '适应力'] };
  } else if (diff > 1) {
    summary = { label: '阳气偏显', description: '阳性力量更明显，行动直接、推进感较强，但需留意急躁。', tags: ['行动力', '外放', '决断感'] };
  } else {
    summary = { label: '阴气偏显', description: '阴性力量更明显，观察细致、节奏内敛，但需避免过度迟疑。', tags: ['洞察力', '内敛', '蓄势'] };
  }
  return { state, summary };
}

function buildPersonalityProfile(dayMaster, dayMasterElement, overallLabel, mainPattern, useful) {
  const usefulText = useful?.length ? useful.join('、') : '平衡';
  const overviewMap = {
    '甲': '正直仁德，积极向上，有领导力，如参天大树般坚韧。',
    '乙': '柔韧细腻，善于变通，富有同理心与艺术天赋。',
    '丙': '热情奔放，光明磊落，活力四射，富有感染力。',
    '丁': '温和细腻，心思缜密，富有耐心与坚持精神。',
    '戊': '厚重沉稳，诚信可靠，如山岳般稳重踏实。',
    '己': '谦和包容，善于谋划，富有耐心与服务精神。',
    '庚': '刚毅果断，勇于变革，富有决断力与正义感。',
    '辛': '精致敏锐，追求完美，富有艺术品味与独到眼光。',
    '壬': '智慧通达，善于应变，胸怀宽广，富有创造力。',
    '癸': '深沉内敛，洞察力强，富有智慧与直觉能力。',
  };
  const profiles = {
    '木': {
      base: `${dayMaster}日主更重原则与边界，遇事通常会先寻找稳定结构。`,
      advantage: `适合借助系统、资源与团队协作放大表现，优先参考${usefulText}。`,
      caution: '要避免信心不足、节奏过慢或过度依赖外界判断。',
    },
    '火': {
      base: `${dayMaster}日主表达感更强，处理问题倾向先点燃方向与热情。`,
      advantage: `适合在展示、传播、推动节奏中发挥优势，优先参考${usefulText}。`,
      caution: '要避免急于定论、情绪过热或持续消耗。',
    },
    '土': {
      base: `${dayMaster}日主重承载与稳定，做事更关注可落地和可持续。`,
      advantage: `适合整合资源、搭建秩序与长期经营，优先参考${usefulText}。`,
      caution: '要避免过度保守、反应变慢或压力内化。',
    },
    '金': {
      base: `${dayMaster}日主重规则与判断，遇事更容易先划清边界。`,
      advantage: `适合执行、管理、筛选与做关键决策，优先参考${usefulText}。`,
      caution: '要避免过度挑剔、锋芒过露或弹性不足。',
    },
    '水': {
      base: `${dayMaster}日主重观察与流动，遇事更擅长先收集信息。`,
      advantage: `适合研究、沟通、策略与变化环境，优先参考${usefulText}。`,
      caution: '要避免想得过多、迟疑反复或边界不清。',
    },
  };
  const profile = profiles[dayMasterElement] || {
    base: overviewMap[dayMaster] || '命主个性独特，需结合全局分析。',
    advantage: `适合结合${usefulText}调整节奏。`,
    caution: '提醒面需结合完整命盘继续判断。',
  };
  const resolvedPattern = mainPattern || '未定格局';
  const resolvedOverall = overallLabel || '待定';
  return {
    summary: `${dayMaster}日主属${dayMasterElement || '-'}，整体更偏${resolvedOverall}，格局主轴为${resolvedPattern}。基础判断为${dayMaster}${dayMasterElement}日主${resolvedOverall}，喜用更重${usefulText}。`,
    tags: [dayMasterElement, resolvedOverall, resolvedPattern].filter(Boolean),
    cards: [
      { title: '处事底色', description: profile.base },
      { title: '优势面', description: profile.advantage },
      { title: '提醒面', description: profile.caution },
    ],
  };
}

function buildZodiacProfile(zodiac) {
  const profiles = {
    '鼠': { title: '鼠命象', traits: [{ title: '机敏灵活', description: '善于捕捉变化，适合快速应对。' }, { title: '谋定后动', description: '重视信息积累，行动前会反复权衡。' }] },
    '牛': { title: '牛命象', traits: [{ title: '稳扎稳打', description: '重视长期积累，做事耐心踏实。' }, { title: '抗压持久', description: '面对压力时更能坚持到底。' }] },
    '虎': { title: '虎命象', traits: [{ title: '开拓进取', description: '行动力强，适合主动争取机会。' }, { title: '气势外放', description: '容易成为推动局面的人。' }] },
    '兔': { title: '兔命象', traits: [{ title: '细腻敏锐', description: '感知力强，善于处理关系细节。' }, { title: '柔中有韧', description: '不喜硬碰硬，更擅长迂回推进。' }] },
    '龙': { title: '龙命象', traits: [{ title: '格局开阔', description: '目标意识强，适合承担复杂任务。' }, { title: '自驱明显', description: '有较强向上心和掌控欲。' }] },
    '蛇': { title: '蛇命象', traits: [{ title: '洞察敏锐', description: '能快速抓到关键线索，判断常带直觉性。' }, { title: '节奏内敛', description: '不喜欢高噪音表达，更适合深思后出手。' }] },
    '马': { title: '马命象', traits: [{ title: '行动迅速', description: '执行启动快，适合动态环境。' }, { title: '自由感强', description: '不喜被过度束缚，重视空间感。' }] },
    '羊': { title: '羊命象', traits: [{ title: '温和协调', description: '重视氛围与关系平衡。' }, { title: '审美细腻', description: '对品质和感受有较高敏感度。' }] },
    '猴': { title: '猴命象', traits: [{ title: '灵活机变', description: '反应快，擅长寻找替代方案。' }, { title: '学习力强', description: '对新信息吸收快，适应力好。' }] },
    '鸡': { title: '鸡命象', traits: [{ title: '秩序清晰', description: '重视规则、效率与表达边界。' }, { title: '观察入微', description: '容易发现细节问题并做修正。' }] },
    '狗': { title: '狗命象', traits: [{ title: '责任感强', description: '重承诺，讲原则，做事有底线。' }, { title: '守护意识', description: '在关系中更愿意承担保护角色。' }] },
    '猪': { title: '猪命象', traits: [{ title: '包容厚道', description: '待人宽和，重视生活稳定感。' }, { title: '福气沉稳', description: '适合稳步积累，不宜过度急进。' }] },
  };
  return profiles[zodiac] || { title: zodiac ? `${zodiac}命象` : '生肖画像', traits: [] };
}

/**
 * 提取日主
 */
function extractDayMaster(baziChart) {
  const dm = baziChart['日主'] || '';
  const detail = baziChart['柱位详细'] || {};
  const dayPillar = detail['日柱'] || {};

  // 五行分值里有日主五行
  const wxFz = baziChart['五行分值'] || {};

  return {
    tianGan: dm,
    element: wxFz['日主五行'] || '',
    description: '',
  };
}

/**
 * 提取五行统计
 */
function extractFiveElements(baziChart) {
  const wxFz = baziChart['五行分值'] || {};
  const elements = ['木', '火', '土', '金', '水'];
  const summary = [];

  for (const el of elements) {
    const data = wxFz[el] || {};
    summary.push({
      element: el,
      score: data['分值'] ?? data.score ?? 0,
      percentage: data['占比'] ? parseInt(data['占比']) : 0,
    });
  }

  const total = summary.reduce((a, b) => a + b.score, 0) || 1;
  const sorted = [...summary].sort((a, b) => b.score - a.score);

  return {
    summary,
    total,
    strongest: sorted[0]?.element || '',
    weakest: sorted[sorted.length - 1]?.element || '',
    dayMasterElement: wxFz['日主五行'] || '',
  };
}

/**
 * 提取十神统计
 */
function extractTenGods(baziChart) {
  const detail = baziChart['柱位详细'] || {};
  const keys = ['年柱', '月柱', '日柱', '时柱'];
  const godNames = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];
  const counts = {};
  for (const name of godNames) {
    counts[name] = 0;
  }

  for (const key of keys) {
    const pillar = detail[key] || {};
    const mainStar = pillar['主星'] || '';
    if (mainStar && counts[mainStar] !== undefined) {
      counts[mainStar]++;
    }
    const subStars = pillar['副星'] || [];
    for (const ss of subStars) {
      if (counts[ss] !== undefined) {
        counts[ss]++;
      }
    }
  }

  const summary = godNames
    .filter((name) => counts[name] > 0)
    .map((name) => ({ name, count: counts[name] }));

  return { summary, counts };
}

/**
 * 五行相生判断
 */
function isGenerating(a, b) {
  const cycle = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  return cycle[a] === b;
}

/**
 * 提取喜用神/忌神
 */
function extractUsefulUnfavorable(fiveElements) {
  const summary = fiveElements.summary || [];
  const dayMasterElement = fiveElements.dayMasterElement || '';
  const sorted = [...summary].sort((a, b) => b.score - a.score);

  const dayMasterScore = summary.find((s) => s.element === dayMasterElement);
  const isWeak = dayMasterScore && dayMasterScore.percentage < 18;

  const useful = [];
  const unfavorable = [];

  if (isWeak) {
    for (const s of sorted) {
      if (s.element === dayMasterElement || isGenerating(s.element, dayMasterElement)) {
        useful.push(s.element);
      }
    }
    for (const s of sorted) {
      if (!useful.includes(s.element)) {
        unfavorable.push(s.element);
      }
    }
  } else {
    for (const s of sorted) {
      if (s.element !== dayMasterElement && !isGenerating(s.element, dayMasterElement)) {
        useful.push(s.element);
      }
    }
    for (const s of sorted) {
      if (!useful.includes(s.element)) {
        unfavorable.push(s.element);
      }
    }
  }

  return { useful, unfavorable };
}

/**
 * 提取刑冲合会
 */
function extractInteractions(baziChart) {
  const xchh = baziChart['刑冲合会'] || {};
  return {
    tianGan: xchh['天干'] || [],
    diZhi: xchh['地支'] || [],
  };
}

/**
 * 提取大运原始数据
 */
function extractDaYunList(baziChart) {
  const daYun = baziChart['大运'] || [];
  return daYun.map((dy) => ({
    startAge: dy['起始年龄'] || dy.startAge,
    endAge: dy['结束年龄'] || dy.endAge,
    startYear: dy['起始年份'] || dy.startYear,
    endYear: dy['结束年份'] || dy.endYear,
    ganZhi: dy['干支'] || dy.ganZhi,
    tianGan: dy['天干'] || dy.tianGan,
    diZhi: dy['地支'] || dy.diZhi,
    naYin: dy['纳音'] || dy.naYin,
    mainStar: dy['主星'] || dy.mainStar,
    cangGanShiShen: dy['藏干十神'] || dy.cangGanShiShen || [],
    ziZuo: dy['自坐'] || dy.ziZuo,
    xingYun: dy['星运'] || dy.xingYun,
    kongWang: dy['空亡'] || dy.kongWang,
  }));
}

function parseStartYunAge(text) {
  const match = String(text || '').match(/(\d+)\s*年\s*(\d+)\s*月\s*(\d+)\s*日/);
  if (!match) return null;
  return {
    startYear: Number(match[1]),
    startMonth: Number(match[2]),
    startDay: Number(match[3]),
  };
}

/**
 * 组装标准化命盘
 */
function normalize(rawResult, input) {
  const locale = normalizeLocale(input?.locale);
  const { core_chart: coreChart, cycles, shen_sha: shenSha, time_corrections: tc } = rawResult;

  // shunshi-bazi-core 返回格式: { 输入, 八字 }
  const baziChart = coreChart['八字'] || coreChart;
  const inputEcho = coreChart['输入'] || {};

  // 基础提取
  const pillars = extractPillars(baziChart);
  const fiveElements = extractFiveElements(baziChart);
  const tenGods = extractTenGods(baziChart);
  const dayMaster = extractDayMaster(baziChart);
  const { useful, unfavorable } = extractUsefulUnfavorable(fiveElements);
  const interactions = extractInteractions(baziChart);
  const daYunList = extractDaYunList(baziChart);

  // 四柱干支
  const bzPillars = (baziChart['四柱'] || '').split(' ');

  // 转换大运/流年/流月
  const decadeCycles = (cycles?.decade_cycles || []).map((dc) => ({
    label: dc.label,
    value: dc.value,
    sub_value: dc.sub_value,
    active: dc.active || false,
    start_age: dc.startAge,
    start_year: dc.startYear,
    end_year: dc.endYear,
    yearly_cycles: dc.yearly_cycles || [],
    monthly_cycles: dc.monthly_cycles || {},
  }));

  const allYearlyCycles = [];
  for (const dc of cycles?.decade_cycles || []) {
    if (dc.yearly_cycles) {
      for (const yc of dc.yearly_cycles) {
        if (!allYearlyCycles.find((e) => e.value === yc.value)) {
          allYearlyCycles.push(yc);
        }
      }
    }
  }

  // 起运信息
  const startYunDesc = baziChart['起运'] || '';
  const startYun = parseStartYunAge(startYunDesc) || cycles?.start_yun || {};

  const shenShaInsights = (shenSha?.shenShaItems || []).map((s) => ({
    name: String(s.name || ''),
    pillar: s.pillar || '',
    pillar_label: s.pillar_label || '',
    category: s.category || '',
    luck_level: s.luck_level ?? 0,
  }));
  const pillarsWithShenSha = attachShenShaToPillars(pillars, shenShaInsights);

  const tenGodLegend = buildTenGodLegend(tenGods.summary);
  const patternSummary = buildPatternSummary(pillarsWithShenSha, dayMaster.tianGan, dayMaster.element, fiveElements.summary);
  const dayMasterAnalysis = buildDayMasterAnalysis(pillarsWithShenSha, dayMaster.tianGan, dayMaster.element, fiveElements.summary, useful, unfavorable);
  const usefulElementSummary = buildUsefulElementSummary(useful, unfavorable);
  const yinYang = buildYinYang(pillars);
  const zodiac = baziChart['生肖'] || '';

  // 真太阳时
  const trueSolarDatetime = tc?.true_solar?.trueSolarDateTime || rawResult.chart_datetime || null;
  const solarDatetime = rawResult.solar_datetime || `${input.birth_date}T${input.birth_time}:00`;

  const normalized = {
    // 基础标识
    profile_name: input.name || '',
    profile_gender: input.gender,
    calendar_type: input.calendar_type,
    birth_date: input.birth_date,
    birth_time: input.birth_time,

    // 时间信息
    solar_datetime: solarDatetime,
    lunar_datetime: baziChart['农历'] || '',
    true_solar_datetime: trueSolarDatetime,

    // 四柱
    year_pillar: bzPillars[0] || '',
    month_pillar: bzPillars[1] || '',
    day_pillar: bzPillars[2] || '',
    hour_pillar: bzPillars[3] || '',

    // 日主
    day_master: dayMaster.tianGan,
    day_master_element: dayMaster.element,

    // 生肖
    zodiac,
    zodiac_profile: buildZodiacProfile(zodiac),

    // 命宫/身宫/胎元/胎息
    ming_gong: baziChart['命宫'] || '',
    shen_gong: baziChart['身宫'] || '',
    tai_yuan: baziChart['胎元'] || '',
    tai_xi: baziChart['胎息'] || '',

    // 起运
    start_yun_desc: startYunDesc,
    start_yun_date: baziChart['起运日期'] || '',
    start_yun_year: startYun.startYear ?? null,
    start_yun_month: startYun.startMonth ?? null,
    start_yun_day: startYun.startDay ?? null,

    // 详细结构
    pillars: pillarsWithShenSha,
    five_elements_summary: fiveElements.summary,
    ten_gods_summary: tenGods.summary,
    ten_god_legend: tenGodLegend,
    dominant_ten_gods: tenGodLegend
      .filter((item) => item.count > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3),
    useful_elements: useful,
    unfavorable_elements: unfavorable,
    useful_element_summary: usefulElementSummary,
    interactions,
    relationship_graph_lines: {
      gan: buildRelationshipLines('gan', interactions, pillarsWithShenSha),
      zhi: buildRelationshipLines('zhi', interactions, pillarsWithShenSha),
    },

    // 页面分析卡片所需派生字段（统一由引擎计算）
    pattern: patternSummary.mainPattern,
    pattern_summary: patternSummary,
    day_master_analysis: dayMasterAnalysis,
    personality_profile: buildPersonalityProfile(dayMaster.tianGan, dayMaster.element, dayMasterAnalysis.overall.label, patternSummary.mainPattern, useful),
    day_pillar_summary: buildDayPillarSummary(pillarsWithShenSha, dayMaster.tianGan),
    yin_yang_state: yinYang.state,
    yin_yang_summary: yinYang.summary,

    // 大运原始数据
    da_yun_list: daYunList,

    // 运势链（来自 lunar-javascript）
    decade_cycles: decadeCycles,
    yearly_cycles: allYearlyCycles,
    monthly_cycles: {},
    daily_cycles: {},

    // 神煞
    shen_sha_insights: shenShaInsights,
    shen_sha_groups: buildShenShaGroups(shenShaInsights),

    // 时间修正记录
    time_corrections: {
      dst_applied: tc?.dst?.dstApplied || false,
      dst_minutes: tc?.dst?.dstMinutes || 0,
      true_solar_applied: tc?.true_solar?.trueSolarApplied || false,
      true_solar_correction_minutes: tc?.true_solar?.correctionMinutes || 0,
      true_solar_source: tc?.true_solar?.source || '',
    },

    // 元信息
    engine_version: 'v1.1',
    locale,
    terminology_version: TERMINOLOGY_VERSION,
    created_at: new Date().toISOString(),
  };

  return localizeChart(normalized, locale);
}

module.exports = { normalize };

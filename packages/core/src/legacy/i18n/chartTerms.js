const SUPPORTED_LOCALES = ['zh-CN', 'zh-TW', 'en'];
const DEFAULT_LOCALE = 'zh-CN';
const TERMINOLOGY_VERSION = '2026.07-chart-i18n-v2';

const stems = {
  甲: { zhCN: '甲', en: 'Jia' }, 乙: { zhCN: '乙', en: 'Yi' }, 丙: { zhCN: '丙', en: 'Bing' }, 丁: { zhCN: '丁', en: 'Ding' }, 戊: { zhCN: '戊', en: 'Wu' },
  己: { zhCN: '己', en: 'Ji' }, 庚: { zhCN: '庚', en: 'Geng' }, 辛: { zhCN: '辛', en: 'Xin' }, 壬: { zhCN: '壬', en: 'Ren' }, 癸: { zhCN: '癸', en: 'Gui' },
};

const branches = {
  子: { zhCN: '子', en: 'Zi' }, 丑: { zhCN: '丑', en: 'Chou' }, 寅: { zhCN: '寅', en: 'Yin' }, 卯: { zhCN: '卯', en: 'Mao' }, 辰: { zhCN: '辰', en: 'Chen' }, 巳: { zhCN: '巳', en: 'Si' },
  午: { zhCN: '午', en: 'Wu' }, 未: { zhCN: '未', en: 'Wei' }, 申: { zhCN: '申', en: 'Shen' }, 酉: { zhCN: '酉', en: 'You' }, 戌: { zhCN: '戌', en: 'Xu' }, 亥: { zhCN: '亥', en: 'Hai' },
};

const elements = {
  木: { zhCN: '木', en: 'Wood' }, 火: { zhCN: '火', en: 'Fire' }, 土: { zhCN: '土', en: 'Earth' }, 金: { zhCN: '金', en: 'Metal' }, 水: { zhCN: '水', en: 'Water' },
};

const tenGods = {
  比肩: { zhCN: '比肩', en: 'Peer' }, 劫财: { zhCN: '劫财', zhTW: '劫財', en: 'Rob Wealth' }, 食神: { zhCN: '食神', en: 'Eating God' },
  伤官: { zhCN: '伤官', zhTW: '傷官', en: 'Hurting Officer' }, 偏财: { zhCN: '偏财', zhTW: '偏財', en: 'Indirect Wealth' }, 正财: { zhCN: '正财', zhTW: '正財', en: 'Direct Wealth' },
  七杀: { zhCN: '七杀', zhTW: '七殺', en: 'Seven Killings' }, 正官: { zhCN: '正官', en: 'Direct Officer' }, 偏印: { zhCN: '偏印', en: 'Indirect Resource' }, 正印: { zhCN: '正印', en: 'Direct Resource' },
  元女: { zhCN: '元女', en: 'Day Master Woman' }, 元男: { zhCN: '元男', en: 'Day Master Man' },
};

const pillars = {
  年柱: { zhCN: '年柱', en: 'Year Pillar' }, 月柱: { zhCN: '月柱', en: 'Month Pillar' }, 日柱: { zhCN: '日柱', en: 'Day Pillar' }, 时柱: { zhCN: '时柱', zhTW: '時柱', en: 'Hour Pillar' },
  year: { zhCN: '年柱', en: 'Year Pillar' }, month: { zhCN: '月柱', en: 'Month Pillar' }, day: { zhCN: '日柱', en: 'Day Pillar' }, hour: { zhCN: '时柱', zhTW: '時柱', en: 'Hour Pillar' },
};

const growthStages = {
  长生: { zhCN: '长生', zhTW: '長生', en: 'Birth' }, 沐浴: { zhCN: '沐浴', en: 'Bath' }, 冠带: { zhCN: '冠带', zhTW: '冠帶', en: 'Crowning' }, 临官: { zhCN: '临官', zhTW: '臨官', en: 'Prosperity' },
  帝旺: { zhCN: '帝旺', en: 'Peak' }, 衰: { zhCN: '衰', en: 'Decline' }, 病: { zhCN: '病', en: 'Sickness' }, 死: { zhCN: '死', en: 'Death' }, 墓: { zhCN: '墓', en: 'Tomb' },
  绝: { zhCN: '绝', zhTW: '絕', en: 'Extinction' }, 胎: { zhCN: '胎', en: 'Conception' }, 养: { zhCN: '养', zhTW: '養', en: 'Nurturing' },
};

const naYinTerms = {
  海中金: { zhCN: '海中金', en: 'Metal in the Sea' }, 炉中火: { zhCN: '炉中火', zhTW: '爐中火', en: 'Fire in the Furnace' }, 大林木: { zhCN: '大林木', en: 'Great Forest Wood' },
  路旁土: { zhCN: '路旁土', en: 'Roadside Earth' }, 剑锋金: { zhCN: '剑锋金', zhTW: '劍鋒金', en: 'Sword Edge Metal' }, 山头火: { zhCN: '山头火', zhTW: '山頭火', en: 'Mountain Top Fire' },
  涧下水: { zhCN: '涧下水', zhTW: '澗下水', en: 'Stream Water' }, 城头土: { zhCN: '城头土', zhTW: '城頭土', en: 'City Wall Earth' }, 白蜡金: { zhCN: '白蜡金', zhTW: '白蠟金', en: 'White Wax Metal' },
  杨柳木: { zhCN: '杨柳木', zhTW: '楊柳木', en: 'Willow Wood' }, 泉中水: { zhCN: '泉中水', en: 'Spring Water' }, 屋上土: { zhCN: '屋上土', en: 'Roof Earth' },
  霹雳火: { zhCN: '霹雳火', zhTW: '霹靂火', en: 'Thunderbolt Fire' }, 松柏木: { zhCN: '松柏木', en: 'Pine Cypress Wood' }, 长流水: { zhCN: '长流水', zhTW: '長流水', en: 'Long Flowing Water' },
  沙中金: { zhCN: '沙中金', en: 'Sand Metal' }, 山下火: { zhCN: '山下火', en: 'Fire Under Mountain' }, 平地木: { zhCN: '平地木', en: 'Flatland Wood' },
  壁上土: { zhCN: '壁上土', en: 'Wall Earth' }, 金箔金: { zhCN: '金箔金', en: 'Gold Foil Metal' }, 覆灯火: { zhCN: '覆灯火', zhTW: '覆燈火', en: 'Lamp Fire' },
  天河水: { zhCN: '天河水', en: 'Milky Way Water' }, 大驿土: { zhCN: '大驿土', zhTW: '大驛土', en: 'Post Station Earth' }, 钗钏金: { zhCN: '钗钏金', zhTW: '釵釧金', en: 'Jewelry Metal' },
  桑柘木: { zhCN: '桑柘木', en: 'Mulberry Wood' }, 大溪水: { zhCN: '大溪水', en: 'Great Stream Water' }, 沙中土: { zhCN: '沙中土', en: 'Sand Earth' },
  天上火: { zhCN: '天上火', en: 'Heavenly Fire' }, 石榴木: { zhCN: '石榴木', en: 'Pomegranate Wood' }, 大海水: { zhCN: '大海水', en: 'Great Sea Water' },
};

const zodiac = {
  鼠: { zhCN: '鼠', en: 'Rat' }, 牛: { zhCN: '牛', en: 'Ox' }, 虎: { zhCN: '虎', en: 'Tiger' }, 兔: { zhCN: '兔', en: 'Rabbit' }, 龙: { zhCN: '龙', zhTW: '龍', en: 'Dragon' }, 蛇: { zhCN: '蛇', en: 'Snake' },
  马: { zhCN: '马', zhTW: '馬', en: 'Horse' }, 羊: { zhCN: '羊', en: 'Goat' }, 猴: { zhCN: '猴', en: 'Monkey' }, 鸡: { zhCN: '鸡', zhTW: '雞', en: 'Rooster' }, 狗: { zhCN: '狗', en: 'Dog' }, 猪: { zhCN: '猪', zhTW: '豬', en: 'Pig' },
};

const relationships = {
  相合: { zhCN: '相合', zhTW: '相合', en: 'Combination' }, 相冲: { zhCN: '相冲', zhTW: '相沖', en: 'Clash' }, 相害: { zhCN: '相害', en: 'Harm' }, 相刑: { zhCN: '相刑', en: 'Penalty' }, 相破: { zhCN: '相破', en: 'Break' }, 关系: { zhCN: '关系', zhTW: '關係', en: 'Relation' },
};

const statuses = {
  得令: { zhCN: '得令', en: 'In Season' }, 失令: { zhCN: '失令', en: 'Out of Season' }, 得地: { zhCN: '得地', en: 'Rooted' }, 半得地: { zhCN: '半得地', en: 'Partly Rooted' }, 失地: { zhCN: '失地', en: 'Unrooted' },
  得势: { zhCN: '得势', zhTW: '得勢', en: 'Supported' }, 半得势: { zhCN: '半得势', zhTW: '半得勢', en: 'Partly Supported' }, 失势: { zhCN: '失势', zhTW: '失勢', en: 'Unsupported' }, 偏旺: { zhCN: '偏旺', en: 'Relatively Strong' },
  偏弱: { zhCN: '偏弱', en: 'Relatively Weak' }, 中和: { zhCN: '中和', en: 'Balanced' }, 待定: { zhCN: '待定', en: 'Pending' }, 中上格: { zhCN: '中上格', en: 'Above-average Pattern' }, 参考格: { zhCN: '参考格', zhTW: '參考格', en: 'Reference Pattern' },
};

const misc = {
  吉神参考: { zhCN: '吉神参考', zhTW: '吉神參考', en: 'Auspicious Shen Sha' }, 中性提示: { zhCN: '中性提示', en: 'Neutral Notes' }, 留意项: { zhCN: '留意项', zhTW: '留意項', en: 'Caution Items' },
  吉: { zhCN: '吉', en: 'Auspicious' }, 平: { zhCN: '平', en: 'Neutral' }, 忌: { zhCN: '忌', en: 'Caution' }, 生肖画像: { zhCN: '生肖画像', zhTW: '生肖畫像', en: 'Zodiac Profile' },
};

const shenSha = {
  天乙贵人: { zhCN: '天乙贵人', zhTW: '天乙貴人', en: 'Tianyi Nobleman' }, 太极贵人: { zhCN: '太极贵人', zhTW: '太極貴人', en: 'Taiji Nobleman' }, 文昌贵人: { zhCN: '文昌贵人', zhTW: '文昌貴人', en: 'Wenchang Nobleman' }, 文星贵人: { zhCN: '文星贵人', zhTW: '文星貴人', en: 'Literary Star Nobleman' },
  国印贵人: { zhCN: '国印贵人', zhTW: '國印貴人', en: 'National Seal Nobleman' }, 天印贵人: { zhCN: '天印贵人', zhTW: '天印貴人', en: 'Heavenly Seal Nobleman' }, 天厨贵人: { zhCN: '天厨贵人', zhTW: '天廚貴人', en: 'Heavenly Kitchen Nobleman' }, 福星贵人: { zhCN: '福星贵人', zhTW: '福星貴人', en: 'Fortune Star Nobleman' },
  月德贵人: { zhCN: '月德贵人', zhTW: '月德貴人', en: 'Moon Virtue Nobleman' }, 天德贵人: { zhCN: '天德贵人', zhTW: '天德貴人', en: 'Heavenly Virtue Nobleman' }, 天德: { zhCN: '天德', en: 'Heavenly Virtue' }, 月德: { zhCN: '月德', en: 'Moon Virtue' },
  天德合: { zhCN: '天德合', en: 'Heavenly Virtue Combination' }, 月德合: { zhCN: '月德合', en: 'Moon Virtue Combination' }, 德: { zhCN: '德', en: 'Virtue' }, 将星: { zhCN: '将星', zhTW: '將星', en: 'General Star' }, 华盖: { zhCN: '华盖', zhTW: '華蓋', en: 'Elegant Canopy' },
  桃花: { zhCN: '桃花', en: 'Peach Blossom' }, 红鸾: { zhCN: '红鸾', zhTW: '紅鸞', en: 'Red Matchmaker' }, 孤鸾: { zhCN: '孤鸾', zhTW: '孤鸞', en: 'Solitary Phoenix' }, 天喜: { zhCN: '天喜', en: 'Heavenly Happiness' }, 驿马: { zhCN: '驿马', zhTW: '驛馬', en: 'Traveling Horse' },
  禄神: { zhCN: '禄神', zhTW: '祿神', en: 'Salary Star' }, 羊刃: { zhCN: '羊刃', en: 'Goat Blade' }, 劫煞: { zhCN: '劫煞', en: 'Robbery Sha' }, 勾煞: { zhCN: '勾煞', en: 'Hook Sha' }, 灾煞: { zhCN: '灾煞', zhTW: '災煞', en: 'Disaster Sha' }, 亡神: { zhCN: '亡神', en: 'Death Spirit' },
  孤辰: { zhCN: '孤辰', en: 'Solitary Star' }, 寡宿: { zhCN: '寡宿', en: 'Widow Star' }, 红艳: { zhCN: '红艳', zhTW: '紅艷', en: 'Red Charm' }, 流霞: { zhCN: '流霞', en: 'Flowing Glow' }, 阴差阳错: { zhCN: '阴差阳错', zhTW: '陰差陽錯', en: 'Yin-Yang Mismatch' },
  魁罡: { zhCN: '魁罡', en: 'Kuigang' }, 十恶大败: { zhCN: '十恶大败', zhTW: '十惡大敗', en: 'Ten Evils Defeat' }, 天医: { zhCN: '天医', zhTW: '天醫', en: 'Heavenly Doctor' }, 天罗: { zhCN: '天罗', zhTW: '天羅', en: 'Heavenly Net' }, 地网: { zhCN: '地网', zhTW: '地網', en: 'Earthly Net' },
  披麻: { zhCN: '披麻', en: 'Mourning Robe' }, 吊客: { zhCN: '吊客', en: 'Funeral Guest' }, 丧门: { zhCN: '丧门', zhTW: '喪門', en: 'Mourning Gate' }, 病符: { zhCN: '病符', en: 'Illness Talisman' }, 空亡: { zhCN: '空亡', en: 'Void' },
  金舆: { zhCN: '金舆', zhTW: '金輿', en: 'Golden Carriage' }, 学堂: { zhCN: '学堂', zhTW: '學堂', en: 'Study Hall' }, 词馆: { zhCN: '词馆', zhTW: '詞館', en: 'Ci Hall' }, 天赦: { zhCN: '天赦', en: 'Heavenly Pardon' }, 咸池: { zhCN: '咸池', en: 'Xianchi' },
  秀: { zhCN: '秀', en: 'Elegance Star' }, 墓: { zhCN: '墓', en: 'Tomb' }, 时墓: { zhCN: '时墓', zhTW: '時墓', en: 'Hour Tomb' }, 坦城: { zhCN: '坦城', en: 'Tancheng' }, 垣城: { zhCN: '垣城', en: 'Wall City' },
};

const categoryMaps = {
  stem: stems, branch: branches, element: elements, tenGod: tenGods, pillar: pillars, growthStage: growthStages, naYin: naYinTerms, zodiac, relationship: relationships, status: statuses, shenSha, misc,
};

const zhTWTextReplacements = [
  ['时', '時'], ['纳', '納'], ['长', '長'], ['龙', '龍'], ['马', '馬'], ['鸡', '雞'], ['猪', '豬'], ['财', '財'], ['伤', '傷'], ['杀', '殺'], ['冲', '沖'], ['阴', '陰'], ['阳', '陽'],
  ['运', '運'], ['应', '應'], ['稳', '穩'], ['发', '發'], ['虑', '慮'], ['过', '過'], ['与', '與'], ['为', '為'], ['处', '處'], ['构', '構'], ['众', '眾'], ['节', '節'], ['权', '權'], ['积', '積'],
  ['调', '調'], ['认', '認'], ['实', '實'], ['数', '數'], ['据', '據'], ['个', '個'], ['点', '點'], ['体', '體'], ['势', '勢'], ['强', '強'], ['复', '複'], ['观', '觀'], ['关', '關'],
  ['显', '顯'], ['项', '項'], ['参', '參'], ['较', '較'], ['气', '氣'], ['质', '質'], ['稳', '穩'], ['图', '圖'], ['层', '層'], ['灵', '靈'], ['转', '轉'], ['线', '線'],
  ['当', '當'], ['径', '徑'], ['辅', '輔'], ['倾', '傾'], ['现', '現'], ['响', '響'], ['达', '達'], ['评', '評'], ['结', '結'], ['际', '際'], ['赖', '賴'], ['义', '義'], ['别', '別'], ['动', '動'], ['会', '會'], ['征', '徵'], ['价', '價'],
];

const englishTextMap = new Map([
  ['五行属木，重生发、规划与成长力。', 'The element is Wood, emphasizing growth, planning, and development.'],
  ['五行属火，重表达、热情与行动力。', 'The element is Fire, emphasizing expression, passion, and action.'],
  ['五行属土，重承载、稳定与整合力。', 'The element is Earth, emphasizing support, stability, and integration.'],
  ['五行属金，重规则、判断与执行力。', 'The element is Metal, emphasizing rules, judgment, and execution.'],
  ['五行属水，重观察、流动与应变力。', 'The element is Water, emphasizing observation, flow, and adaptability.'],
  ['需结合全局判断。', 'Requires interpretation with the full chart.'],
  ['当前暂无明确喜用神数据，需结合完整排盘继续判断。', 'No clear Favorable Elements are available yet; interpret with the complete BaZi chart.'],
  ['当前暂无明确忌神数据。', 'No clear Unfavorable Elements are available yet.'],
  ['处事底色', 'Core Disposition'], ['优势面', 'Strengths'], ['提醒面', 'Cautions'],
  ['阴阳较平', 'Balanced Yin-Yang'], ['阳气偏显', 'Yang More Prominent'], ['阴气偏显', 'Yin More Prominent'],
  ['阴阳分布整体较均衡，处理问题时兼具行动与稳健。', 'The Yin-Yang distribution is generally balanced, combining action with steadiness when handling matters.'],
  ['阳性力量更明显，行动直接、推进感较强，但需留意急躁。', 'Yang energy is more prominent, bringing direct action and strong momentum, while impatience needs attention.'],
  ['阴性力量更明显，观察细致、节奏内敛，但需避免过度迟疑。', 'Yin energy is more prominent, bringing careful observation and a reserved pace, while over-hesitation should be avoided.'],
  ['平衡感', 'Balance'], ['稳中有进', 'Steady Progress'], ['适应力', 'Adaptability'], ['行动力', 'Action'], ['外放', 'Expressive'], ['决断感', 'Decisive'], ['洞察力', 'Insight'], ['内敛', 'Reserved'], ['蓄势', 'Building Momentum'],
  ['机敏灵活', 'Agile and Quick-Witted'], ['善于捕捉变化，适合快速应对。', 'Good at catching changes and responding quickly.'], ['谋定后动', 'Plan Before Acting'], ['重视信息积累，行动前会反复权衡。', 'Values information gathering and weighs options before acting.'],
  ['稳扎稳打', 'Steady and Practical'], ['重视长期积累，做事耐心踏实。', 'Values long-term accumulation and works with patience and practicality.'], ['抗压持久', 'Resilient Under Pressure'], ['面对压力时更能坚持到底。', 'More able to persist through pressure.'],
  ['开拓进取', 'Pioneering and Proactive'], ['行动力强，适合主动争取机会。', 'Strong drive, suited to actively pursuing opportunities.'], ['气势外放', 'Expansive Presence'], ['容易成为推动局面的人。', 'Often becomes the person who moves situations forward.'],
  ['细腻敏锐', 'Delicate and Perceptive'], ['感知力强，善于处理关系细节。', 'Highly perceptive and good at handling relationship details.'], ['柔中有韧', 'Soft Yet Resilient'], ['不喜硬碰硬，更擅长迂回推进。', 'Dislikes head-on conflict and is better at indirect progress.'],
  ['格局开阔', 'Broad Pattern'], ['目标意识强，适合承担复杂任务。', 'Goal-oriented and suited to taking on complex tasks.'], ['自驱明显', 'Strong Self-Drive'], ['有较强向上心和掌控欲。', 'Shows strong ambition and a desire for control.'],
  ['洞察敏锐', 'Sharp Insight'], ['能快速抓到关键线索，判断常带直觉性。', 'Quickly identifies key clues, with judgment often guided by intuition.'], ['节奏内敛', 'Reserved Rhythm'], ['不喜欢高噪音表达，更适合深思后出手。', 'Dislikes noisy expression and is better after careful thought.'],
  ['行动迅速', 'Quick to Act'], ['执行启动快，适合动态环境。', 'Starts execution quickly and suits dynamic environments.'], ['自由感强', 'Strong Need for Freedom'], ['不喜被过度束缚，重视空间感。', 'Dislikes excessive restraint and values personal space.'],
  ['温和协调', 'Gentle Coordination'], ['重视氛围与关系平衡。', 'Values atmosphere and relationship balance.'], ['审美细腻', 'Refined Aesthetic Sense'], ['对品质和感受有较高敏感度。', 'Sensitive to quality and feeling.'],
  ['灵活机变', 'Flexible and Resourceful'], ['反应快，擅长寻找替代方案。', 'Quick to react and good at finding alternatives.'], ['学习力强', 'Strong Learning Ability'], ['对新信息吸收快，适应力好。', 'Absorbs new information quickly and adapts well.'],
  ['秩序清晰', 'Clear Sense of Order'], ['重视规则、效率与表达边界。', 'Values rules, efficiency, and communication boundaries.'], ['观察入微', 'Detail-Oriented Observation'], ['容易发现细节问题并做修正。', 'Easily spots details and makes corrections.'],
  ['责任感强', 'Strong Responsibility'], ['重承诺，讲原则，做事有底线。', 'Values commitments, principles, and boundaries.'], ['守护意识', 'Protective Instinct'], ['在关系中更愿意承担保护角色。', 'More willing to take a protective role in relationships.'],
  ['包容厚道', 'Tolerant and Kind'], ['待人宽和，重视生活稳定感。', 'Treats others gently and values life stability.'], ['福气沉稳', 'Steady Fortune'], ['适合稳步积累，不宜过度急进。', 'Suited to steady accumulation rather than rushing.'],
]);

function normalizeLocale(value) {
  if (!value) return DEFAULT_LOCALE;
  const normalized = String(value).replace('_', '-');
  const lower = normalized.toLowerCase();
  if (lower === 'zh' || lower === 'cn' || lower.includes('hans') || lower === 'zh-cn' || lower === 'zh-sg' || lower === 'zh-my') return 'zh-CN';
  if (lower === 'tw' || lower === 'hk' || lower === 'mo' || lower.includes('hant') || lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-mo') return 'zh-TW';
  if (lower.startsWith('en')) return 'en';
  return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;
}

function localeKey(locale) {
  return locale === 'zh-TW' ? 'zhTW' : locale === 'en' ? 'en' : 'zhCN';
}

function displayTerm(entry, source, locale) {
  const key = localeKey(locale);
  return entry?.[key] || entry?.zhCN || String(source || '');
}

function localizeTerm(value, category = 'misc', locale = DEFAULT_LOCALE) {
  if (value === undefined || value === null || value === '') return '';
  const text = String(value);
  const map = categoryMaps[category] || misc;
  const entry = map[text];
  if (entry) return displayTerm(entry, text, locale);
  if (category === 'tenGod' && text.endsWith('格')) return `${localizeTerm(text.slice(0, -1), 'tenGod', locale)}${locale === 'en' ? ' Pattern' : '格'}`;
  if (category === 'zodiac' && locale === 'en' && text.endsWith('命象')) return `${localizeTerm(text.slice(0, -2), 'zodiac', locale)} Profile`;
  return localizeText(text, locale);
}

function localizeTermList(values, category, locale) {
  return (values || []).map((value) => localizeTerm(value, category, locale)).filter(Boolean);
}

function localizeGanZhi(value, locale) {
  if (!value) return '';
  const text = String(value);
  if (locale !== 'en') return locale === 'zh-TW' ? localizeText(text, locale) : text;
  if (/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/.test(text)) {
    return `${displayTerm(stems[text[0]], text[0], locale)}-${displayTerm(branches[text[1]], text[1], locale)}`;
  }
  if (/^[子丑寅卯辰巳午未申酉戌亥]{2}$/.test(text)) {
    return text.split('').map((char) => displayTerm(branches[char], char, locale)).join('-');
  }
  if (text.length === 1) return localizeTerm(text, stems[text] ? 'stem' : branches[text] ? 'branch' : 'misc', locale);
  return text.replace(/[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]/g, (match) => localizeGanZhi(match, locale));
}

function localizeNaYin(value, locale) {
  if (!value) return '';
  const translated = localizeTerm(value, 'naYin', locale);
  return locale === 'en' && translated !== value ? `${translated} (${value})` : translated;
}

function localizeEmpty(value, locale) {
  if (!value) return '';
  if (locale === 'en') return localizeGanZhi(value, locale);
  return localizeText(String(value), locale);
}

function localizeText(value, locale = DEFAULT_LOCALE) {
  if (!value) return '';
  const text = String(value);
  if (locale === 'zh-CN') return text;
  if (locale === 'zh-TW') {
    return zhTWTextReplacements.reduce((current, [from, to]) => current.replace(new RegExp(from, 'g'), to), text);
  }
  if (englishTextMap.has(text)) return englishTextMap.get(text);

  if (locale === 'en') {
    const startYunMatched = text.match(/^(\d+)年(\d+)月(\d+)日起[运運]$/);
    if (startYunMatched) return `Luck starts at age ${startYunMatched[1]}y ${startYunMatched[2]}m ${startYunMatched[3]}d`;

    const sentences = text.match(/[^。]+。/g);
    if (sentences && sentences.length > 1) {
      return sentences.map((sentence) => localizeText(sentence.trim(), locale)).join(' ');
    }

    const patternName = (name) => localizeTerm(String(name || '').trim(), 'tenGod', locale);
    const elementList = (items) => String(items || '').split('、').map((item) => localizeTerm(item.trim(), 'element', locale)).filter(Boolean).join(', ');
    const patternList = (items) => String(items || '').split('、').map((item) => patternName(item)).filter(Boolean).join(', ');
    const branch = (name) => localizeGanZhi(String(name || '').trim(), locale);

    let matched = text.match(/^主格局：以月令(.+?)中主气为先，当前更偏(.+?)的成事路径。$/);
    matched = text.match(/^(.+?)命象$/);
    if (matched) return `${localizeTerm(matched[1], 'zodiac', locale)} Profile`;
    matched = text.match(/^主格局：以月令(.+?)中主气为先，当前更偏(.+?)的成事路径。$/);
    if (matched) return `Main Pattern: Based on the Month Command branch ${branch(matched[1])} and its Main Qi, this chart leans toward the ${patternName(matched[2])} path.`;
    matched = text.match(/^次格局：(.+?)与主气相互呼应，形成辅助格局倾向。$/);
    if (matched) return `Secondary Patterns: ${patternList(matched[1])} echo the Main Qi and form supporting pattern tendencies.`;
    matched = text.match(/^日主落点：日柱自身呈现(.+?)特征，会影响个人表达与处事方式。$/);
    if (matched) return `Day Master Focus: The Day Pillar itself shows ${localizeTerm(matched[1], 'tenGod', locale)} traits, influencing personal expression and ways of handling matters.`;
    matched = text.match(/^格局评价：(.+?)主以结构平衡为重，实际成局更依赖喜用是否流通。$/);
    if (matched) return `Pattern Evaluation: ${localizeGanZhi(matched[1], locale)} emphasizes structural balance; whether the pattern fully forms depends more on the flow of Favorable Elements.`;
    matched = text.match(/^(.+?)(木|火|土|金|水)日主，(.+)$/);
    if (matched) return `${localizeGanZhi(matched[1], locale)} ${localizeTerm(matched[2], 'element', locale)} Day Master. ${localizeText(matched[3], locale)}`;
    matched = text.match(/^日主(.+?)（(.+?)），(.+)$/);
    if (matched) return `Day Master: ${localizeGanZhi(matched[1], locale)} (${localizeTerm(matched[2], 'element', locale)}). ${localizeText(matched[3], locale)}`;
    matched = text.match(/^喜用神：(.+)。$/);
    if (matched) return `Favorable Elements: ${elementList(matched[1])}.`;
    matched = text.match(/^忌神：(.+)。$/);
    if (matched) return `Unfavorable Elements: ${elementList(matched[1])}.`;
    matched = text.match(/^喜用方向以(.+?)为主，用来调和日主强弱与五行流通。$/);
    if (matched) return `Favorable Elements mainly focus on ${elementList(matched[1])}, used to balance Day Master strength and Five Element flow.`;
    matched = text.match(/^忌神侧重(.+?)，相关能量过旺时需留意失衡。$/);
    if (matched) return `Unfavorable Elements focus on ${elementList(matched[1])}; watch for imbalance when related energies become excessive.`;
    matched = text.match(/^以月令(.+?)主气衡量，当前更偏(.+?)。$/);
    if (matched) return `Measured by the Main Qi of the Month Command branch ${branch(matched[1])}, the state leans toward ${localizeTerm(matched[2], 'status', locale)}.`;
    matched = text.match(/^按月令、通根、透干与五行分值综合判断，整体接近(.+?)，宜重平衡。$/);
    if (matched) return `Considering Month Command, roots, revealed stems, and Five Element scores, the overall state is close to ${localizeTerm(matched[1], 'status', locale)}; balance remains important.`;
    matched = text.match(/^(.+?)日柱，日主为(.+?)，纳音为(.+?)，主星显示为(.+?)，当前星运为(.+?)，空亡信息为(.+?)。$/);
    if (matched) return `${localizeGanZhi(matched[1], locale)} Day Pillar. Day Master: ${localizeGanZhi(matched[2], locale)}. Na Yin: ${localizeNaYin(matched[3], locale)}. Main Star: ${localizeTerm(matched[4], 'tenGod', locale)}. Growth Stage: ${localizeTerm(matched[5], 'growthStage', locale)}. Void Branches: ${localizeEmpty(matched[6], locale)}.`;
    matched = text.match(/^(.+?)日主属(.+?)，整体更偏(.+?)，格局主轴为(.+?)。基础判断为(.+?)(木|火|土|金|水)日主(.+?)，喜用更重(.+?)。$/);
    if (matched) return `${localizeGanZhi(matched[1], locale)} Day Master belongs to ${localizeTerm(matched[2], 'element', locale)} and leans ${localizeTerm(matched[3], 'status', locale)} overall. The main pattern axis is ${localizeTerm(matched[4], 'tenGod', locale)}. The basic reading is a ${localizeGanZhi(matched[5], locale)} ${localizeTerm(matched[6], 'element', locale)} Day Master leaning ${localizeTerm(matched[7], 'status', locale)}, with Favorable Elements emphasizing ${elementList(matched[8])}.`;
    matched = text.match(/^(.+?)日主属(.+?)，整体更偏(.+?)，格局主轴为(.+?)。$/);
    if (matched) return `${localizeGanZhi(matched[1], locale)} Day Master belongs to ${localizeTerm(matched[2], 'element', locale)} and leans ${localizeTerm(matched[3], 'status', locale)} overall. The main pattern axis is ${localizeTerm(matched[4], 'tenGod', locale)}.`;
    matched = text.match(/^基础判断为(.+?)(木|火|土|金|水)日主(.+?)，喜用更重(.+?)。$/);
    if (matched) return `The basic reading is a ${localizeGanZhi(matched[1], locale)} ${localizeTerm(matched[2], 'element', locale)} Day Master leaning ${localizeTerm(matched[3], 'status', locale)}, with Favorable Elements emphasizing ${elementList(matched[4])}.`;
    matched = text.match(/^(.+?)日主更重原则与边界，遇事通常会先寻找稳定结构。$/);
    if (matched) return `${localizeGanZhi(matched[1], locale)} Day Master values principles and boundaries, usually seeking a stable structure first.`;
    matched = text.match(/^(.+?)日主表达感更强，处理问题倾向先点燃方向与热情。$/);
    if (matched) return `${localizeGanZhi(matched[1], locale)} Day Master has stronger expressiveness and tends to ignite direction and enthusiasm first.`;
    matched = text.match(/^(.+?)日主重承载与稳定，做事更关注可落地和可持续。$/);
    if (matched) return `${localizeGanZhi(matched[1], locale)} Day Master values support and stability, focusing more on what can be grounded and sustained.`;
    matched = text.match(/^(.+?)日主重规则与判断，遇事更容易先划清边界。$/);
    if (matched) return `${localizeGanZhi(matched[1], locale)} Day Master values rules and judgment, and tends to define boundaries first.`;
    matched = text.match(/^(.+?)日主重观察与流动，遇事更擅长先收集信息。$/);
    if (matched) return `${localizeGanZhi(matched[1], locale)} Day Master values observation and flow, and is better at collecting information first.`;
    matched = text.match(/^适合借助系统、资源与团队协作放大表现，优先参考(.+?)。$/);
    if (matched) return `Best suited to amplifying performance through systems, resources, and teamwork, with priority given to ${elementList(matched[1])}.`;
    matched = text.match(/^适合在展示、传播、推动节奏中发挥优势，优先参考(.+?)。$/);
    if (matched) return `Best suited to showing strengths through presentation, communication, and momentum, with priority given to ${elementList(matched[1])}.`;
    matched = text.match(/^适合整合资源、搭建秩序与长期经营，优先参考(.+?)。$/);
    if (matched) return `Best suited to integrating resources, building order, and long-term operation, with priority given to ${elementList(matched[1])}.`;
    matched = text.match(/^适合执行、管理、筛选与做关键决策，优先参考(.+?)。$/);
    if (matched) return `Best suited to execution, management, filtering, and key decisions, with priority given to ${elementList(matched[1])}.`;
    matched = text.match(/^适合研究、沟通、策略与变化环境，优先参考(.+?)。$/);
    if (matched) return `Best suited to research, communication, strategy, and changing environments, with priority given to ${elementList(matched[1])}.`;
    matched = text.match(/^要避免信心不足、节奏过慢或过度依赖外界判断。$/);
    if (matched) return 'Avoid insufficient confidence, an overly slow pace, or excessive reliance on outside judgment.';
    matched = text.match(/^要避免急于定论、情绪过热或持续消耗。$/);
    if (matched) return 'Avoid rushing to conclusions, overheating emotionally, or continuous depletion.';
    matched = text.match(/^要避免过度保守、反应变慢或压力内化。$/);
    if (matched) return 'Avoid being overly conservative, reacting too slowly, or internalizing pressure.';
    matched = text.match(/^要避免过度挑剔、锋芒过露或弹性不足。$/);
    if (matched) return 'Avoid being overly critical, too sharp, or insufficiently flexible.';
    matched = text.match(/^要避免想得过多、迟疑反复或边界不清。$/);
    if (matched) return 'Avoid overthinking, repeated hesitation, or unclear boundaries.';
  }

  let result = text;
  const replacements = [
    ['喜用神', 'Favorable Elements'], ['忌神', 'Unfavorable Elements'], ['日主', 'Day Master'], ['月令', 'Month Command'], ['主气', 'Main Qi'], ['格局', 'Pattern'], ['主格局', 'Main Pattern'], ['次格局', 'Secondary Pattern'],
    ['日柱', 'Day Pillar'], ['年柱', 'Year Pillar'], ['月柱', 'Month Pillar'], ['时柱', 'Hour Pillar'], ['四柱', 'Four Pillars'], ['天干', 'Heavenly Stems'], ['地支', 'Earthly Branches'], ['五行', 'Five Elements'],
    ['纳音', 'Na Yin'], ['空亡', 'Void Branches'], ['星运', 'Growth Stage'], ['生肖画像', 'Zodiac Profile'], ['命象', 'Profile'], ['得令/失令', 'Seasonal Strength'], ['得地/失地', 'Root Strength'], ['得势/失势', 'Support Strength'],
    ['偏旺', 'Relatively Strong'], ['偏弱', 'Relatively Weak'], ['中和', 'Balanced'], ['得令', 'In Season'], ['失令', 'Out of Season'], ['得地', 'Rooted'], ['半得地', 'Partly Rooted'], ['失地', 'Unrooted'], ['得势', 'Supported'], ['半得势', 'Partly Supported'], ['失势', 'Unsupported'],
  ];
  for (const [from, to] of replacements) result = result.replace(new RegExp(from, 'g'), to);
  for (const [from, entry] of Object.entries(tenGods)) result = result.replace(new RegExp(from, 'g'), entry.en);
  for (const [from, entry] of Object.entries(zodiac)) result = result.replace(new RegExp(from, 'g'), entry.en);
  return result;
}

function localizeTextStatus(item, locale) {
  return {
    ...item,
    label: localizeText(item?.label || '', locale),
    status: item?.status ? localizeTerm(item.status, 'status', locale) : item?.status,
    description: localizeText(item?.description || '', locale),
  };
}

function localizePillar(pillar, shenShaItems, locale) {
  const pillarShenSha = (shenShaItems || []).filter((item) => item.pillar === pillar.type || item.pillar === pillar.label).map((item) => item.name);
  return {
    ...pillar,
    displayLabel: localizeTerm(pillar.label || pillar.type, 'pillar', locale),
    displayGanZhi: localizeGanZhi(pillar.ganZhi, locale),
    displayTianGan: localizeGanZhi(pillar.tianGan, locale),
    displayDiZhi: localizeGanZhi(pillar.diZhi, locale),
    displayCangGan: localizeTermList(pillar.cangGan, 'stem', locale),
    displayMainStar: localizeTerm(pillar.mainStar, 'tenGod', locale),
    displaySubStar: localizeTermList(pillar.subStar?.length ? pillar.subStar : pillar.cangGanDetail?.map((item) => item.shiShen), 'tenGod', locale),
    displayEmpty: localizeEmpty(pillar.empty, locale),
    displayXingYun: localizeTerm(pillar.xingYun, 'growthStage', locale),
    displayZiZuo: localizeTerm(pillar.ziZuo, 'growthStage', locale),
    displayNaYin: localizeNaYin(pillar.naYin, locale),
    displayShenSha: localizeTermList(pillar.shenSha?.length ? pillar.shenSha : pillarShenSha, 'shenSha', locale),
  };
}

function localizeRelationshipLine(line, locale) {
  return { ...line, label: localizeTerm(line.label, 'relationship', locale), displayLabel: localizeTerm(line.label, 'relationship', locale), displayStartChar: localizeGanZhi(line.startChar, locale), displayEndChar: localizeGanZhi(line.endChar, locale) };
}

function localizeDaYun(item, locale) {
  return {
    ...item,
    displayGanZhi: localizeGanZhi(item.ganZhi, locale), displayNaYin: localizeNaYin(item.naYin, locale), displayMainStar: localizeTerm(item.mainStar, 'tenGod', locale), displayXingYun: localizeTerm(item.xingYun, 'growthStage', locale), displayZiZuo: localizeTerm(item.ziZuo, 'growthStage', locale), displayKongWang: localizeEmpty(item.kongWang, locale), displayCangGanShiShen: localizeTermList(item.cangGanShiShen, 'tenGod', locale),
  };
}

function localizeCycle(item, locale) {
  const monthNumber = Number(item.month || item.value);
  const displayMonthName = item.month_name
    ? locale === 'en' && Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12
      ? `Month ${monthNumber}`
      : localizeText(item.month_name, locale)
    : undefined;
  return { ...item, displayLabel: localizeGanZhi(item.label, locale), displaySubValue: localizeTerm(item.sub_value, 'tenGod', locale), displayMonthName };
}

function localizePersonalityTag(tag, locale) {
  if (!tag) return '';
  const text = String(tag);
  if (elements[text]) return localizeTerm(text, 'element', locale);
  if (statuses[text]) return localizeTerm(text, 'status', locale);
  if (text.endsWith('格')) return localizeTerm(text, 'tenGod', locale);
  return localizeText(text, locale);
}

function localizeChart(chart, localeValue) {
  if (!chart) return chart;
  const locale = normalizeLocale(localeValue || chart.locale);
  const shenShaItems = chart.shen_sha_insights || [];
  const localizedShenSha = shenShaItems.map((item) => ({
    ...item,
    displayName: localizeTerm(item.name, 'shenSha', locale),
    displayPillarLabel: localizeTerm(item.pillar_label || item.pillar, 'pillar', locale),
    displayCategory: localizeText(item.category, locale),
  }));
  const monthlyCycles = Object.fromEntries(Object.entries(chart.monthly_cycles || {}).map(([key, months]) => [key, (months || []).map((month) => ({ ...localizeCycle(month, locale), daily_cycles: month.daily_cycles?.map((day) => localizeCycle(day, locale)) }))]));
  const dailyCycles = Object.fromEntries(Object.entries(chart.daily_cycles || {}).map(([key, days]) => [key, (days || []).map((day) => localizeCycle(day, locale))]));
  const pillars = (chart.pillars || []).map((pillar) => localizePillar(pillar, shenShaItems, locale));
  return {
    ...chart,
    locale,
    terminology_version: TERMINOLOGY_VERSION,
    start_yun_desc: localizeText(chart.start_yun_desc, locale), start_yun_date: localizeText(chart.start_yun_date, locale),
    displayYearPillar: localizeGanZhi(chart.year_pillar, locale), displayMonthPillar: localizeGanZhi(chart.month_pillar, locale), displayDayPillar: localizeGanZhi(chart.day_pillar, locale), displayHourPillar: localizeGanZhi(chart.hour_pillar, locale), displayDayMaster: localizeGanZhi(chart.day_master, locale), displayDayMasterElement: localizeTerm(chart.day_master_element, 'element', locale), displayZodiac: localizeTerm(chart.zodiac, 'zodiac', locale), displayStartYunDesc: localizeText(chart.start_yun_desc, locale),
    pillars,
    five_elements_summary: (chart.five_elements_summary || []).map((item) => ({ ...item, displayElement: localizeTerm(item.element, 'element', locale) })),
    ten_gods_summary: (chart.ten_gods_summary || []).map((item) => ({ ...item, displayName: localizeTerm(item.name, 'tenGod', locale) })),
    ten_god_legend: (chart.ten_god_legend || []).map((item) => ({ ...item, displayName: localizeTerm(item.name, 'tenGod', locale) })),
    dominant_ten_gods: (chart.dominant_ten_gods || []).map((item) => ({ ...item, displayName: localizeTerm(item.name, 'tenGod', locale) })),
    useful_element_summary: { ...chart.useful_element_summary, useful: localizeTermList(chart.useful_element_summary?.useful, 'element', locale), unfavorable: localizeTermList(chart.useful_element_summary?.unfavorable, 'element', locale), description: localizeText(chart.useful_element_summary?.description || '', locale), caution: localizeText(chart.useful_element_summary?.caution || '', locale) },
    interactions: { tianGan: chart.interactions?.tianGan || [], diZhi: chart.interactions?.diZhi || [] },
    relationship_graph_lines: { gan: (chart.relationship_graph_lines?.gan || []).map((line) => localizeRelationshipLine(line, locale)), zhi: (chart.relationship_graph_lines?.zhi || []).map((line) => localizeRelationshipLine(line, locale)) },
    pattern: localizeTerm(chart.pattern || '', 'tenGod', locale),
    pattern_summary: { ...chart.pattern_summary, mainPattern: localizeTerm(chart.pattern_summary?.mainPattern || '', 'tenGod', locale), grade: localizeTerm(chart.pattern_summary?.grade || '', 'status', locale), secondaryPatterns: (chart.pattern_summary?.secondaryPatterns || []).map((item) => localizeTerm(item, 'tenGod', locale)), talentTags: (chart.pattern_summary?.talentTags || []).map((item) => localizeTerm(item, 'tenGod', locale)), description: localizeText(chart.pattern_summary?.description || '', locale) },
    day_master_analysis: { ...chart.day_master_analysis, dayMaster: localizeGanZhi(chart.day_master_analysis?.dayMaster || '', locale), element: localizeTerm(chart.day_master_analysis?.element, 'element', locale), elementDescription: localizeText(chart.day_master_analysis?.elementDescription || '', locale), season: localizeTextStatus(chart.day_master_analysis?.season || {}, locale), root: localizeTextStatus(chart.day_master_analysis?.root || {}, locale), support: localizeTextStatus(chart.day_master_analysis?.support || {}, locale), overall: { label: localizeTerm(chart.day_master_analysis?.overall?.label || '', 'status', locale), description: localizeText(chart.day_master_analysis?.overall?.description || '', locale) }, content: localizeText(chart.day_master_analysis?.content || '', locale) },
    zodiac_profile: { title: localizeText(chart.zodiac_profile?.title || '', locale), traits: (chart.zodiac_profile?.traits || []).map((trait) => ({ title: localizeText(trait.title, locale), description: localizeText(trait.description, locale) })) },
    personality_profile: { summary: localizeText(chart.personality_profile?.summary || '', locale), tags: (chart.personality_profile?.tags || []).map((tag) => localizePersonalityTag(tag, locale)), cards: (chart.personality_profile?.cards || []).map((card) => ({ title: localizeText(card.title, locale), description: localizeText(card.description, locale) })) },
    day_pillar_summary: localizeText(chart.day_pillar_summary || '', locale),
    yin_yang_summary: { label: localizeText(chart.yin_yang_summary?.label || '', locale), description: localizeText(chart.yin_yang_summary?.description || '', locale), tags: (chart.yin_yang_summary?.tags || []).map((tag) => localizeText(tag, locale)) },
    da_yun_list: (chart.da_yun_list || []).map((item) => localizeDaYun(item, locale)),
    decade_cycles: (chart.decade_cycles || []).map((decade) => ({
      ...localizeCycle(decade, locale),
      yearly_cycles: decade.yearly_cycles?.map((year) => localizeCycle(year, locale)),
      monthly_cycles: Object.fromEntries(
        Object.entries(decade.monthly_cycles || {}).map(([key, months]) => [
          key,
          (months || []).map((month) => ({
            ...localizeCycle(month, locale),
            daily_cycles: month.daily_cycles?.map((day) => localizeCycle(day, locale)),
          })),
        ]),
      ),
    })),
    yearly_cycles: (chart.yearly_cycles || []).map((year) => localizeCycle(year, locale)),
    monthly_cycles: monthlyCycles,
    daily_cycles: dailyCycles,
    shen_sha_insights: localizedShenSha,
    shen_sha_groups: (chart.shen_sha_groups || []).map((group) => ({ ...group, displayLabel: localizeTerm(group.label, 'misc', locale), displayItems: localizeTermList(group.items, 'shenSha', locale) })),
  };
}

module.exports = { DEFAULT_LOCALE, SUPPORTED_LOCALES, TERMINOLOGY_VERSION, localizeChart, localizeGanZhi, localizeTerm, localizeText, normalizeLocale };

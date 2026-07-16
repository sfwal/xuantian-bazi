/**
 * 排盘计算器 - 核心八字排盘计算管线
 *
 * 计算顺序：
 *   1. 农历→公历转换（如输入为农历）
 *   2. DST 夏令时修正
 *   3. 真太阳时修正
 *   4. shunshi-bazi-core 主命盘计算
 *   5. lunar-javascript 大运/流年/流月
 *   6. 从 MIT 主引擎结果提取四柱神煞
 */

const config = require('./config');

// ============================================================
// 懒加载模块
// ============================================================

let _shunshi, _lunar, _trueSolar;

function getShunshi() {
  if (!_shunshi) _shunshi = require('shunshi-bazi-core');
  return _shunshi;
}

function getLunarJs() {
  if (!_lunar) _lunar = require('lunar-javascript');
  return _lunar;
}

function getTrueSolar() {
  if (!_trueSolar) _trueSolar = require('@openfate/true-solar-time');
  return _trueSolar;
}

// ============================================================
// 工具函数
// ============================================================

function parseDatetime(birthDate, birthTime) {
  const [y, m, d] = birthDate.split('-').map(Number);
  const [h, min] = (birthTime || '00:00').split(':').map(Number);
  return { year: y, month: m, day: d, hour: h || 0, minute: min || 0 };
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function formatDateParts(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function formatDatetimeParts(year, month, day, hour, minute, second = 0) {
  return `${formatDateParts(year, month, day)}T${pad2(hour)}:${pad2(minute)}:${pad2(second)}`;
}

function parseDateParts(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function addDaysToDateParts(year, month, day, daysToAdd) {
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function datePartsToUtcMs(parts) {
  return Date.UTC(parts.year, parts.month - 1, parts.day, 0, 0, 0);
}

function addMinutesToDateParts(year, month, day, hour, minute, minutesToAdd) {
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  date.setUTCMinutes(date.getUTCMinutes() + minutesToAdd);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  };
}

function parseTrueSolarDateTime(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] || 0),
  };
}

const GAN_YIN_YANG = {
  甲: '阳', 乙: '阴', 丙: '阳', 丁: '阴', 戊: '阳', 己: '阴', 庚: '阳', 辛: '阴', 壬: '阳', 癸: '阴',
};

const GAN_ELEMENT = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

const GENERATES = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const CONTROLS = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

function getTenGod(dayGan, targetGan) {
  const dayElement = GAN_ELEMENT[dayGan];
  const targetElement = GAN_ELEMENT[targetGan];
  const samePolarity = GAN_YIN_YANG[dayGan] === GAN_YIN_YANG[targetGan];
  if (!dayElement || !targetElement) return '';

  if (targetElement === dayElement) return samePolarity ? '比肩' : '劫财';
  if (GENERATES[dayElement] === targetElement) return samePolarity ? '食神' : '伤官';
  if (CONTROLS[dayElement] === targetElement) return samePolarity ? '偏财' : '正财';
  if (CONTROLS[targetElement] === dayElement) return samePolarity ? '七杀' : '正官';
  if (GENERATES[targetElement] === dayElement) return samePolarity ? '偏印' : '正印';
  return '';
}

const MONTH_JIE = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];

function getJieQiDateParts(year, jieName) {
  const { Solar } = getLunarJs();
  const table = Solar.fromYmd(year, 7, 1).getLunar().getJieQiTable();
  const solar = table[jieName];
  return solar ? parseDateParts(solar.toYmd()) : null;
}

function getSolarTermMonthRange(year, monthIndex) {
  const startName = MONTH_JIE[monthIndex - 1];
  const endName = MONTH_JIE[monthIndex % 12];
  const startYear = monthIndex === 12 ? year + 1 : year;
  const endYear = monthIndex >= 11 ? year + 1 : year;
  const start = getJieQiDateParts(startYear, startName);
  const end = getJieQiDateParts(endYear, endName);
  if (!start || !end) return null;
  return { start, end };
}

function findCycleMonth(year, month, day) {
  const targetMs = datePartsToUtcMs({ year, month, day });
  for (const cycleYear of [year, year - 1]) {
    for (let monthIndex = 1; monthIndex <= 12; monthIndex++) {
      const range = getSolarTermMonthRange(cycleYear, monthIndex);
      if (!range) continue;
      if (targetMs >= datePartsToUtcMs(range.start) && targetMs < datePartsToUtcMs(range.end)) {
        return { year: cycleYear, month: monthIndex };
      }
    }
  }
  return null;
}

function computeDailyCycles(year, monthIndex, dayGan) {
  const { Solar } = getLunarJs();
  const range = getSolarTermMonthRange(year, monthIndex);
  if (!range) return [];

  const days = [];
  const endMs = datePartsToUtcMs(range.end);
  let cursor = range.start;
  while (datePartsToUtcMs(cursor) < endMs) {
    const lunar = Solar.fromYmd(cursor.year, cursor.month, cursor.day).getLunar();
    const ganZhi = lunar.getDayInGanZhiExact2 ? lunar.getDayInGanZhiExact2() : lunar.getDayInGanZhi();
    days.push({
      label: ganZhi,
      value: formatDateParts(cursor.year, cursor.month, cursor.day),
      sub_value: getTenGod(dayGan, ganZhi[0]),
      active: false,
      year: cursor.year,
      month: cursor.month,
      day: cursor.day,
    });
    cursor = addDaysToDateParts(cursor.year, cursor.month, cursor.day, 1);
  }
  return days;
}

// ============================================================
// 第 1 步：农历转公历
// ============================================================

function convertLunarToSolar(lunarDate, isLeapMonth = false) {
  const { Lunar } = getLunarJs();
  const { year, month, day } = parseDatetime(lunarDate, '00:00');

  try {
    const lunar = Lunar.fromYmd(year, isLeapMonth ? -month : month, day);
    const solar = lunar.getSolar();
    return {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      converted: true,
    };
  } catch (e) {
    throw new Error(`农历转公历失败: ${e.message}`);
  }
}

// ============================================================
// 第 2 步：夏令时修正
// ============================================================

function applyDSTCorrection(hour, minute, year, month, day) {
  const dstPeriods = [
    { year: 1986, start: [4, 13], end: [9, 14] },
    { year: 1987, start: [4, 12], end: [9, 13] },
    { year: 1988, start: [4, 10], end: [9, 11] },
    { year: 1989, start: [4, 16], end: [9, 17] },
    { year: 1990, start: [4, 15], end: [9, 16] },
    { year: 1991, start: [4, 14], end: [9, 15] },
  ];

  const period = dstPeriods.find((p) => p.year === year);
  if (!period) {
    return { year, month, day, hour, minute, dstApplied: false, dstMinutes: 0 };
  }

  const dateValue = month * 100 + day;
  const startValue = period.start[0] * 100 + period.start[1];
  const endValue = period.end[0] * 100 + period.end[1];

  if (dateValue >= startValue && dateValue < endValue) {
    const corrected = addMinutesToDateParts(year, month, day, hour, minute, -60);
    return { ...corrected, dstApplied: true, dstMinutes: -60 };
  }

  return { year, month, day, hour, minute, dstApplied: false, dstMinutes: 0 };
}

// ============================================================
// 第 3 步：真太阳时修正 (使用 @openfate/true-solar-time)
// ============================================================

function applyTrueSolarTime(year, month, day, hour, minute, longitude, timezone) {
  try {
    const ts = getTrueSolar();
    const input = {
      year, month, day, hour, minute,
      timeZoneId: timezone || 'Asia/Shanghai',
    };
    const options = {
      longitude: longitude ?? 116.4,
      algorithm: 'meeus',
    };
    const result = ts.calculateTrueSolarTime(input, options);

    if (result && result.trueSolarTime) {
      const parsedDateTime = parseTrueSolarDateTime(result.trueSolarDateTime);
      const [trueSolarHour, trueSolarMinute, trueSolarSecond = 0] = result.trueSolarTime.split(':').map(Number);
      const dateTime = parsedDateTime || {
        year,
        month,
        day,
        hour: trueSolarHour,
        minute: trueSolarMinute,
        second: trueSolarSecond,
      };
      return {
        year: dateTime.year,
        month: dateTime.month,
        day: dateTime.day,
        hour: dateTime.hour,
        minute: dateTime.minute,
        second: dateTime.second,
        trueSolarDateTime: formatDatetimeParts(dateTime.year, dateTime.month, dateTime.day, dateTime.hour, dateTime.minute, dateTime.second),
        correctionMinutes: result.totalCorrectionMinutes ?? 0,
        longitudeCorrectionMinutes: result.longitudeCorrectionMinutes ?? 0,
        equationOfTimeMinutes: result.equationOfTimeMinutes ?? 0,
        dstOffsetMinutes: result.dstOffsetMinutes ?? 0,
        trueSolarApplied: true,
        source: 'openfate-meeus',
      };
    }
  } catch (e) {
    // 降级到简单经度修正
  }

  // 降级：简单经度修正（每度 4 分钟）
  const standardMeridian = 120;
  const offsetMinutes = Math.round((longitude - standardMeridian) * 4);
  const corrected = addMinutesToDateParts(year, month, day, hour, minute, offsetMinutes);

  return {
    ...corrected,
    trueSolarDateTime: formatDatetimeParts(corrected.year, corrected.month, corrected.day, corrected.hour, corrected.minute),
    correctionMinutes: offsetMinutes,
    dstOffsetMinutes: 0,
    trueSolarApplied: true,
    source: 'longitude_offset',
  };
}

// ============================================================
// 第 4 步：shunshi-bazi-core 主命盘
// ============================================================

function computeCoreChart(year, month, day, hour, minute, gender, sect = config.defaults.sect) {
  const sbc = getShunshi();

  // shunshi-bazi-core: 0=女, 1=男  (与我们的 1=男 2=女 不同)
  const sbcGender = gender === 1 ? 1 : 0;

  const input = {
    year, month, day,
    hour, minute,
    gender: sbcGender,
    sect,
  };

  let result;
  try {
    result = sbc.getBaziChart(input);
  } catch (e) {
    throw new Error(`shunshi-bazi-core 排盘失败: ${e.message}`);
  }

  return result;
}

// ============================================================
// 第 5 步：lunar-javascript 大运/流年/流月
// ============================================================

function computeCycles(year, month, day, hour, minute, gender, options = {}) {
  const { Solar } = getLunarJs();

  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  const dayGan = eightChar.getDay()[0];

  // lunar-javascript getYun: 0=男(forward), 1=女(backward)
  // 我们的 gender: 1=男, 2=女
  const yunGender = gender === 1 ? 0 : 1;
  const yun = eightChar.getYun(yunGender);
  const daYunList = yun.getDaYun();
  const detailYear = Number.isInteger(options.detailYear) ? options.detailYear : null;
  const detailMonth = Number.isInteger(options.detailMonth) ? options.detailMonth : null;

  const decadeCycles = [];
  for (let i = 0; i < daYunList.length; i++) {
    const daYun = daYunList[i];
    const liuNianList = daYun.getLiuNian();
    const yearlyCycles = [];
    const monthlyCyclesMap = {};

    const currentYear = new Date().getFullYear();

    for (let j = 0; j < liuNianList.length; j++) {
      const liuNian = liuNianList[j];
      const lnYear = liuNian.getYear();
      try {
        yearlyCycles.push({
          label: liuNian.getGanZhi(),
          value: String(lnYear),
          sub_value: '',
          active: lnYear === currentYear,
        });
      } catch (e) {
        yearlyCycles.push({
          label: '',
          value: String(lnYear),
          sub_value: '',
          active: lnYear === currentYear,
        });
      }

      // 基础命盘只生成大运和流年；指定年份时才按需展开流月。
      if (lnYear === detailYear) {
        try {
          const liuYueList = liuNian.getLiuYue();
          const months = [];
          for (let k = 0; k < liuYueList.length; k++) {
            const liuYue = liuYueList[k];
            const monthIndex = k + 1;
            months.push({
              label: liuYue.getGanZhi(),
              value: String(monthIndex),
              sub_value: '',
              active: false,
              year: lnYear,
              month: monthIndex,
              month_name: liuYue.getMonthInChinese ? liuYue.getMonthInChinese() : '',
              daily_cycles: monthIndex === detailMonth
                ? computeDailyCycles(lnYear, monthIndex, dayGan)
                : [],
            });
          }
          monthlyCyclesMap[lnYear] = months;
        } catch (e) {
          monthlyCyclesMap[lnYear] = [];
        }
      }
    }

    const isCurrent = daYun.getStartYear() <= currentYear && daYun.getEndYear() >= currentYear;

    decadeCycles.push({
      label: daYun.getGanZhi(),
      value: `${daYun.getStartAge()}岁`,
      sub_value: `${daYun.getStartYear()}-${daYun.getEndYear()}`,
      active: isCurrent,
      startAge: daYun.getStartAge(),
      startYear: daYun.getStartYear(),
      endYear: daYun.getEndYear(),
      yearly_cycles: yearlyCycles,
      monthly_cycles: monthlyCyclesMap,
    });
  }

  return {
    eightChar,
    yun,
    decadeCycles,
    startYunInfo: {
      startYear: yun.getStartYear(),
      startMonth: yun.getStartMonth(),
      startDay: yun.getStartDay(),
      startHour: yun.getStartHour?.(),
      forward: yun.isForward(),
    },
  };
}

// ============================================================
// 第 6 步：从 shunshi-bazi-core 提取四柱神煞
// ============================================================

function classifyShenSha(name) {
  if (/贵人|福|德|喜|禄|天厨|词馆|文昌|国印/.test(name)) return { category: 'good', luckLevel: 1 };
  if (/煞|劫|灾|亡|刃|披麻|孤辰|寡宿/.test(name)) return { category: 'caution', luckLevel: -1 };
  return { category: 'neutral', luckLevel: 0 };
}

function computeShenSha(coreChart) {
  const details = coreChart?.['八字']?.['柱位详细'] || coreChart?.['柱位详细'] || {};
  const pillarMap = {
    year: '年柱',
    month: '月柱',
    day: '日柱',
    hour: '时柱',
  };
  const shenShaItems = [];

  for (const [pillar, label] of Object.entries(pillarMap)) {
    const names = details[label]?.['神煞'] || [];
    for (const value of Array.isArray(names) ? names : []) {
      const name = String(value || '').trim();
      if (!name) continue;
      const classification = classifyShenSha(name);
      shenShaItems.push({
        name,
        pillar,
        pillar_label: label,
        category: classification.category,
        luck_level: classification.luckLevel,
      });
    }
  }

  return { shenShaItems, source: 'shunshi-bazi-core' };
}

// ============================================================
// 主计算管线
// ============================================================

function calculate(input, options = {}) {
  const timeCorrections = {};
  let { year, month, day, hour, minute } = parseDatetime(
    input.birth_date,
    input.birth_time
  );

  // ---- 第 1 步：农历→公历 ----
  if (input.calendar_type === config.calendarType.LUNAR) {
    const solar = convertLunarToSolar(input.birth_date, input.is_leap_month === true);
    year = solar.year;
    month = solar.month;
    day = solar.day;
    timeCorrections.lunar_to_solar = solar;
  }

  // The true-solar-time engine resolves historical DST from the IANA zone.
  // Passing the original civil time avoids the old double-correction bug.
  const solarDatetime = formatDatetimeParts(year, month, day, hour, minute);

  // ---- 第 3 步：真太阳时修正 ----
  const longitude = input.birth_longitude ?? 116.4;
  const timezone = input.birth_timezone || 'Asia/Shanghai';
  const tsResult = input.use_true_solar_time === false
    ? {
        year, month, day, hour, minute, second: 0,
        trueSolarDateTime: formatDatetimeParts(year, month, day, hour, minute),
        correctionMinutes: 0,
        longitudeCorrectionMinutes: 0,
        equationOfTimeMinutes: 0,
        dstOffsetMinutes: 0,
        trueSolarApplied: false,
        source: 'disabled',
      }
    : applyTrueSolarTime(year, month, day, hour, minute, longitude, timezone);
  timeCorrections.dst = {
    dstApplied: Boolean(tsResult.dstOffsetMinutes),
    dstMinutes: -(tsResult.dstOffsetMinutes || 0),
  };
  timeCorrections.true_solar = tsResult;

  const finalYear = tsResult.year;
  const finalMonth = tsResult.month;
  const finalDay = tsResult.day;
  const finalHour = tsResult.hour;
  const finalMinute = tsResult.minute;

  // ---- 第 4 步：shunshi-bazi-core 主命盘 ----
  const coreChart = computeCoreChart(finalYear, finalMonth, finalDay, finalHour, finalMinute, input.gender, input.sect);

  // ---- 第 5 步：lunar-javascript 大运/流年/流月 ----
  const cycles = computeCycles(finalYear, finalMonth, finalDay, finalHour, finalMinute, input.gender, options);

  // ---- 第 6 步：从主引擎提取神煞 ----
  const shenSha = computeShenSha(coreChart);

  const inputDateTime = parseDatetime(input.birth_date, input.birth_time);

  return {
    input_datetime: formatDatetimeParts(
      inputDateTime.year,
      inputDateTime.month,
      inputDateTime.day,
      inputDateTime.hour,
      inputDateTime.minute
    ),
    solar_datetime: solarDatetime,
    chart_datetime: tsResult.trueSolarDateTime || formatDatetimeParts(finalYear, finalMonth, finalDay, finalHour, finalMinute),
    time_corrections: timeCorrections,
    core_chart: coreChart,
    cycles: {
      decade_cycles: cycles.decadeCycles,
      start_yun: cycles.startYunInfo,
    },
    shen_sha: shenSha,
  };
}

module.exports = {
  calculate,
  parseDatetime,
  convertLunarToSolar,
  applyDSTCorrection,
  applyTrueSolarTime,
  computeCoreChart,
  computeCycles,
  computeShenSha,
  findCycleMonth,
};

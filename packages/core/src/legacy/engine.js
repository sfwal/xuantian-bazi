/**
 * 排盘引擎主入口
 * 对外暴露统一的排盘接口
 */

const calculator = require('./calculator');
const normalizer = require('./normalizer');
const { normalizeLocale, localizeText } = require('./i18n/chartTerms');

function slimCycles(cycles) {
  return {
    start_yun: cycles?.start_yun || null,
    decade_cycles: (cycles?.decade_cycles || []).map((cycle) => ({
      ...cycle,
      monthly_cycles: {},
    })),
  };
}

/**
 * 执行完整排盘并返回标准化结果
 * @param {Object} input - 输入参数
 * @param {number} input.profile_id - 档案ID
 * @param {string} input.name - 姓名
 * @param {number} input.gender - 性别: 1=男, 2=女
 * @param {number} input.calendar_type - 日历类型: 1=公历, 2=农历
 * @param {string} input.birth_date - 出生日期 "1990-01-01"
 * @param {string} input.birth_time - 出生时间 "08:30"
 * @param {string} input.birth_place - 出生地文本
 * @param {string} input.birth_country - 国家
 * @param {string} input.birth_city - 城市
 * @param {number} input.birth_longitude - 经度
 * @param {number} input.birth_latitude - 纬度
 * @param {string} input.birth_timezone - 时区
 * @returns {{ code: number, message: string, data: Object|null }}
 */
function chart(input) {
  const normalizedInput = normalizeInput(input || {});
  const locale = normalizedInput.locale;

  // 参数校验
  const errors = validateInput(normalizedInput, locale);
  if (errors.length > 0) {
    return {
      code: 400,
      message: locale === 'en' ? `Parameter validation failed: ${errors.join('; ')}` : localizeText(`参数校验失败: ${errors.join('; ')}`, locale),
      data: null,
    };
  }

  try {
    // 执行计算
    const rawResult = calculator.calculate(normalizedInput);

    // 标准化
    const normalizedChart = normalizer.normalize(rawResult, normalizedInput);

    return {
      code: 0,
      message: 'ok',
      data: {
        input_datetime: rawResult.input_datetime,
        solar_datetime: rawResult.solar_datetime,
        chart_datetime: rawResult.chart_datetime,
        time_corrections: rawResult.time_corrections,
        core_chart: rawResult.core_chart,
        cycles: slimCycles(rawResult.cycles),
        shen_sha: rawResult.shen_sha,
        normalized_chart: normalizedChart,
      },
    };
  } catch (e) {
    return {
      code: 500,
      message: locale === 'en' ? `Chart calculation failed: ${e.message}` : localizeText(`排盘计算失败: ${e.message}`, locale),
      data: null,
    };
  }
}

/**
 * 按需计算指定年份的流月，以及指定月份的流日。
 */
function cycles(input) {
  const normalizedInput = normalizeInput(input || {});
  const locale = normalizedInput.locale;
  const errors = validateInput(normalizedInput, locale);
  let targetYear = Number(normalizedInput.target_year);
  const hasTargetMonth = normalizedInput.target_month !== undefined
    && normalizedInput.target_month !== null
    && normalizedInput.target_month !== '';
  let targetMonth = hasTargetMonth ? Number(normalizedInput.target_month) : null;
  const targetDate = String(normalizedInput.target_date || '').trim();

  if (!Number.isInteger(targetYear) || targetYear < 1800 || targetYear > 2300) {
    errors.push(locale === 'en'
      ? 'target_year must be an integer between 1800 and 2300'
      : locale === 'zh-TW'
        ? 'target_year 必須是 1800 到 2300 之間的整數'
        : 'target_year 必须是 1800 到 2300 之间的整数');
  }
  if (hasTargetMonth && (!Number.isInteger(targetMonth) || targetMonth < 1 || targetMonth > 12)) {
    errors.push(locale === 'en'
      ? 'target_month must be an integer between 1 and 12'
      : locale === 'zh-TW'
        ? 'target_month 必須是 1 到 12 之間的整數'
        : 'target_month 必须是 1 到 12 之间的整数');
  }
  if (targetDate) {
    const match = targetDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const parts = match ? { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) } : null;
    const date = parts ? new Date(Date.UTC(parts.year, parts.month - 1, parts.day)) : null;
    const valid = parts && date
      && date.getUTCFullYear() === parts.year
      && date.getUTCMonth() + 1 === parts.month
      && date.getUTCDate() === parts.day;
    if (!valid || parts.year !== targetYear) {
      errors.push(locale === 'en'
        ? 'target_date must be a valid YYYY-MM-DD date in target_year'
        : locale === 'zh-TW'
          ? 'target_date 必須是 target_year 內有效的 YYYY-MM-DD 日期'
          : 'target_date 必须是 target_year 内有效的 YYYY-MM-DD 日期');
    } else {
      const resolved = calculator.findCycleMonth(parts.year, parts.month, parts.day);
      if (!resolved) {
        errors.push(locale === 'en' ? 'target_date could not be mapped to a cycle month' : 'target_date 无法定位对应流月');
      } else {
        targetYear = resolved.year;
        targetMonth = resolved.month;
      }
    }
  }
  if (errors.length > 0) {
    return {
      code: 400,
      message: locale === 'en' ? `Parameter validation failed: ${errors.join('; ')}` : localizeText(`参数校验失败: ${errors.join('; ')}`, locale),
      data: null,
    };
  }

  try {
    const rawResult = calculator.calculate(normalizedInput, {
      detailYear: targetYear,
      detailMonth: targetMonth,
    });
    const normalizedChart = normalizer.normalize(rawResult, normalizedInput);
    const decade = (normalizedChart.decade_cycles || []).find((item) =>
      (item.yearly_cycles || []).some((year) => Number(year.value) === targetYear));
    const yearCycle = decade?.yearly_cycles?.find((year) => Number(year.value) === targetYear) || null;
    const monthlyCycles = decade?.monthly_cycles?.[String(targetYear)] || [];

    if (!yearCycle) {
      return {
        code: 404,
        message: locale === 'en'
          ? 'The target year is outside this profile\'s available cycle range'
          : locale === 'zh-TW'
            ? '目標年份不在此命盤可用的運勢範圍內'
            : '目标年份不在此命盘可用的运势范围内',
        data: null,
      };
    }

    const selectedMonth = targetMonth === null
      ? null
      : monthlyCycles.find((month) => Number(month.month || month.value) === targetMonth) || null;

    return {
      code: 0,
      message: 'ok',
      data: {
        year: targetYear,
        month: targetMonth,
        year_cycle: yearCycle,
        monthly_cycles: monthlyCycles,
        daily_cycles: selectedMonth?.daily_cycles || [],
        locale: normalizedChart.locale,
        terminology_version: normalizedChart.terminology_version,
      },
    };
  } catch (e) {
    return {
      code: 500,
      message: locale === 'en' ? `Cycle calculation failed: ${e.message}` : localizeText(`运势计算失败: ${e.message}`, locale),
      data: null,
    };
  }
}

function normalizeInput(input) {
  const normalized = { ...input };

  normalized.locale = normalizeLocale(normalized.locale || normalized.lang);
  normalized.calendar_type = normalized.calendar_type === undefined
    || normalized.calendar_type === null
    || normalized.calendar_type === ''
    ? 1
    : Number(normalized.calendar_type);

  if (normalized.gender !== undefined && normalized.gender !== null && normalized.gender !== '') {
    const gender = Number(normalized.gender);
    // 兼容旧前端/库内约定：1=男、0=女；标准化后统一为 1=男、2=女。
    normalized.gender = gender === 0 ? 2 : gender;
  }

  normalized.is_leap_month = normalized.is_leap_month === true || normalized.is_leap_month === 1 || normalized.is_leap_month === '1';
  normalized.sect = normalized.sect === undefined || normalized.sect === null || normalized.sect === '' ? 2 : Number(normalized.sect);
  if (normalized.use_true_solar_time !== undefined) {
    normalized.use_true_solar_time = ![false, 0, '0', 'false'].includes(normalized.use_true_solar_time);
  }

  for (const key of ['birth_longitude', 'birth_latitude']) {
    if (normalized[key] !== undefined && normalized[key] !== null && normalized[key] !== '') {
      normalized[key] = Number(normalized[key]);
    }
  }

  return normalized;
}

/**
 * 输入参数校验
 */
function validateInput(input, locale) {
  const errors = [];

  if (!input.birth_date) {
    errors.push(locale === 'en' ? 'birth_date is required' : localizeText('birth_date 不能为空', locale));
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birth_date)) {
    errors.push(locale === 'en' ? 'birth_date must use YYYY-MM-DD' : localizeText('birth_date 格式需为 YYYY-MM-DD', locale));
  } else {
    const [year, month, day] = input.birth_date.split('-').map(Number);
    const validSolarDate = (() => {
      const value = new Date(Date.UTC(year, month - 1, day));
      return value.getUTCFullYear() === year && value.getUTCMonth() + 1 === month && value.getUTCDate() === day;
    })();
    const validLunarDate = month >= 1 && month <= 12 && day >= 1 && day <= 30;
    if ((input.calendar_type === 2 && !validLunarDate) || (input.calendar_type !== 2 && !validSolarDate)) {
      errors.push(locale === 'en' ? 'birth_date is not a valid calendar date' : localizeText('birth_date 不是有效日期', locale));
    }
  }

  if (!input.birth_time) {
    errors.push(locale === 'en' ? 'birth_time is required' : localizeText('birth_time 不能为空', locale));
  } else if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.birth_time)) {
    errors.push(locale === 'en'
      ? 'birth_time must be a valid time from 00:00 to 23:59'
      : locale === 'zh-TW'
        ? 'birth_time 必須是 00:00 到 23:59 之間的有效時間'
        : 'birth_time 必须是 00:00 到 23:59 之间的有效时间');
  }

  if (![1, 2].includes(input.gender)) {
    errors.push(locale === 'en' ? 'gender must be 1 (male) or 2 (female)' : localizeText('gender 只能为 1(男) 或 2(女)', locale));
  }

  if (input.calendar_type !== undefined && ![1, 2].includes(input.calendar_type)) {
    errors.push(locale === 'en' ? 'calendar_type must be 1 (solar) or 2 (lunar)' : localizeText('calendar_type 只能为 1(公历) 或 2(农历)', locale));
  }

  if (input.birth_longitude !== undefined) {
    if (typeof input.birth_longitude !== 'number' || input.birth_longitude < -180 || input.birth_longitude > 180) {
      errors.push(locale === 'en' ? 'birth_longitude must be a number between -180 and 180' : localizeText('birth_longitude 需为 -180 到 180 之间的数字', locale));
    }
  }

  if (input.birth_latitude !== undefined) {
    if (typeof input.birth_latitude !== 'number' || input.birth_latitude < -90 || input.birth_latitude > 90) {
      errors.push(locale === 'en' ? 'birth_latitude must be a number between -90 and 90' : localizeText('birth_latitude 需为 -90 到 90 之间的数字', locale));
    }
  }

  if (input.birth_timezone) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: input.birth_timezone }).format();
    } catch (_) {
      errors.push(locale === 'en' ? 'birth_timezone must be a valid IANA time zone' : localizeText('birth_timezone 必须是有效的 IANA 时区', locale));
    }
  }

  if (input.is_leap_month && input.calendar_type !== 2) {
    errors.push(locale === 'en' ? 'is_leap_month is only valid for lunar dates' : localizeText('is_leap_month 仅适用于农历日期', locale));
  }

  if (![1, 2].includes(input.sect)) {
    errors.push(locale === 'en' ? 'sect must be 1 or 2' : localizeText('sect 只能为 1 或 2', locale));
  }

  return errors;
}

module.exports = { chart, cycles, validateInput, normalizeInput };

import legacyEngine = require('./legacy/engine.js');

import type {
  ChartInput,
  ChartResult,
  CycleInput,
  CycleResult,
  EngineEnvelope,
  LegacyChartData,
  LegacyChartInput,
  LegacyCycleData,
} from './types.js';

export * from './types.js';

export const ENGINE_VERSION = '0.1.0';

export class ChartEngineError extends Error {
  readonly code: number;

  constructor(message: string, code = 500) {
    super(message);
    this.name = code === 400 ? 'ChartValidationError' : 'ChartEngineError';
    this.code = code;
  }
}

function toLegacyInput(input: ChartInput): LegacyChartInput {
  if (input.trueSolarTime === true && (input.longitude === undefined || !input.timeZone)) {
    throw new ChartEngineError('trueSolarTime requires longitude and timeZone', 400);
  }

  return {
    profile_id: input.profileId,
    name: input.name,
    gender: input.gender === 'male' ? 1 : 2,
    calendar_type: input.calendar === 'lunar' ? 2 : 1,
    birth_date: input.birthDate,
    birth_time: input.birthTime,
    birth_longitude: input.longitude,
    birth_latitude: input.latitude,
    birth_timezone: input.timeZone,
    locale: input.locale ?? 'zh-CN',
    is_leap_month: input.leapMonth ?? false,
    sect: input.sect ?? 2,
    use_true_solar_time: input.trueSolarTime ?? (input.longitude !== undefined && Boolean(input.timeZone)),
  };
}

function unwrap<T>(result: EngineEnvelope<T>): T {
  if (result.code !== 0 || result.data === null) {
    throw new ChartEngineError(result.message, result.code);
  }
  return result.data;
}

/** Typed, exception-based API for new integrations. */
export function calculateChart(input: ChartInput): ChartResult {
  const data = unwrap(chart(toLegacyInput(input)));
  return {
    inputDateTime: data.input_datetime,
    solarDateTime: data.solar_datetime,
    chartDateTime: data.chart_datetime,
    timeCorrections: data.time_corrections,
    coreChart: data.core_chart,
    cycles: data.cycles,
    shenSha: data.shen_sha,
    normalizedChart: data.normalized_chart,
  };
}

/** Typed, exception-based API for on-demand yearly/monthly/daily cycles. */
export function calculateCycles(input: CycleInput): CycleResult {
  const legacyInput: LegacyChartInput = {
    ...toLegacyInput(input),
    target_year: input.targetYear,
    target_month: input.targetMonth,
    target_date: input.targetDate,
  };
  const data = unwrap(cycles(legacyInput));
  return {
    year: data.year,
    month: data.month,
    yearCycle: data.year_cycle,
    monthlyCycles: data.monthly_cycles,
    dailyCycles: data.daily_cycles,
    locale: data.locale,
    terminologyVersion: data.terminology_version,
  };
}

/** Legacy result envelope retained for existing PHP/CLI consumers. */
export function chart(input: LegacyChartInput): EngineEnvelope<LegacyChartData> {
  return legacyEngine.chart(input as never) as EngineEnvelope<LegacyChartData>;
}

/** Legacy result envelope retained for existing PHP/CLI consumers. */
export function cycles(input: LegacyChartInput): EngineEnvelope<LegacyCycleData> {
  return legacyEngine.cycles(input as never) as EngineEnvelope<LegacyCycleData>;
}

export function validateInput(input: LegacyChartInput): string[] {
  const normalized = legacyEngine.normalizeInput(input);
  return legacyEngine.validateInput(normalized, normalized.locale);
}

export function getEngineInfo() {
  return {
    name: 'xuantian-bazi',
    version: ENGINE_VERSION,
    license: 'MIT',
    locales: ['zh-CN', 'zh-TW', 'en'] as const,
    calendars: ['solar', 'lunar'] as const,
  };
}

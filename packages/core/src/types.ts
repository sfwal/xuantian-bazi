export type Locale = 'zh-CN' | 'zh-TW' | 'en';
export type Gender = 'male' | 'female';
export type CalendarType = 'solar' | 'lunar';

export interface ChartInput {
  name?: string;
  profileId?: string | number;
  gender: Gender;
  calendar?: CalendarType;
  birthDate: string;
  birthTime: string;
  longitude?: number;
  latitude?: number;
  timeZone?: string;
  locale?: Locale;
  leapMonth?: boolean;
  /** 1: 23:00 starts the next day; 2: late Zi hour remains on the same day. */
  sect?: 1 | 2;
  /** Defaults to true only when both longitude and timeZone are provided. */
  trueSolarTime?: boolean;
}

export interface CycleInput extends ChartInput {
  targetYear: number;
  targetMonth?: number;
  targetDate?: string;
}

export interface LegacyChartInput {
  profile_id?: string | number;
  name?: string;
  gender: 0 | 1 | 2 | string | number;
  calendar_type?: 1 | 2 | string | number;
  birth_date: string;
  birth_time: string;
  birth_place?: string;
  birth_country?: string;
  birth_city?: string;
  birth_longitude?: number | string;
  birth_latitude?: number | string;
  birth_timezone?: string;
  locale?: Locale | string;
  lang?: string;
  is_leap_month?: boolean | 0 | 1;
  sect?: 1 | 2;
  use_true_solar_time?: boolean;
  target_year?: number | string;
  target_month?: number | string;
  target_date?: string;
}

export interface EngineEnvelope<T> {
  code: number;
  message: string;
  data: T | null;
}

export interface NormalizedChart extends Record<string, unknown> {
  profile_name: string;
  profile_gender: number;
  birth_date: string;
  birth_time: string;
  solar_datetime: string;
  lunar_datetime: string;
  true_solar_datetime: string | null;
  year_pillar: string;
  month_pillar: string;
  day_pillar: string;
  hour_pillar: string;
  day_master: string;
  day_master_element: string;
  zodiac: string;
  pillars: Array<Record<string, unknown>>;
  decade_cycles: Array<Record<string, unknown>>;
  yearly_cycles: Array<Record<string, unknown>>;
  shen_sha_insights: Array<Record<string, unknown>>;
  engine_version: string;
  locale: Locale;
  terminology_version: string;
}

export interface LegacyChartData extends Record<string, unknown> {
  input_datetime: string;
  solar_datetime: string;
  chart_datetime: string;
  time_corrections: Record<string, unknown>;
  core_chart: Record<string, unknown>;
  cycles: Record<string, unknown>;
  shen_sha: Record<string, unknown>;
  normalized_chart: NormalizedChart;
}

export interface ChartResult {
  inputDateTime: string;
  solarDateTime: string;
  chartDateTime: string;
  timeCorrections: Record<string, unknown>;
  coreChart: Record<string, unknown>;
  cycles: Record<string, unknown>;
  shenSha: Record<string, unknown>;
  normalizedChart: NormalizedChart;
}

export interface LegacyCycleData extends Record<string, unknown> {
  year: number;
  month: number | null;
  year_cycle: Record<string, unknown>;
  monthly_cycles: Array<Record<string, unknown>>;
  daily_cycles: Array<Record<string, unknown>>;
  locale: Locale;
  terminology_version: string;
}

export interface CycleResult {
  year: number;
  month: number | null;
  yearCycle: Record<string, unknown>;
  monthlyCycles: Array<Record<string, unknown>>;
  dailyCycles: Array<Record<string, unknown>>;
  locale: Locale;
  terminologyVersion: string;
}

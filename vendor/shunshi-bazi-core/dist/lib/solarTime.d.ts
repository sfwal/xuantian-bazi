/**
 * 真太阳时 (True Solar Time) 计算 & 时辰映射。
 * Ported from shunshi/solar_time.py — identical formulas to guarantee parity.
 */
export declare const SHICHEN_NAMES: readonly ["子时", "丑时", "寅时", "卯时", "辰时", "巳时", "午时", "未时", "申时", "酉时", "戌时", "亥时"];
/**
 * 小时/分钟 → 时辰索引 (0=子 ... 11=亥)
 * Matches shunshi/solar_time.py::hour_to_shichen_index.
 */
export declare function hourToShichenIndex(hour: number, minute?: number): number;
/**
 * 时差方程 (Equation of Time), 返回分钟数。
 * EOT(t) = 9.87·sin(2B) − 7.53·cos(B) − 1.5·sin(B), B = 2π(N−81)/365
 */
export declare function equationOfTime(dayOfYear: number): number;
export interface ClockDateTime {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second?: number;
}
/**
 * 钟表时间 → 真太阳时。
 * standardMeridian 未指定时按经度四舍五入到 15° 倍数。
 */
export declare function trueSolarTime(dt: ClockDateTime, longitude: number, standardMeridian?: number): ClockDateTime;
export interface SolarTimeInfo {
    lat: number;
    lon: number;
    clockDt: ClockDateTime;
    solarDt: ClockDateTime;
    shichenIndex: number;
    shichenName: string;
    correctionMinutes: number;
}
/**
 * 一次性计算真太阳时 + 时辰。等价于 shunshi/solar_time.py::calc_solar_time_info。
 * 至少提供 city 或 {lat, lon} 其一。
 *
 * `standardMeridian` (°E) — explicit override for the clock-time reference
 * meridian. Precedence: opts.standardMeridian > cityCache override > default
 * (Math.round(longitude/15)*15). Pass this when lat/lon are in a region where
 * the default rounding is wrong — e.g. Korea (KST=135° but most longitudes
 * round to 120°) or continental Europe west of 7.5°E (CET=15° but rounds
 * to 0°).
 */
export declare function calcSolarTimeInfo(dt: ClockDateTime, opts: {
    city?: string;
    lat?: number;
    lon?: number;
    standardMeridian?: number;
}): SolarTimeInfo;

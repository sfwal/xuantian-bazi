export interface EotEngine {
  id: "approx" | "meeus";
  getEquationOfTimeMinutes(dateUtc: Date): number;
}

export type SolarEngineMode = "approx" | "meeus";
export type Disambiguation = "earlier" | "later" | "compatible" | "reject";

export interface SolarTimeInfo {
    standardMeridian: number;
    longitudeCorrection: number;
    equationOfTime: number;
    trueSolarTime: string;
    trueSolarDateTime: string;
    solarDate: string;
}

// Current openfate input
export interface TrueSolarTimeParams {
    solarYear: number;
    solarMonth: number;
    solarDay: number;
    actualHour?: number;
    actualMinute?: number;
    longitude?: number;
    timezone?: number;
    dstOffset?: number;
    hasTime: boolean;
    enableTrueSolarTime?: boolean;
    year: number; 
    month: number; 
    day: number; 
}

export interface TrueSolarTimeResult {
    solarYear: number;
    solarMonth: number;
    solarDay: number;
    solarHour?: number;
    solarMinute?: number;
    solarSecond: number;
    trueSolarDateTime: string;
    solarTimeInfo: SolarTimeInfo;
}

export interface SolarCoreInput {
  civilYear: number;
  civilMonth: number;
  civilDay: number;
  civilHour: number;
  civilMinute: number;
  longitude: number;
  standardOffsetMinutes: number; // Excludes DST
  dstOffsetMinutes: number;      // 0 / 30 / 60 ...
  eotEngine: EotEngine;
}

export interface SolarCoreResult {
  trueSolarYear: number;
  trueSolarMonth: number;
  trueSolarDay: number;
  trueSolarHour: number;
  trueSolarMinute: number;
  trueSolarSecond: number;
  longitudeCorrectionMinutes: number;
  equationOfTimeMinutes: number;
  totalCorrectionMinutes: number;
  standardMeridian: number;
  algorithm: SolarEngineMode;
}

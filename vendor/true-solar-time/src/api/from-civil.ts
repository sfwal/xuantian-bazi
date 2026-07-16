import { CivilTimeInput } from '../civil/types';
import { TrueSolarTimeDetail } from './types';
import { resolveCivilTime } from '../civil/iana-resolver';
import { calculateSolarCore } from '../core/engine';
import { approxEotEngine } from '../core/approx-eot';
import { meeusEotEngine } from '../core/meeus-eot';
import { SolarEngineMode } from '../core/types';

export interface CivilTimeOptions {
    longitude: number;
    algorithm?: SolarEngineMode;
}

/**
 * calculateTrueSolarTime
 * Parses a local calendar "clock time" (Civil Time) using either its timezone rules or a fixed offset
 * to resolve the exact UTC instant, then maps it to True Solar Time via the selected physical algorithm.
 */
export function calculateTrueSolarTime(input: CivilTimeInput, options: CivilTimeOptions): TrueSolarTimeDetail {
    const { longitude, algorithm = 'meeus' } = options;

    // 1. Resolve civil time to an exact Instant (UTC timestamp) alongside its DST/Std offsets
    const resolved = resolveCivilTime(input);

    // 2. Compute Physical Time
    const engine = algorithm === 'approx' ? approxEotEngine : meeusEotEngine;
    
    const coreResult = calculateSolarCore({
        civilYear: resolved.calendarYear,
        civilMonth: resolved.calendarMonth,
        civilDay: resolved.calendarDay,
        civilHour: resolved.calendarHour,
        civilMinute: resolved.calendarMinute,
        longitude,
        standardOffsetMinutes: resolved.standardOffsetMinutes,
        dstOffsetMinutes: resolved.dstOffsetMinutes,
        eotEngine: engine
    });

    const pad = (n: number) => String(n).padStart(2, '0');
    return {
        civilTime: `${resolved.calendarYear}-${pad(resolved.calendarMonth)}-${pad(resolved.calendarDay)} ${pad(resolved.calendarHour)}:${pad(resolved.calendarMinute)}:00`,
        trueSolarTime: `${pad(coreResult.trueSolarHour)}:${pad(coreResult.trueSolarMinute)}:${pad(coreResult.trueSolarSecond)}`,
        trueSolarDateTime: `${coreResult.trueSolarYear}-${pad(coreResult.trueSolarMonth)}-${pad(coreResult.trueSolarDay)} ${pad(coreResult.trueSolarHour)}:${pad(coreResult.trueSolarMinute)}:${pad(coreResult.trueSolarSecond)}`,
        longitudeCorrectionMinutes: coreResult.longitudeCorrectionMinutes,
        equationOfTimeMinutes: coreResult.equationOfTimeMinutes,
        dstOffsetMinutes: resolved.dstOffsetMinutes,
        totalCorrectionMinutes: coreResult.totalCorrectionMinutes,
        longitude,
        standardMeridian: coreResult.standardMeridian,
        timeZoneId: input.timeZoneId,
        algorithm: coreResult.algorithm
    };
}

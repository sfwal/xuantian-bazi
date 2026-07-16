import { CivilTimeOptions } from './from-civil';
import { TrueSolarTimeDetail } from './types';
import { calculateSolarCore } from '../core/engine';
import { approxEotEngine } from '../core/approx-eot';
import { meeusEotEngine } from '../core/meeus-eot';
import { InstantInput } from '../civil/types';

/**
 * getOffsetsAtInstant
 * Directly computes the total UTC offset and DST split for an exact UTC instant
 * in a given IANA timezone, WITHOUT any civil-time round-trip.
 *
 * This correctly handles DST overlaps (e.g., NYC Fall Back): two different UTC
 * instants that format to the same wall-clock time will produce different offsets.
 */
function getOffsetsAtInstant(date: Date, timeZoneId: string) {
    // Extract the exact UTC offset at this precise instant using longOffset format.
    // e.g., "GMT+05:30", "GMT-04:00", "GMT+00:00"
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZoneId,
        timeZoneName: 'longOffset'
    }).formatToParts(date);

    const offsetStr = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
    const match = offsetStr.match(/GMT([+-])(\d{2}):?(\d{2})?/);

    let totalOffsetMinutes = 0;
    if (match) {
        const sign = match[1] === '-' ? -1 : 1;
        const hours = parseInt(match[2], 10);
        const mins = match[3] ? parseInt(match[3], 10) : 0;
        totalOffsetMinutes = sign * (hours * 60 + mins);
    }

    // Determine standard offset for this year by comparing Jan 1 and Jul 1.
    // Standard = the smaller of the two (handles both N and S hemisphere DST).
    const getYearOffset = (d: Date, month0: number) => {
        const probe = new Date(Date.UTC(d.getUTCFullYear(), month0, 1));
        const probeParts = new Intl.DateTimeFormat('en-US', {
            timeZone: timeZoneId, timeZoneName: 'longOffset'
        }).formatToParts(probe);
        const probeStr = probeParts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
        const m = probeStr.match(/GMT([+-])(\d{2}):?(\d{2})?/);
        if (!m) return 0;
        const s = m[1] === '-' ? -1 : 1;
        return s * (parseInt(m[2], 10) * 60 + (m[3] ? parseInt(m[3], 10) : 0));
    };

    const janOffset = getYearOffset(date, 0);
    const julOffset = getYearOffset(date, 6);
    const standardOffsetMinutes = Math.min(janOffset, julOffset);
    const dstOffsetMinutes = Math.max(0, totalOffsetMinutes - standardOffsetMinutes);

    return { totalOffsetMinutes, standardOffsetMinutes, dstOffsetMinutes };
}

/**
 * getWallClockAtInstant
 * Extracts the local wall-clock components from an exact UTC instant.
 */
function getWallClockAtInstant(date: Date, timeZoneId: string) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZoneId,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
    }).formatToParts(date);

    let year = 0, month = 0, day = 0, hour = 0, minute = 0;
    for (const part of parts) {
        if (part.type === 'year')   year   = parseInt(part.value, 10);
        if (part.type === 'month')  month  = parseInt(part.value, 10);
        if (part.type === 'day')    day    = parseInt(part.value, 10);
        if (part.type === 'hour') {
            hour = parseInt(part.value, 10);
            if (hour === 24) hour = 0;
        }
        if (part.type === 'minute') minute = parseInt(part.value, 10);
    }
    return { year, month, day, hour, minute };
}

/**
 * getTrueSolarTimeFromInstant
 * Takes an exact UTC instant (JS Date) and computes True Solar Time at a given longitude.
 *
 * Crucially, offsets are extracted DIRECTLY from the instant — no civil‐time round-trip.
 * This correctly distinguishes the two occurrences of an ambiguous wall-clock time
 * during a DST Fall-Back overlap.
 */
export function getTrueSolarTimeFromInstant(input: InstantInput, options: CivilTimeOptions): TrueSolarTimeDetail {
    const { date, timeZoneId } = input;
    const { longitude, algorithm = 'meeus' } = options;

    // 1. Wall-clock display (for reference/output only — NOT used for offset resolution)
    const { year, month, day, hour, minute } = getWallClockAtInstant(date, timeZoneId);

    // 2. Offsets at THIS exact instant — preserves DST overlap identity
    const { standardOffsetMinutes, dstOffsetMinutes } = getOffsetsAtInstant(date, timeZoneId);

    // 3. Compute solar time
    const engine = algorithm === 'approx' ? approxEotEngine : meeusEotEngine;

    const coreResult = calculateSolarCore({
        civilYear: year,
        civilMonth: month,
        civilDay: day,
        civilHour: hour,
        civilMinute: minute,
        longitude,
        standardOffsetMinutes,
        dstOffsetMinutes,
        eotEngine: engine
    });

    const pad = (n: number) => String(n).padStart(2, '0');
    return {
        civilTime: `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:00`,
        trueSolarTime: `${pad(coreResult.trueSolarHour)}:${pad(coreResult.trueSolarMinute)}:${pad(coreResult.trueSolarSecond)}`,
        trueSolarDateTime: `${coreResult.trueSolarYear}-${pad(coreResult.trueSolarMonth)}-${pad(coreResult.trueSolarDay)} ${pad(coreResult.trueSolarHour)}:${pad(coreResult.trueSolarMinute)}:${pad(coreResult.trueSolarSecond)}`,
        longitudeCorrectionMinutes: coreResult.longitudeCorrectionMinutes,
        equationOfTimeMinutes: coreResult.equationOfTimeMinutes,
        dstOffsetMinutes,
        totalCorrectionMinutes: coreResult.totalCorrectionMinutes,
        longitude,
        standardMeridian: coreResult.standardMeridian,
        timeZoneId,
        algorithm: coreResult.algorithm
    };
}

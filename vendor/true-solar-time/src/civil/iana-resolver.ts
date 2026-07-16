import { CivilTimeInput, ResolvedCivilTime } from "./types";

// --------------------------------------------------------------------------
// Internal: parse a longOffset string like "GMT+08:00" or "GMT-05:30"
// --------------------------------------------------------------------------
function parseOffsetString(offsetStr: string): number {
    const match = offsetStr.match(/GMT([+-])(\d{2}):?(\d{2})?/);
    if (!match) return 0;
    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2], 10);
    const mins  = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours * 60 + mins);
}

// --------------------------------------------------------------------------
// Internal: get the exact UTC offset (in minutes) for a given instant + TZ
// --------------------------------------------------------------------------
function getOffsetAtInstant(date: Date, timeZoneId: string): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZoneId,
        timeZoneName: 'longOffset'
    }).formatToParts(date);
    const str = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
    return parseOffsetString(str);
}

// --------------------------------------------------------------------------
// Internal: derive standard vs DST split for a given instant + TZ
// Uses Jan 1 / Jul 1 probes — covers both hemisphere conventions.
// --------------------------------------------------------------------------
function computeOffsets(date: Date, timeZoneId: string) {
    const totalOffsetMinutes = getOffsetAtInstant(date, timeZoneId);

    const jan1 = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const jul1 = new Date(Date.UTC(date.getUTCFullYear(), 6, 1));
    const janOffset = getOffsetAtInstant(jan1, timeZoneId);
    const julOffset = getOffsetAtInstant(jul1, timeZoneId);

    const standardOffsetMinutes = Math.min(janOffset, julOffset);
    const dstOffsetMinutes = Math.max(0, totalOffsetMinutes - standardOffsetMinutes);

    return { totalOffsetMinutes, standardOffsetMinutes, dstOffsetMinutes };
}

// --------------------------------------------------------------------------
// Internal: format a UTC instant into local wall-clock components
// --------------------------------------------------------------------------
function formatLocalParts(date: Date, timeZoneId: string) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZoneId,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
    }).formatToParts(date);

    let year = 0, month = 0, day = 0, hour = 0, minute = 0, second = 0;
    for (const p of parts) {
        if (p.type === 'year')   year   = parseInt(p.value, 10);
        if (p.type === 'month')  month  = parseInt(p.value, 10);
        if (p.type === 'day')    day    = parseInt(p.value, 10);
        if (p.type === 'hour')  { hour = parseInt(p.value, 10); if (hour === 24) hour = 0; }
        if (p.type === 'minute') minute = parseInt(p.value, 10);
        if (p.type === 'second') second = parseInt(p.value, 10);
    }
    return { year, month, day, hour, minute, second };
}

// --------------------------------------------------------------------------
// resolveCivilTime
// Converts a wall-clock "civil time" → exact UTC instant + offset breakdown.
//
// Supports two modes:
//   • timeZoneId  — IANA string ("Asia/Shanghai"). Uses 1-minute-step probing
//                   so that even historically odd offsets (e.g. UTC+5:45:00)
//                   are discovered. Handles gaps and overlaps via disambiguation.
//   • timeZoneOffset + optional dstOffset — raw numeric shortcut; resolves
//                   deterministically without any probing.
// --------------------------------------------------------------------------
export function resolveCivilTime(input: CivilTimeInput): ResolvedCivilTime {
    const {
        year, month, day, hour, minute, second = 0,
        timeZoneId, timeZoneOffset, dstOffset = 0,
        disambiguation = 'compatible'
    } = input;

    // ------------------------------------------------------------------
    // Fast path — raw numeric offset
    // ------------------------------------------------------------------
    if (timeZoneId === undefined && timeZoneOffset !== undefined) {
        const totalOffsetMinutes = (timeZoneOffset + dstOffset) * 60;
        const utcTimestamp = Date.UTC(year, month - 1, day, hour, minute, second)
                           - totalOffsetMinutes * 60_000;
        return {
            calendarYear: year, calendarMonth: month, calendarDay: day,
            calendarHour: hour, calendarMinute: minute,
            utcTimestamp,
            standardOffsetMinutes: timeZoneOffset * 60,
            dstOffsetMinutes: dstOffset * 60,
            totalOffsetMinutes
        };
    }

    if (!timeZoneId) throw new Error('Must provide either timeZoneId or timeZoneOffset.');

    // ------------------------------------------------------------------
    // IANA path — 1-minute step probing
    //
    // Strategy: the desired wall-clock (year/month/day/hour/minute/second)
    // can correspond to 0, 1, or 2 UTC offsets depending on zone rules.
    // We iterate every valid whole-minute UTC offset from −14:00 to +14:00
    // (covering all historical and current offsets) and collect every UTC
    // instant that formats back to the target civil time.
    // ------------------------------------------------------------------
    const baseMs = Date.UTC(year, month - 1, day, hour, minute, second);
    const candidates: Date[] = [];

    for (let offsetMinutes = -14 * 60; offsetMinutes <= 14 * 60; offsetMinutes++) {
        const probeDate = new Date(baseMs - offsetMinutes * 60_000);

        // Only accept if this offset actually applies to this instant in the tz
        const actualOffset = getOffsetAtInstant(probeDate, timeZoneId);
        if (actualOffset !== offsetMinutes) continue;

        // Double-check: the probe date formats exactly to the desired civil time
        const local = formatLocalParts(probeDate, timeZoneId);
        if (
            local.year === year && local.month === month && local.day === day &&
            local.hour === hour && local.minute === minute && local.second === second
        ) {
            candidates.push(probeDate);
        }
    }

    // Deduplicate by timestamp
    const seen = new Set<number>();
    const unique = candidates.filter(c => {
        if (seen.has(c.getTime())) return false;
        seen.add(c.getTime());
        return true;
    }).sort((a, b) => a.getTime() - b.getTime());

    let selectedUtc: Date;

    if (unique.length === 0) {
        // GAP (Spring Forward): civil time does not exist
        if (disambiguation === 'reject') {
            throw new Error(`Civil time ${year}-${month}-${day} ${hour}:${minute} does not exist in ${timeZoneId} (DST gap).`);
        }
        // Find the first instant after the gap boundary by scanning forward
        // from just before the target — the convention is to land at the end of the gap.
        const preBoundary = new Date(baseMs - 60 * 60_000); // 1 h before
        const gapBoundaryOffset = getOffsetAtInstant(preBoundary, timeZoneId);
        selectedUtc = new Date(baseMs - gapBoundaryOffset * 60_000);
    } else if (unique.length === 1) {
        selectedUtc = unique[0];
    } else {
        // OVERLAP (Fall Back): two valid UTC instants for same wall-clock
        if (disambiguation === 'reject') {
            throw new Error(`Civil time ${year}-${month}-${day} ${hour}:${minute} is ambiguous in ${timeZoneId} (DST overlap).`);
        }
        selectedUtc = (disambiguation === 'later')
            ? unique[unique.length - 1]   // standard time occurrence
            : unique[0];                  // DST occurrence ('earlier' | 'compatible')
    }

    const offsets = computeOffsets(selectedUtc, timeZoneId);
    const local = formatLocalParts(selectedUtc, timeZoneId);

    return {
        calendarYear: local.year, calendarMonth: local.month, calendarDay: local.day,
        calendarHour: local.hour, calendarMinute: local.minute,
        utcTimestamp: selectedUtc.getTime(),
        ...offsets
    };
}

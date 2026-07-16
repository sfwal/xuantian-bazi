"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTrueSolarTime = calculateTrueSolarTime;
const iana_resolver_1 = require("../civil/iana-resolver");
const engine_1 = require("../core/engine");
const approx_eot_1 = require("../core/approx-eot");
const meeus_eot_1 = require("../core/meeus-eot");
/**
 * calculateTrueSolarTime
 * Parses a local calendar "clock time" (Civil Time) using either its timezone rules or a fixed offset
 * to resolve the exact UTC instant, then maps it to True Solar Time via the selected physical algorithm.
 */
function calculateTrueSolarTime(input, options) {
    const { longitude, algorithm = 'meeus' } = options;
    // 1. Resolve civil time to an exact Instant (UTC timestamp) alongside its DST/Std offsets
    const resolved = (0, iana_resolver_1.resolveCivilTime)(input);
    // 2. Compute Physical Time
    const engine = algorithm === 'approx' ? approx_eot_1.approxEotEngine : meeus_eot_1.meeusEotEngine;
    const coreResult = (0, engine_1.calculateSolarCore)({
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
    const pad = (n) => String(n).padStart(2, '0');
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

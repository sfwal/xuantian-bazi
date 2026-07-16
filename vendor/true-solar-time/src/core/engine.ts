import { SolarCoreInput, SolarCoreResult } from './types';

export function calculateSolarCore(input: SolarCoreInput): SolarCoreResult {
    const {
        civilYear,
        civilMonth,
        civilDay,
        civilHour,
        civilMinute,
        longitude,
        standardOffsetMinutes,
        dstOffsetMinutes,
        eotEngine
    } = input;

    // The original logic calculates standardMeridian and applies longitudeCorrection relative to it!
    const standardMeridian = standardOffsetMinutes / 60 * 15;

    // Normalize to the shortest signed arc [-180, 180] to prevent
    // a 360° error (= 1440 min = 1 day) in date-line crossing cases.
    const rawLongDiff = longitude - standardMeridian;
    const longDiff = ((rawLongDiff + 540) % 360) - 180;

    const longitudeCorrectionMinutes = longDiff * 4;

    // In v1, it was:
    // const baseUtc = Date.UTC(solarYear, solarMonth - 1, solarDay, actualHour!, actualMinute!, 0);
    // const correctedTimestamp = baseUtc + (totalCorrection * 60 * 1000);
    // const correctedDate = new Date(correctedTimestamp);
    // We do exactly this.
    const baseUtcTimestamp = Date.UTC(civilYear, civilMonth - 1, civilDay, civilHour, civilMinute, 0);

    // We still need actual UTC for Meeus, so we'll compute it strictly for that.
    const totalOffsetMinutes = standardOffsetMinutes + dstOffsetMinutes;
    const exactUtcTimestamp = baseUtcTimestamp - (totalOffsetMinutes * 60 * 1000);
    const exactUtcDate = new Date(exactUtcTimestamp);

    const equationOfTimeMinutes = eotEngine.getEquationOfTimeMinutes(exactUtcDate);

    // total correction is relative to the civil clock face. 
    // True Solar Time = Civil Time + Longitude Correction + EoT - DST
    const totalCorrectionMinutes = longitudeCorrectionMinutes + equationOfTimeMinutes - dstOffsetMinutes;

    const correctedTimestamp = baseUtcTimestamp + (totalCorrectionMinutes * 60 * 1000);
    const correctedDate = new Date(correctedTimestamp);

    return {
        trueSolarYear: correctedDate.getUTCFullYear(),
        trueSolarMonth: correctedDate.getUTCMonth() + 1,
        trueSolarDay: correctedDate.getUTCDate(),
        trueSolarHour: correctedDate.getUTCHours(),
        trueSolarMinute: correctedDate.getUTCMinutes(),
        trueSolarSecond: correctedDate.getUTCSeconds(),
        longitudeCorrectionMinutes,
        equationOfTimeMinutes,
        totalCorrectionMinutes,
        standardMeridian,
        algorithm: eotEngine.id
    };
}

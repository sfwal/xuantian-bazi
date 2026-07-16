/**
 * getStandardMeridian
 * Returns the standard meridian in degrees for a given timezone offset.
 * If no timezone is provided, infers from longitude (rounded to nearest 15°).
 *
 * Note: the engine (engine.ts) derives the standard meridian directly from
 * standardOffsetMinutes passed in — this helper is exposed as a utility for
 * consumers who want to compute the meridian independently.
 */
export function getStandardMeridian(longitude: number, timezone?: number): number {
    if (timezone !== undefined && timezone !== null) {
        return timezone * 15;
    }
    return Math.round(longitude / 15) * 15;
}

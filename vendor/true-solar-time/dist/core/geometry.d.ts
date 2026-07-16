/**
 * getStandardMeridian
 * Returns the standard meridian in degrees for a given timezone offset.
 * If no timezone is provided, infers from longitude (rounded to nearest 15°).
 *
 * Note: the engine (engine.ts) derives the standard meridian directly from
 * standardOffsetMinutes passed in — this helper is exposed as a utility for
 * consumers who want to compute the meridian independently.
 */
export declare function getStandardMeridian(longitude: number, timezone?: number): number;

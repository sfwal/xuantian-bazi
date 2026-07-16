import { EotEngine } from "./types";

/**
 * High-precision Equation of Time calculation based on Jean Meeus' Astronomical Algorithms.
 * This provides significantly better accuracy than the day-of-year approximation (~10 sec vs ~1-2 min variance).
 */

// Converts a standard Date object to Julian Century
function getJulianCentury(dateUtc: Date): number {
    const timeMs = dateUtc.getTime();
    // Julian Date for Unix Epoch (1970-01-01 00:00:00 UTC) is 2440587.5
    // One day is 86400000 milliseconds
    const jd = (timeMs / 86400000.0) + 2440587.5;
    // J2000 epoch is 2451545.0
    // A Julian Century has 36525 days
    return (jd - 2451545.0) / 36525.0;
}

// Convert degrees to radians
function degToRad(degrees: number): number {
    return degrees * Math.PI / 180.0;
}

/**
 * calculateMeeusEquationOfTime
 * Returns the Equation of Time in minutes for a given UTC Date.
 */
export function calculateMeeusEquationOfTime(dateUtc: Date): number {
    const t = getJulianCentury(dateUtc);

    // Geometric Mean Longitude of the Sun
    let L0 = 280.46646 + t * (36000.76983 + t * 0.0003032);
    L0 = L0 % 360.0;
    if (L0 < 0) L0 += 360.0;

    // Geometric Mean Anomaly of the Sun
    let M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
    
    // Eccentricity of the Earth's Orbit
    const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);

    // Sun's Equation of Center
    const C = Math.sin(degToRad(M)) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
              Math.sin(degToRad(2 * M)) * (0.019993 - 0.000101 * t) +
              Math.sin(degToRad(3 * M)) * 0.000289;

    // Sun's True Longitude
    const sunTrueLong = L0 + C;

    // Obliquity of the Ecliptic (Mean)
    const eclipticMeanObliquity = 23.0 + (26.0 + ((21.448 - t * (46.8150 + t * (0.00059 - t * 0.001813)))) / 60.0) / 60.0;

    // Obliquity of the Ecliptic (Corrected)
    const omega = 125.04 - 1934.136 * t;
    const eclipticObliquity = eclipticMeanObliquity + 0.00256 * Math.cos(degToRad(omega));

    // Calculate Equation of Time (EoT)
    const y = Math.pow(Math.tan(degToRad(eclipticObliquity / 2.0)), 2);

    const sin2l0 = Math.sin(degToRad(2.0 * L0));
    const sinm = Math.sin(degToRad(M));
    const cos2l0 = Math.cos(degToRad(2.0 * L0));
    const sin4l0 = Math.sin(degToRad(4.0 * L0));
    const sin2m = Math.sin(degToRad(2.0 * M));

    const eotMinutes = y * sin2l0 - 
                       2.0 * e * sinm + 
                       4.0 * e * y * sinm * cos2l0 - 
                       0.5 * y * y * sin4l0 - 
                       1.25 * e * e * sin2m;

    // Convert from radians to minutes of time (1 radian = 4 minutes approx, but exactly eotMinutes in degrees * 4)
    // Actually the standard formula yields radians. Rad * (180/PI) * 4 = Minutes.
    return (eotMinutes * 180 / Math.PI) * 4.0;
}

export const meeusEotEngine: EotEngine = {
    id: "meeus",
    getEquationOfTimeMinutes(dateUtc: Date) {
        return calculateMeeusEquationOfTime(dateUtc);
    }
};

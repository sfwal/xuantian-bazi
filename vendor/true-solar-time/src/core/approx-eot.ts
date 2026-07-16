import { EotEngine } from './types';

/**
 * calculateEquationOfTime - Calculates Equation of Time (EoT) in minutes
 * This is the legacy approximation algorithm based on day-of-year.
 */
export function calculateEquationOfTime(year: number, month: number, day: number): number {
    const start = new Date(Date.UTC(year, 0, 0));
    const current = new Date(Date.UTC(year, month - 1, day));
    const diff = current.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const B = (360 * (dayOfYear - 81)) / 365;
    const bRad = B * (Math.PI / 180);

    return 9.87 * Math.sin(2 * bRad) -
        7.53 * Math.cos(bRad) -
        1.5 * Math.sin(bRad);
}

export const approxEotEngine: EotEngine = {
    id: "approx",
    getEquationOfTimeMinutes(dateUtc: Date) {
        return calculateEquationOfTime(
            dateUtc.getUTCFullYear(),
            dateUtc.getUTCMonth() + 1,
            dateUtc.getUTCDate()
        );
    }
};

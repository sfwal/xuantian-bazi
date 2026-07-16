import { EotEngine } from './types';
/**
 * calculateEquationOfTime - Calculates Equation of Time (EoT) in minutes
 * This is the legacy approximation algorithm based on day-of-year.
 */
export declare function calculateEquationOfTime(year: number, month: number, day: number): number;
export declare const approxEotEngine: EotEngine;

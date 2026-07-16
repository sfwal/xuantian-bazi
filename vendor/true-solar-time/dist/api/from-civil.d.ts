import { CivilTimeInput } from '../civil/types';
import { TrueSolarTimeDetail } from './types';
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
export declare function calculateTrueSolarTime(input: CivilTimeInput, options: CivilTimeOptions): TrueSolarTimeDetail;

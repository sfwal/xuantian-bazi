import { CivilTimeOptions } from './from-civil';
import { TrueSolarTimeDetail } from './types';
import { InstantInput } from '../civil/types';
/**
 * getTrueSolarTimeFromInstant
 * Takes an exact UTC instant (JS Date) and computes True Solar Time at a given longitude.
 *
 * Crucially, offsets are extracted DIRECTLY from the instant — no civil‐time round-trip.
 * This correctly distinguishes the two occurrences of an ambiguous wall-clock time
 * during a DST Fall-Back overlap.
 */
export declare function getTrueSolarTimeFromInstant(input: InstantInput, options: CivilTimeOptions): TrueSolarTimeDetail;

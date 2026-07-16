import { SolarEngineMode } from '../core/types';
export interface TrueSolarTimeDetail {
    civilTime: string;
    trueSolarTime: string;
    trueSolarDateTime: string;
    longitudeCorrectionMinutes: number;
    equationOfTimeMinutes: number;
    dstOffsetMinutes: number;
    totalCorrectionMinutes: number;
    longitude: number;
    standardMeridian: number;
    timeZoneId?: string;
    algorithm: SolarEngineMode;
}

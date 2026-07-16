import { SolarEngineMode } from '../core/types';

export interface TrueSolarTimeDetail {
    civilTime: string; // YYYY-MM-DD HH:mm:ss
    trueSolarTime: string; // HH:mm:ss
    trueSolarDateTime: string; // YYYY-MM-DD HH:mm:ss
    
    // Core Corrections
    longitudeCorrectionMinutes: number;
    equationOfTimeMinutes: number;
    dstOffsetMinutes: number;
    totalCorrectionMinutes: number;
    
    // Geometry
    longitude: number;
    standardMeridian: number;
    
    // Meta
    timeZoneId?: string;
    algorithm: SolarEngineMode;
}

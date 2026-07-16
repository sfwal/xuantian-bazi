export type DisambiguationMode = "earlier" | "later" | "compatible" | "reject";

export interface CivilTimeInput {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second?: number;
    timeZoneId?: string;
    timeZoneOffset?: number; // e.g., 8 for UTC+8, or -5 for UTC-5
    dstOffset?: number; // e.g., 1 if the location is observing +1 Hour DST
    disambiguation?: DisambiguationMode;
}

export interface InstantInput {
    date: Date; // A fixed UTC point in time
    timeZoneId: string;
}

export interface ResolvedCivilTime {
    calendarYear: number;
    calendarMonth: number;
    calendarDay: number;
    calendarHour: number;
    calendarMinute: number;
    
    // Exact timestamp
    utcTimestamp: number;
    
    // The exact DST/Std offsets that apply to this moment
    standardOffsetMinutes: number;
    dstOffsetMinutes: number;
    totalOffsetMinutes: number;
}

export type DisambiguationMode = "earlier" | "later" | "compatible" | "reject";
export interface CivilTimeInput {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second?: number;
    timeZoneId?: string;
    timeZoneOffset?: number;
    dstOffset?: number;
    disambiguation?: DisambiguationMode;
}
export interface InstantInput {
    date: Date;
    timeZoneId: string;
}
export interface ResolvedCivilTime {
    calendarYear: number;
    calendarMonth: number;
    calendarDay: number;
    calendarHour: number;
    calendarMinute: number;
    utcTimestamp: number;
    standardOffsetMinutes: number;
    dstOffsetMinutes: number;
    totalOffsetMinutes: number;
}

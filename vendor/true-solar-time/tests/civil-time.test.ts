import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { resolveCivilTime } from '../src/civil/iana-resolver';

describe('IANA Civil Time Resolver', () => {

    test('Standard Time', () => {
        const result = resolveCivilTime({
            year: 2024, month: 1, day: 1, hour: 12, minute: 0,
            timeZoneId: 'America/New_York'
        });
        
        assert.equal(result.calendarHour, 12);
        assert.equal(result.standardOffsetMinutes, -300); // UTC-5
        assert.equal(result.dstOffsetMinutes, 0);
        assert.equal(result.totalOffsetMinutes, -300);
        
        const utcDate = new Date(result.utcTimestamp);
        assert.equal(utcDate.getUTCHours(), 17); // 12:00 EDT - (-5h) = 17:00 UTC
    });

    test('Daylight Saving Time (DST)', () => {
        const result = resolveCivilTime({
            year: 2024, month: 7, day: 1, hour: 12, minute: 0,
            timeZoneId: 'America/New_York'
        });
        
        assert.equal(result.standardOffsetMinutes, -300); // UTC-5
        assert.equal(result.dstOffsetMinutes, 60);        // +1h
        assert.equal(result.totalOffsetMinutes, -240);    // UTC-4
        
        const utcDate = new Date(result.utcTimestamp);
        assert.equal(utcDate.getUTCHours(), 16); // 12:00 EDT - (-4h) = 16:00 UTC
    });

    test('Singapore Historic Offset', () => {
        const result = resolveCivilTime({
            year: 1970, month: 1, day: 1, hour: 12, minute: 0,
            timeZoneId: 'Asia/Singapore'
        });
        
        // Before 1982, SG was UTC+7:30
        assert.equal(result.totalOffsetMinutes, 450); 
    });

    test('Modern Singapore Offset', () => {
        const result = resolveCivilTime({
            year: 2024, month: 1, day: 1, hour: 12, minute: 0,
            timeZoneId: 'Asia/Singapore'
        });
        
        // After 1982, SG is UTC+8:00
        assert.equal(result.totalOffsetMinutes, 480); 
    });

});

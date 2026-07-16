import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getTrueSolarTimeFromInstant } from '../src/api/from-instant';

describe('getTrueSolarTimeFromInstant — Instant-level correctness', () => {

    /**
     * NYC Fall-Back 2023 (DST overlap)
     * On 2023-11-05 at 02:00:00 ET, clocks fall back to 01:00:00.
     *
     * The "first" 01:30 (EDT, UTC-4)  → UTC 2023-11-05T05:30:00Z
     * The "second" 01:30 (EST, UTC-5) → UTC 2023-11-05T06:30:00Z
     *
     * These two UTC instants MUST produce DIFFERENT True Solar Times because
     * they have different DST offsets (DST: 60 min vs 0 min).
     */
    test('DST overlap: two different instants with same wall-clock → different solar times', () => {
        const longitude = -74.006; // NYC

        // First 01:30 — EDT (UTC-4, DST active)
        const firstInstant = new Date('2023-11-05T05:30:00.000Z');
        // Second 01:30 — EST (UTC-5, DST inactive)
        const secondInstant = new Date('2023-11-05T06:30:00.000Z');

        const r1 = getTrueSolarTimeFromInstant({ date: firstInstant,  timeZoneId: 'America/New_York' }, { longitude });
        const r2 = getTrueSolarTimeFromInstant({ date: secondInstant, timeZoneId: 'America/New_York' }, { longitude });

        // Both should display 01:30 as the civil time
        assert.equal(r1.civilTime.includes('01:30'), true, 'first  should show wall-clock 01:30');
        assert.equal(r2.civilTime.includes('01:30'), true, 'second should show wall-clock 01:30');

        // BUT their solar times must differ (DST offset differs by 60 min → solar time shifts by 1 hour)
        assert.notEqual(r1.trueSolarTime, r2.trueSolarTime,
            `Solar times must differ for two different instants. Got both: ${r1.trueSolarTime}`);

        // DST flags must correctly reflect the two occurrences
        assert.equal(r1.dstOffsetMinutes, 60, 'first  occurrence: DST active (60 min)');
        assert.equal(r2.dstOffsetMinutes, 0,  'second occurrence: DST inactive (0 min)');
    });

    test('Standard time instant resolves correctly', () => {
        // 2024-01-01 12:00 NYC (EST = UTC-5)
        const date = new Date('2024-01-01T17:00:00.000Z');
        const r = getTrueSolarTimeFromInstant({ date, timeZoneId: 'America/New_York' }, { longitude: -74.006 });

        assert.equal(r.civilTime.includes('12:00'), true);
        assert.equal(r.dstOffsetMinutes, 0);
    });

    test('DST active instant resolves correctly', () => {
        // 2024-07-01 12:00 NYC (EDT = UTC-4)
        const date = new Date('2024-07-01T16:00:00.000Z');
        const r = getTrueSolarTimeFromInstant({ date, timeZoneId: 'America/New_York' }, { longitude: -74.006 });

        assert.equal(r.civilTime.includes('12:00'), true);
        assert.equal(r.dstOffsetMinutes, 60);
    });
});

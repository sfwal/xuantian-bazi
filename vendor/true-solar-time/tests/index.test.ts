import { calculateTrueSolarTime } from '../src/index';

interface TestCase {
    name: string;
    input: {
        solarYear: number;
        solarMonth: number;
        solarDay: number;
        actualHour: number;
        actualMinute: number;
        longitude: number;
        timezone: number;
        dstOffset: number;
        hasTime: boolean;
        enableTrueSolarTime: boolean;
        year: number;
        month: number;
        day: number;
    };
    expected: {
        trueSolarTime?: string;
        solarDate?: string;
        useTolerance?: boolean;
    };
    category: 'Geo' | 'EoT' | 'History' | 'Bazi';
}

// Helper to cleanly generate test cases without boilerplate
const createCase = (
    category: TestCase['category'], name: string,
    yr: number, mo: number, d: number, h: number, m: number,
    lon: number, tz: number, dst: number,
    expTime: string, expDate: string
): TestCase => ({
    category, name,
    input: { solarYear: yr, solarMonth: mo, solarDay: d, actualHour: h, actualMinute: m, longitude: lon, timezone: tz, dstOffset: dst, hasTime: true, enableTrueSolarTime: true, year: yr, month: mo, day: d },
    expected: { trueSolarTime: expTime, solarDate: expDate, useTolerance: true }
});

const testCases: TestCase[] = [
    // === I. Geographical Extremes (1-10) ===
    createCase('Geo', "[Geo] 01 Kashgar, China (76°E, UTC+8) Double Negative", 2024, 2, 11, 12, 0, 76, 8, 0, '08:50', '2024-02-11'),
    createCase('Geo', "[Geo] 02 Fuyuan, China (134°E, UTC+8) Double Positive", 2024, 11, 3, 12, 0, 134, 8, 0, '13:12', '2024-11-03'),
    createCase('Geo', "[Geo] 03 Vigo, Spain (-8.7°W, UTC+1) Extreme Western offset", 2024, 2, 11, 12, 0, -8.7, 1, 0, '10:11', '2024-02-11'),
    createCase('Geo', "[Geo] 04 Bialowieza, Poland (23.8°E, UTC+1) Extreme Eastern offset", 2024, 11, 3, 12, 0, 23.8, 1, 0, '12:51', '2024-11-03'),
    createCase('Geo', "[Geo] 05 Reykjavik, Iceland (-21.9°W, UTC+0)", 2024, 2, 11, 12, 0, -21.9, 0, 0, '10:18', '2024-02-11'),
    createCase('Geo', "[Geo] 06 Mendoza, Argentina (-68.8°W, UTC-3)", 2024, 2, 11, 12, 0, -68.8, -3, 0, '10:10', '2024-02-11'),
    createCase('Geo', "[Geo] 07 Kanyakumari, India (77.5°E, UTC+5.5)", 2024, 11, 3, 12, 0, 77.5, 5.5, 0, '11:56', '2024-11-03'),
    createCase('Geo', "[Geo] 08 Ghuar Mota, India (68.6°E, UTC+5.5)", 2024, 2, 11, 12, 0, 68.6, 5.5, 0, '10:50', '2024-02-11'),
    createCase('Geo', "[Geo] 09 Hammerfest, Norway (23.6°E, UTC+1)", 2024, 11, 3, 12, 0, 23.6, 1, 0, '12:50', '2024-11-03'),
    createCase('Geo', "[Geo] 10 Ushuaia, Argentina (-68.3°W, UTC-3)", 2024, 11, 3, 12, 0, -68.3, -3, 0, '10:43', '2024-11-03'),

    // === II. Fractional & Unusual Timezones (11-20) ===
    createCase('Geo', "[Geo] 11 New Delhi, India (77.2°E, UTC+5.5)", 2024, 11, 3, 12, 0, 77.2, 5.5, 0, '11:55', '2024-11-03'),
    createCase('Geo', "[Geo] 12 Kathmandu, Nepal (85.3°E, UTC+5.75)", 2024, 2, 11, 12, 0, 85.3, 5.75, 0, '11:42', '2024-02-11'),
    createCase('Geo', "[Geo] 13 Eucla, AUS (128.8°E, UTC+8.75)", 2024, 11, 3, 12, 0, 128.8, 8.75, 0, '12:07', '2024-11-03'),
    createCase('Geo', "[Geo] 14 Chatham Islands, NZ (-176.5°W, UTC+12.75)", 2024, 2, 11, 12, 0, -176.5, 12.75, 0, '11:14', '2024-02-11'),
    createCase('Geo', "[Geo] 15 Marquesas (-139.4°W, UTC-9.5)", 2024, 11, 3, 12, 0, -139.4, -9.5, 0, '12:29', '2024-11-03'),
    createCase('Geo', "[Geo] 16 St. John's, Newfoundland (-52.7°W, UTC-3.5)", 2024, 2, 11, 12, 0, -52.7, -3.5, 0, '11:45', '2024-02-11'),
    createCase('Geo', "[Geo] 17 Tehran, Iran (51.4°E, UTC+3.5)", 2024, 11, 3, 12, 0, 51.4, 3.5, 0, '12:12', '2024-11-03'),
    createCase('Geo', "[Geo] 18 Kabul, Afghanistan (69.2°E, UTC+4.5)", 2024, 2, 11, 12, 0, 69.2, 4.5, 0, '11:52', '2024-02-11'),
    createCase('Geo', "[Geo] 19 Yangon, Myanmar (96.1°E, UTC+6.5)", 2024, 11, 3, 12, 0, 96.1, 6.5, 0, '12:11', '2024-11-03'),
    createCase('Geo', "[Geo] 20 Lord Howe Island (159.1°E, UTC+10.5)", 2024, 2, 11, 12, 0, 159.1, 10.5, 0, '11:52', '2024-02-11'),

    // === III. International Date Line & Polar Regions (21-30) ===
    createCase('Geo', "[Geo] 21 Kiritimati, Kiribati (-157.4°W, UTC+14)", 2024, 11, 3, 12, 0, -157.4, 14, 0, '11:47', '2024-11-03'),
    createCase('Geo', "[Geo] 22 Apia, Samoa (-171.7°W, UTC+13)", 2024, 2, 11, 12, 0, -171.7, 13, 0, '11:19', '2024-02-11'),
    createCase('Geo', "[Geo] 23 Baker Island (-176.4°W, UTC-12)", 2024, 11, 3, 12, 0, -176.4, -12, 0, '12:31', '2024-11-03'),
    createCase('Geo', "[Geo] 24 Nuku'alofa, Tonga (-175.2°W, UTC+13)", 2024, 2, 11, 12, 0, -175.2, 13, 0, '11:05', '2024-02-11'),
    createCase('Geo', "[Geo] 25 Suva, Fiji (178.4°E, UTC+12)", 2024, 11, 3, 12, 0, 178.4, 12, 0, '12:10', '2024-11-03'),
    createCase('Geo', "[Geo] 26 McMurdo Station, Antarctica (166.6°E, UTC+12)", 2024, 2, 11, 12, 0, 166.6, 12, 0, '10:52', '2024-02-11'),
    createCase('Geo', "[Geo] 27 Palmer Station, Antarctica (-64.0°W, UTC-3)", 2024, 11, 3, 12, 0, -64.0, -3, 0, '11:00', '2024-11-03'),
    createCase('Geo', "[Geo] 28 Vostok Station, Antarctica (106.8°E, UTC+5)", 2024, 2, 11, 12, 0, 106.8, 5, 0, '13:53', '2024-02-11'),
    createCase('Geo', "[Geo] 29 Date line Mid West Fiji (178°E) cross year", 2024, 1, 1, 0, 5, 178, 12, 0, '23:54', '2023-12-31'),
    createCase('Geo', "[Geo] 30 Date line Mid East Baker (-176°W) next day", 2024, 1, 1, 23, 55, -176, -12, 0, '00:07', '2024-01-02'),

    // === IV. Astronomical EoT Extremes (31-40) ===
    createCase('EoT', "[EoT] 31 Max Positive (Nov 3)", 2024, 11, 3, 12, 0, 120, 8, 0, '12:16', '2024-11-03'),
    createCase('EoT', "[EoT] 32 Max Negative (Feb 11)", 2024, 2, 11, 12, 0, 120, 8, 0, '11:45', '2024-02-11'),
    createCase('EoT', "[EoT] 33 Zero Crossing 1 (Apr 15)", 2024, 4, 15, 12, 0, 120, 8, 0, '12:00', '2024-04-15'),
    createCase('EoT', "[EoT] 34 Zero Crossing 2 (Jun 13)", 2024, 6, 13, 12, 0, 120, 8, 0, '12:00', '2024-06-13'),
    createCase('EoT', "[EoT] 35 Zero Crossing 3 (Sep 1)", 2024, 9, 1, 12, 0, 120, 8, 0, '12:00', '2024-09-01'),
    createCase('EoT', "[EoT] 36 Zero Crossing 4 (Dec 25)", 2024, 12, 25, 12, 0, 120, 8, 0, '12:00', '2024-12-25'),
    createCase('EoT', "[EoT] 37 Leap Year Feb 29 boundary", 2024, 2, 29, 12, 0, 120, 8, 0, '11:46', '2024-02-29'),
    createCase('EoT', "[EoT] 38 Century Epoch (J2000)", 2000, 1, 1, 12, 0, 0, 0, 0, '11:56', '2000-01-01'),
    createCase('EoT', "[EoT] 39 Local minimum (Jul 26)", 2024, 7, 26, 12, 0, 120, 8, 0, '11:53', '2024-07-26'),
    createCase('EoT', "[EoT] 40 Local maximum (May 14)", 2024, 5, 14, 12, 0, 120, 8, 0, '12:04', '2024-05-14'),

    // === V. Historical DST & Timezone Shifts - Asia (41-50) ===
    createCase('History', "[Hist] 41 China DST Start (May 4, 1986)", 1986, 5, 4, 12, 0, 116.4, 8, 1, '10:49', '1986-05-04'),
    createCase('History', "[Hist] 42 China DST End (Sep 14, 1986)", 1986, 9, 14, 12, 0, 116.4, 8, 0, '11:50', '1986-09-14'),
    createCase('History', "[Hist] 43 China DST Peak (Jul 1, 1988)", 1988, 7, 1, 12, 0, 116.4, 8, 1, '10:42', '1988-07-01'),
    createCase('History', "[Hist] 44 Singapore historic UTC+7.5 (1970)", 1970, 1, 1, 12, 0, 103.8, 7.5, 0, '11:22', '1970-01-01'),
    createCase('History', "[Hist] 45 Singapore switch UTC+8 (1983)", 1983, 1, 1, 12, 0, 103.8, 8, 0, '10:52', '1983-01-01'),
    createCase('History', "[Hist] 46 India War Time DST (1943)", 1943, 1, 1, 12, 0, 77.2, 5.5, 1, '10:35', '1943-01-01'),
    createCase('History', "[Hist] 47 Hong Kong DST (1979)", 1979, 7, 1, 12, 0, 114.2, 8, 1, '10:33', '1979-07-01'),
    createCase('History', "[Hist] 48 Japan DST (1950)", 1950, 7, 1, 12, 0, 139.7, 9, 1, '11:15', '1950-07-01'),
    createCase('History', "[Hist] 49 South Korea Olympic DST (1988)", 1988, 7, 1, 12, 0, 127.0, 9, 1, '10:24', '1988-07-01'),
    createCase('History', "[Hist] 50 Macau historic UTC+8 (1900)", 1900, 1, 1, 12, 0, 113.5, 8, 0, '11:30', '1900-01-01'),

    // === VI. Historical DST & Timezone Shifts - Global (51-60) ===
    createCase('History', "[Hist] 51 Russia Permanent DST (2012)", 2012, 7, 1, 12, 0, 37.6, 4, 0, '10:26', '2012-07-01'),
    createCase('History', "[Hist] 52 Russia Permanent STD (2015)", 2015, 7, 1, 12, 0, 37.6, 3, 0, '11:27', '2015-07-01'),
    createCase('History', "[Hist] 53 US DST Extension (Mar 10, 2008)", 2008, 3, 10, 12, 0, -74, -5, 1, '10:54', '2008-03-10'),
    createCase('History', "[Hist] 54 US Fall Back overlap DST-active", 2023, 11, 5, 1, 30, -74, -5, 1, '00:50', '2023-11-05'),
    createCase('History', "[Hist] 55 US Fall Back overlap STD-active", 2023, 11, 5, 1, 30, -74, -5, 0, '01:50', '2023-11-05'),
    createCase('History', "[Hist] 56 UK Double Summer Time (1944)", 1944, 7, 1, 12, 0, 0, 0, 2, '09:56', '1944-07-01'),
    createCase('History', "[Hist] 57 UK Regular Summer Time (1946)", 1946, 7, 1, 12, 0, 0, 0, 1, '10:56', '1946-07-01'),
    createCase('History', "[Hist] 58 Samoa skips Friday (Dec 31, 2011)", 2011, 12, 31, 12, 0, -171.7, 13, 0, '11:30', '2011-12-31'),
    createCase('History', "[Hist] 59 Kiribati Line Islands skip (1995)", 1995, 1, 2, 12, 0, -157.4, 14, 0, '11:26', '1995-01-02'),
    createCase('History', "[Hist] 60 Lord Howe half-hour DST", 2020, 1, 1, 12, 0, 159.1, 10.5, 0.5, '11:33', '2020-01-01'),

    // === VII. Southern Hemisphere Reverse DST (61-70) ===
    createCase('History', "[Hist] 61 Sydney DST Start (Oct 2008)", 2008, 10, 5, 12, 0, 151.2, 10, 1, '11:16', '2008-10-05'),
    createCase('History', "[Hist] 62 Sydney DST End (Apr 2008)", 2008, 4, 6, 12, 0, 151.2, 10, 0, '12:02', '2008-04-06'),
    createCase('History', "[Hist] 63 Chile DST Start (Sep 2019)", 2019, 9, 8, 12, 0, -70.6, -4, 1, '10:20', '2019-09-08'),
    createCase('History', "[Hist] 64 Chile DST End (Apr 2019)", 2019, 4, 7, 12, 0, -70.6, -4, 0, '11:15', '2019-04-07'),
    createCase('History', "[Hist] 65 Brazil DST Abolished (Jan 2020)", 2020, 1, 1, 12, 0, -46.6, -3, 0, '11:50', '2020-01-01'),
    createCase('History', "[Hist] 66 Brazil Historic DST (Jan 2018)", 2018, 1, 1, 12, 0, -46.6, -3, 1, '10:50', '2018-01-01'),
    createCase('History', "[Hist] 67 NZ DST Start (Sep 2024)", 2024, 9, 29, 12, 0, 174.7, 12, 1, '10:49', '2024-09-29'),
    createCase('History', "[Hist] 68 NZ DST End (Apr 2024)", 2024, 4, 7, 12, 0, 174.7, 12, 0, '11:36', '2024-04-07'),
    createCase('History', "[Hist] 69 McMurdo Station Summer DST", 2024, 1, 1, 12, 0, 166.6, 12, 1, '10:03', '2024-01-01'),
    createCase('History', "[Hist] 70 Palmer Station Summer DST", 2024, 1, 1, 12, 0, -64.0, -3, 1, '09:41', '2024-01-01'),

    // === VIII. Bazi Critical Boundaries - Westward Rollbacks (71-80) ===
    createCase('Bazi', "[Bazi] 71 Late Zi 23:05 -> Xu Hour (Kashgar)", 2024, 2, 11, 23, 5, 76, 8, 0, '19:55', '2024-02-11'),
    createCase('Bazi', "[Bazi] 72 Early Zi 00:05 -> Xu Hour Prev Day", 2024, 2, 11, 0, 5, 76, 8, 0, '20:55', '2024-02-10'),
    createCase('Bazi', "[Bazi] 73 Midnight 00:00 -> Hai Hour Prev Day (Vigo)", 2024, 11, 3, 0, 0, -8.7, 1, 0, '22:41', '2024-11-02'),
    createCase('Bazi', "[Bazi] 74 Chou 01:05 -> Hai Hour Prev Day (Kashgar)", 2024, 2, 11, 1, 5, 76, 8, 0, '21:55', '2024-02-10'),
    createCase('Bazi', "[Bazi] 75 Wu 11:00 -> Chen Hour (Kashgar)", 2024, 2, 11, 11, 0, 76, 8, 0, '07:50', '2024-02-11'),
    createCase('Bazi', "[Bazi] 76 Wei 13:00 -> Si Hour (Kashgar)", 2024, 2, 11, 13, 0, 76, 8, 0, '09:50', '2024-02-11'),
    createCase('Bazi', "[Bazi] 77 00:00 Exact boundary -> Xu Hour Prev Day", 2024, 2, 11, 0, 0, 76, 8, 0, '20:50', '2024-02-10'),
    createCase('Bazi', "[Bazi] 78 23:00 Exact boundary -> Xu Hour", 2024, 2, 11, 23, 0, 76, 8, 0, '19:50', '2024-02-11'),
    createCase('Bazi', "[Bazi] 79 Shen 15:00 -> Wei Hour (Reykjavik)", 2024, 2, 11, 15, 0, -21.9, 0, 0, '13:18', '2024-02-11'),
    createCase('Bazi', "[Bazi] 80 Yin 03:00 -> Chou Hour (Mendoza)", 2024, 2, 11, 3, 0, -68.8, -3, 0, '01:10', '2024-02-11'),

    // === IX. Bazi Critical Boundaries - Eastward Roll-forwards (81-90) ===
    createCase('Bazi', "[Bazi] 81 Late Zi 23:55 -> Chou Hour Next Day", 2024, 11, 3, 23, 55, 134, 8, 0, '01:07', '2024-11-04'),
    createCase('Bazi', "[Bazi] 82 Early Zi 00:55 -> Chou Hour (Fuyuan)", 2024, 11, 3, 0, 55, 134, 8, 0, '02:07', '2024-11-03'),
    createCase('Bazi', "[Bazi] 83 22:50 -> Early Zi Next Day (Fuyuan)", 2024, 11, 3, 22, 50, 134, 8, 0, '00:02', '2024-11-04'),
    createCase('Bazi', "[Bazi] 84 10:50 -> Wu Hour (Fuyuan)", 2024, 11, 3, 10, 50, 134, 8, 0, '12:02', '2024-11-03'),
    createCase('Bazi', "[Bazi] 85 12:50 -> Wei Hour (Fuyuan)", 2024, 11, 3, 12, 50, 134, 8, 0, '14:02', '2024-11-03'),
    createCase('Bazi', "[Bazi] 86 23:00 Exact boundary -> Early Zi Next Day", 2024, 11, 3, 23, 0, 134, 8, 0, '00:12', '2024-11-04'),
    createCase('Bazi', "[Bazi] 87 00:00 Exact boundary -> Chou Hour (Fuyuan)", 2024, 11, 3, 0, 0, 134, 8, 0, '01:12', '2024-11-03'),
    createCase('Bazi', "[Bazi] 88 14:50 -> Shen Hour (Bialowieza)", 2024, 11, 3, 14, 50, 23.8, 1, 0, '15:42', '2024-11-03'),
    createCase('Bazi', "[Bazi] 89 16:50 -> You Hour (Nemuro)", 2024, 11, 3, 16, 50, 145.5, 9, 0, '17:48', '2024-11-03'),
    createCase('Bazi', "[Bazi] 90 22:45 -> Late Zi Hour (Lord Howe)", 2024, 11, 3, 22, 45, 159.1, 10.5, 0, '23:07', '2024-11-03'),

    // === X. Bazi - Fractional & Complex Boundary Mixes (91-100) ===
    createCase('Bazi', "[Bazi] 91 India 23:30 -> Hai Hour", 2024, 2, 11, 23, 30, 77.2, 5.5, 0, '22:55', '2024-02-11'),
    createCase('Bazi', "[Bazi] 92 Nepal 00:15 -> Early Zi", 2024, 11, 3, 0, 15, 85.3, 5.75, 0, '00:28', '2024-11-03'),
    createCase('Bazi', "[Bazi] 93 Eucla 23:50 -> Late Zi", 2024, 2, 11, 23, 50, 128.8, 8.75, 0, '23:26', '2024-02-11'),
    createCase('Bazi', "[Bazi] 94 Chatham 12:55 -> Wu Hour (DST adjusted)", 2024, 11, 3, 12, 55, -176.5, 12.75, 1, '11:40', '2024-11-03'),
    createCase('Bazi', "[Bazi] 95 Iran 23:10 -> Hai Hour", 2024, 2, 11, 23, 10, 51.4, 3.5, 0, '22:51', '2024-02-11'),
    createCase('Bazi', "[Bazi] 96 UK Double DST 23:10 -> Xu Hour", 2024, 2, 11, 23, 10, 0, 0, 2, '20:56', '2024-02-11'),
    createCase('Bazi', "[Bazi] 97 Xinjiang 02:00 -> Hai Hour Prev Day", 2024, 2, 11, 2, 0, 76, 8, 0, '22:50', '2024-02-10'),
    createCase('Bazi', "[Bazi] 98 Argentina 00:05 -> Hai Hour Prev Day", 2024, 2, 11, 0, 5, -68.8, -3, 0, '22:15', '2024-02-10'),
    createCase('Bazi', "[Bazi] 99 Fuyuan 22:00 -> Late Zi Hour", 2024, 11, 3, 22, 0, 134, 8, 0, '23:12', '2024-11-03'),
    createCase('Bazi', "[Bazi] 100 Singapore 1970 00:15 -> Late Zi Prev Day", 1970, 2, 11, 0, 15, 103.8, 7.5, 0, '23:26', '1970-02-10'),
];

function timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function isTimeWithinTolerance(got: string, exp: string, toleranceMinutes: number = 1): boolean {
    const gotMins = timeToMinutes(got);
    const expMins = timeToMinutes(exp);
    let diff = Math.abs(gotMins - expMins);
    if (diff > 720) diff = 1440 - diff; // Handle midnight wrap-around safely
    return diff <= toleranceMinutes;
}

function runAll() {
    console.log(`🚀 Starting ${testCases.length} Global True Solar Time Regression tests...\n`);

    let totalPassed = 0;

    testCases.forEach((test) => {
        try {
            const inputParams = {
                year: test.input.solarYear,
                month: test.input.solarMonth,
                day: test.input.solarDay,
                hour: test.input.actualHour,
                minute: test.input.actualMinute,
                timeZoneOffset: test.input.timezone,
                dstOffset: test.input.dstOffset
            };

            const options = {
                longitude: test.input.longitude,
                algorithm: 'approx' as const
            };

            const result = calculateTrueSolarTime(inputParams, options);

            const gotTime = result.trueSolarTime.substring(0, 5); // HH:mm
            const gotDate = result.trueSolarDateTime.split(' ')[0]; // YYYY-MM-DD

            const assertions: { label: string; pass: boolean; got: string; exp: string }[] = [];

            if (test.expected.trueSolarTime) {
                const pass = test.expected.useTolerance
                    ? isTimeWithinTolerance(gotTime, test.expected.trueSolarTime)
                    : gotTime === test.expected.trueSolarTime;
                assertions.push({ label: 'Time', pass, got: gotTime, exp: test.expected.trueSolarTime });
            }

            if (test.expected.solarDate) {
                const pass = gotDate === test.expected.solarDate;
                assertions.push({ label: 'Date', pass, got: gotDate, exp: test.expected.solarDate });
            }

            const allPassed = assertions.every(a => a.pass);
            const symbol = allPassed ? '✅' : '❌';
            console.log(`${symbol} [${test.category}] ${test.name}`);
            
            if (allPassed) {
                totalPassed++;
            } else {
                assertions.forEach(a => {
                    if (!a.pass) {
                        console.log(`   FAIL ${a.label} -> Got: [${a.got}], Exp: [${a.exp}]`);
                    }
                });
            }

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.log(`❌ [${test.category}] ${test.name}`);
            console.log(`   ERROR: ${errorMessage}`);
        }
    });

    const categories = ['Geo', 'EoT', 'History', 'Bazi'] as const;
    const stats = categories.map(cat => {
        const catTests = testCases.filter(t => t.category === cat);
        const catPassed = catTests.filter(t => {
            try {
                const result = calculateTrueSolarTime({
                    year: t.input.solarYear,
                    month: t.input.solarMonth,
                    day: t.input.solarDay,
                    hour: t.input.actualHour,
                    minute: t.input.actualMinute,
                    timeZoneOffset: t.input.timezone,
                    dstOffset: t.input.dstOffset
                }, { longitude: t.input.longitude, algorithm: 'approx' });
                const gotTime = result.trueSolarTime.substring(0, 5);
                const gotDate = result.trueSolarDateTime.split(' ')[0];
                const timePass = t.expected.trueSolarTime ? (t.expected.useTolerance ? isTimeWithinTolerance(gotTime, t.expected.trueSolarTime) : gotTime === t.expected.trueSolarTime) : true;
                const datePass = t.expected.solarDate ? gotDate === t.expected.solarDate : true;
                return timePass && datePass;
            } catch { return false; }
        }).length;
        return { cat, passed: catPassed, total: catTests.length };
    });

    console.log(`\n=================================================`);
    console.log(`🏁 REGRESSION REPORT SUMMARY`);
    console.log(`=================================================`);
    stats.forEach(s => {
        const symbol = s.passed === s.total ? '✅' : '⚠️';
        console.log(`${symbol} ${s.cat.padEnd(8)}: ${String(s.passed).padStart(2)} / ${s.total} Passed`);
    });
    console.log(`-------------------------------------------------`);
    const totalSymbol = totalPassed === testCases.length ? '✅' : '❌';
    console.log(`${totalSymbol} TOTAL   : ${String(totalPassed).padStart(2)} / ${testCases.length} Passed`);
    console.log(`=================================================\n`);

    if (totalPassed !== testCases.length) {
        process.exit(1);
    }
}

runAll();

/**
 * 城市 → (纬度, 经度, 时区标准经线?) 静态缓存。
 * Originally ported from shunshi/solar_time.py::_CITY_CACHE, then extended
 * with 🇯🇵 日本 / 🇰🇷 韓國 / 🇨🇦 加拿大 / 🇦🇺 澳洲 / 🇪🇺 欧洲 cities for
 * Shunshi.AI's international markets.
 *
 * Canonical keys are Simplified Chinese. Traditional Chinese (`CITY_ALIASES`)
 * and Japanese kanji / Korean Hangul forms that differ from the canonical key
 * are registered as aliases so users can pass either form.
 *
 * The optional 3rd element is the clock-timezone standard meridian (in °E)
 * and is ONLY specified for cities where `Math.round(longitude/15)*15` gives
 * the wrong answer. The vast majority of cities don't need it:
 *   - 🇨🇳 Chinese cities: longitude rounds to 120° = CST ✓
 *   - 🇯🇵 Japanese cities: longitude rounds to 135° = JST ✓
 *   - 🇺🇸 US cities: rounds to -75/-90/-105/-120 = EST/CST/MST/PST ✓
 *   - 🇬🇧 London: rounds to 0° = GMT ✓
 * The exceptions (listed explicitly below) are:
 *   - 🇰🇷 most of Korea: longitude 126-128°, rounds to 120°, but KST = 135°
 *     (busan 129° and daegu 128.6° happen to round to 135° by luck)
 *   - 🇫🇷 Paris: longitude 2.35°, rounds to 0°, but CET = 15°
 *     (Frankfurt 8.68° rounds to 15° correctly by luck)
 * Without this override, clock-time → solar-time correction is off by ~60 min
 * for these cities, which shifts the 时辰 (and therefore the hour pillar).
 */
export declare const CITY_CACHE: Record<string, [number, number] | [number, number, number]>;
/**
 * Non-canonical city name → canonical (Simplified Chinese) name.
 *
 * Covers:
 * - 繁體中文 alternates for any canonical name whose characters differ
 *   (e.g. `廣州 → 广州`, `哈爾濱 → 哈尔滨`)
 * - 日本漢字 forms where they differ from Simplified Chinese
 *   (e.g. `東京 → 东京`, `横浜 → 横滨`, `神戸 → 神户`, `広島 → 广岛`)
 * - 한국어 Hangul forms (e.g. `서울 → 首尔`, `부산 → 釜山`)
 *
 * Identity aliases (where the traditional and simplified forms are the same
 * character — 京都, 札幌, 仙台, 大阪, 巴黎, etc.) are not listed here; the
 * canonical key already matches.
 */
export declare const CITY_ALIASES: Record<string, string>;
/**
 * Returns [latitude, longitude, standardMeridian?] for the city.
 * The third element is only present for cities whose clock-time reference
 * meridian doesn't match `Math.round(longitude/15)*15` — callers should
 * pass it to `trueSolarTime(..., standardMeridian)` when present.
 */
export declare function getLocation(city: string): [number, number] | [number, number, number];

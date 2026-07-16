/**
 * 黄历 (老黄历 / Chinese almanac) computation — wraps tyme4ts.
 *
 * Same calendar core (tyme4ts) as the bazi engine, so 黄历 stays in lockstep
 * with 八字 流日. Outputs a comprehensive Chinese-keyed almanac for a given day:
 *   宜/忌, 彭祖百忌, 神煞(吉/凶), 建除十二神, 黄黑道, 二十八宿, 九星, 六曜,
 *   胎神, 节气/星座, 吉神方位, 节令(三伏/数九/梅雨/物候), 12 时辰宜忌。
 *
 * Accepts either a 公历 (Gregorian) date or a 农历 (lunar) date (闰月用 isLeap)。
 */
export interface GetHuangliInput {
    /** 年份 (公历年, 或 isLunar=true 时为农历年) */
    year: number;
    /** 月份 1-12 */
    month: number;
    /** 日 1-31 (或农历日 1-30) */
    day: number;
    /** true = 按农历日期解析 (默认 false = 公历) */
    isLunar?: boolean;
    /** 农历闰月: true 表示这是闰月 (仅 isLunar=true 时有意义) */
    isLeapMonth?: boolean;
}
export interface HuangliResult {
    公历: string;
    星期: string;
    农历: string;
    生肖: string;
    干支: {
        年: string;
        月: string;
        日: string;
    };
    节气: string | null;
    星座: string;
    宜: string[];
    忌: string[];
    彭祖百忌: string[];
    十二神: {
        建除: string | null;
        黄黑道: string | null;
    };
    二十八宿: string | null;
    九星: string | null;
    六曜: string | null;
    神煞: {
        吉神: string[];
        凶煞: string[];
    };
    胎神: string | null;
    月相: string | null;
    吉神方位: {
        喜神: string | null;
        财神: string | null;
        福神: string | null;
        阳贵: string | null;
        阴贵: string | null;
        太岁: string | null;
    };
    节令: {
        三伏: string | null;
        数九: string | null;
        梅雨: string | null;
        物候: string | null;
    };
    节日: string[];
    时辰宜忌: Array<{
        时辰: string;
        干支: string;
        宜: string[];
        忌: string[];
    }>;
}
export declare function buildHuangli(input: GetHuangliInput): HuangliResult;

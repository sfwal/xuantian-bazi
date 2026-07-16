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
import { LunarDay, SolarDay } from 'tyme4ts';
const ZODIAC = {
    子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇',
    午: '马', 未: '羊', 申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪',
};
/** 安全 toString：null/undefined → null */
function s(x) {
    if (x === null || x === undefined)
        return null;
    const str = x.toString();
    return str === '' ? null : str;
}
/** 解析输入 → SolarDay (黄历计算锚点是公历日) */
function resolveSolarDay(input) {
    const { year, month, day, isLunar = false, isLeapMonth = false } = input;
    if (isLunar) {
        // tyme4ts: 闰月用负数月份表示
        const m = isLeapMonth ? -month : month;
        return LunarDay.fromYmd(year, m, day).getSolarDay();
    }
    return SolarDay.fromYmd(year, month, day);
}
export function buildHuangli(input) {
    const sd = resolveSolarDay(input);
    const ld = sd.getLunarDay();
    const cyc = ld.getSixtyCycle();
    const stem = cyc.getHeavenStem();
    const branch = cyc.getEarthBranch();
    const yearCyc = ld.getYearSixtyCycle();
    const yearZhi = yearCyc.getEarthBranch().toString();
    // 神煞按吉凶分组
    const 吉神 = [];
    const 凶煞 = [];
    for (const g of ld.getGods()) {
        const name = g.getName();
        const luck = s(g.getLuck());
        if (luck === '吉')
            吉神.push(name);
        else
            凶煞.push(name);
    }
    // 12 时辰宜忌
    const 时辰宜忌 = ld.getHours().map((h) => {
        const hc = h.getSixtyCycle();
        return {
            时辰: hc.getEarthBranch().toString(),
            干支: hc.toString(),
            宜: h.getRecommends().map((x) => x.toString()),
            忌: h.getAvoids().map((x) => x.toString()),
        };
    });
    return {
        公历: sd.toString(),
        星期: '星期' + sd.getWeek().getName(),
        农历: ld.toString(),
        生肖: ZODIAC[yearZhi] ?? '',
        干支: {
            年: yearCyc.toString(),
            月: ld.getMonthSixtyCycle().toString(),
            日: cyc.toString(),
        },
        节气: s(sd.getTerm()),
        星座: sd.getConstellation().toString(),
        宜: ld.getRecommends().map((x) => x.toString()),
        忌: ld.getAvoids().map((x) => x.toString()),
        彭祖百忌: [
            s(stem.getPengZuHeavenStem()),
            s(branch.getPengZuEarthBranch()),
        ].filter((x) => x !== null),
        十二神: {
            建除: s(ld.getDuty()),
            黄黑道: s(ld.getTwelveStar()),
        },
        二十八宿: s(ld.getTwentyEightStar()),
        九星: s(ld.getNineStar()),
        六曜: s(ld.getSixStar()),
        神煞: { 吉神, 凶煞 },
        胎神: s(ld.getFetusDay()),
        月相: s(ld.getPhase()),
        吉神方位: {
            喜神: s(stem.getJoyDirection()),
            财神: s(stem.getWealthDirection()),
            福神: s(stem.getMascotDirection()),
            阳贵: s(stem.getYangDirection()),
            阴贵: s(stem.getYinDirection()),
            太岁: s(ld.getJupiterDirection()),
        },
        节令: {
            三伏: s(sd.getDogDay()),
            数九: s(sd.getNineDay()),
            梅雨: s(sd.getPlumRainDay()),
            物候: s(sd.getPhenology()),
        },
        节日: [s(sd.getFestival()), s(ld.getFestival())].filter((x) => x !== null),
        时辰宜忌,
    };
}
//# sourceMappingURL=huangli.js.map
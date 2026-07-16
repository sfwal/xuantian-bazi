/**
 * Bazi chart computation — wraps tyme4ts, outputs shunshi-shaped JSON.
 * Field names are kept in Chinese to match shunshi/bazi.py::calc_bazi output.
 */
import { ChildLimit, DefaultEightCharProvider, Gender, LunarHour, LunarSect2EightCharProvider, SolarTime, } from 'tyme4ts';
import { calcShenshaForPillars } from './shensha.js';
import { findGanRelations, findZhiRelations } from './relations.js';
// ─── 五行 / 藏干 / 十神 tables ─────────────────────────────────────
const GAN_WX = {
    甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
    己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};
// 5-element order used in shunshi output: 金木水火土
const WX_ORDER = ['金', '木', '水', '火', '土'];
// 藏干权重: 本气 1.0, 中气 0.5, 余气 0.3
const CANG_WEIGHT = [1.0, 0.5, 0.3];
// ─── Providers (one-time instantiation) ─────────────────────────────
const provider1 = new DefaultEightCharProvider();
const provider2 = new LunarSect2EightCharProvider();
// ─── Helpers ────────────────────────────────────────────────────────
/**
 * 按 shunshi python 的顺序返回藏干：[本气, 中气, 余气]
 * (过滤掉不存在的中气/余气)
 */
function getHideGans(sixtyCycle) {
    return sixtyCycle
        .getEarthBranch()
        .getHideHeavenStems()
        .map((h) => h.getHeavenStem().toString());
}
function getHideGanDetails(sixtyCycle) {
    return getHideGans(sixtyCycle).map((g) => ({ 干: g, 五行: GAN_WX[g] ?? '' }));
}
/**
 * 五行字段: 天干五行 + 地支五行 (拼接), e.g. "土火"
 */
function pillarWuxingString(sixtyCycle) {
    const stemEl = sixtyCycle.getHeavenStem().getElement().toString();
    const branchEl = sixtyCycle.getEarthBranch().getElement().toString();
    return stemEl + branchEl;
}
/**
 * 副星: 地支藏干的十神列表 (相对于日主)
 */
function fuStarsForPillar(sixtyCycle, me) {
    return sixtyCycle
        .getEarthBranch()
        .getHideHeavenStems()
        .map((h) => me.getTenStar(h.getHeavenStem()).toString());
}
/**
 * 空亡: 两个地支拼接字符串, e.g. "戌亥"
 */
function kongWangString(sixtyCycle) {
    return sixtyCycle
        .getExtraEarthBranches()
        .map((b) => b.toString())
        .join('');
}
/**
 * 构建单柱详细信息。
 * @param isDay 日柱需要特殊处理: 主星 = 元男/元女
 */
function buildPillar(sixtyCycle, me, isDay, gender, shenshaList) {
    const stem = sixtyCycle.getHeavenStem();
    const branch = sixtyCycle.getEarthBranch();
    return {
        干支: sixtyCycle.toString(),
        天干: stem.toString(),
        地支: branch.toString(),
        纳音: sixtyCycle.getSound().toString(),
        五行: pillarWuxingString(sixtyCycle),
        主星: isDay
            ? gender === 1
                ? '元男'
                : '元女'
            : me.getTenStar(stem).toString(),
        副星: fuStarsForPillar(sixtyCycle, me),
        藏干: getHideGans(sixtyCycle),
        藏干详情: getHideGanDetails(sixtyCycle),
        // 星运 = 日主 对 本柱地支 的十二长生
        星运: me.getTerrain(branch).toString(),
        // 自坐 = 本柱天干 对 本柱地支 的十二长生
        自坐: stem.getTerrain(branch).toString(),
        空亡: kongWangString(sixtyCycle),
        神煞: shenshaList,
    };
}
// ─── 五行分值 ──────────────────────────────────────────────────────
function calcWuxingScore(pillars, dayStem) {
    const scores = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
    // 天干 各 1.0
    for (const p of pillars) {
        const g = p.getHeavenStem().toString();
        scores[GAN_WX[g]] += 1.0;
    }
    // 地支藏干 按 1.0/0.5/0.3 加权
    for (const p of pillars) {
        const hides = p.getEarthBranch().getHideHeavenStems();
        hides.forEach((h, idx) => {
            const g = h.getHeavenStem().toString();
            const w = CANG_WEIGHT[idx] ?? 0.3;
            scores[GAN_WX[g]] += w;
        });
    }
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const result = {};
    for (const wx of WX_ORDER) {
        result[wx] = {
            分值: Math.round(scores[wx] * 10) / 10,
            占比: `${Math.round((scores[wx] / total) * 100)}%`,
        };
    }
    return { ...result, 日主五行: GAN_WX[dayStem.toString()] };
}
// ─── 大运 ──────────────────────────────────────────────────────────
/**
 * 日主 vs 大运天干 的合/冲/克 关系描述 (用于 DayunItem.日主关系)
 */
function dayMasterRelation(me, dfStem) {
    const m = me.toString();
    const d = dfStem.toString();
    if (m === d)
        return '';
    const gans = [m, d];
    const rels = findGanRelations(gans, true, ['日主', '大运']);
    return rels.join(',');
}
function buildDayun(solarTime, gender, me, currentYear = new Date().getFullYear()) {
    const childLimit = ChildLimit.fromSolarTime(solarTime, gender);
    let df = childLimit.getStartDecadeFortune();
    const list = [];
    for (let i = 0; i < 9; i++) {
        const cycle = df.getSixtyCycle();
        const stem = cycle.getHeavenStem();
        const branch = cycle.getEarthBranch();
        const startAge = df.getStartAge();
        const endAge = df.getEndAge();
        const startYear = df.getStartSixtyCycleYear().getYear();
        const endYear = df.getEndSixtyCycleYear().getYear();
        list.push({
            起始年龄: startAge,
            结束年龄: endAge,
            起始年份: startYear,
            结束年份: endYear,
            干支: cycle.toString(),
            天干: stem.toString(),
            地支: branch.toString(),
            天干五行: stem.getElement().toString(),
            纳音: cycle.getSound().toString(),
            主星: me.getTenStar(stem).toString(),
            藏干十神: fuStarsForPillar(cycle, me),
            自坐: stem.getTerrain(branch).toString(),
            星运: me.getTerrain(branch).toString(),
            空亡: kongWangString(cycle),
            日主关系: dayMasterRelation(me, stem),
            当前: currentYear >= startYear && currentYear <= endYear,
        });
        df = df.next(1);
    }
    const startTime = childLimit.getEndTime();
    return {
        起运: `${childLimit.getYearCount()}年${childLimit.getMonthCount()}月${childLimit.getDayCount()}日起运`,
        起运日期: `${startTime.getYear()}-${startTime.getMonth()}-${startTime.getDay()}`,
        大运: list,
    };
}
export function buildBaziChart(input) {
    const { solarDt, gender, sect = 1 } = input;
    // 设置子时分日法 provider (注意: LunarHour.provider 是全局静态变量)
    LunarHour.provider = sect === 2 ? provider2 : provider1;
    const solarTime = SolarTime.fromYmdHms(solarDt.year, solarDt.month, solarDt.day, solarDt.hour, solarDt.minute, solarDt.second ?? 0);
    const lunarHour = solarTime.getLunarHour();
    const eightChar = lunarHour.getEightChar();
    const year = eightChar.getYear();
    const month = eightChar.getMonth();
    const day = eightChar.getDay();
    const hour = eightChar.getHour();
    const me = day.getHeavenStem();
    // 神煞 (原局) — port of shunshi shensha.py
    const shensha = calcShenshaForPillars({
        yearGan: year.getHeavenStem().toString(),
        yearZhi: year.getEarthBranch().toString(),
        monthGan: month.getHeavenStem().toString(),
        monthZhi: month.getEarthBranch().toString(),
        dayGan: day.getHeavenStem().toString(),
        dayZhi: day.getEarthBranch().toString(),
        timeGan: hour.getHeavenStem().toString(),
        timeZhi: hour.getEarthBranch().toString(),
        yearNayin: year.getSound().toString(),
        gender,
    });
    // 日柱空亡反向标记到四柱
    const dayXunKong = new Set(day.getExtraEarthBranches().map((b) => b.toString()));
    const yearXunKong = new Set(year.getExtraEarthBranches().map((b) => b.toString()));
    const kongSet = new Set([...dayXunKong, ...yearXunKong]);
    const pillarCycles = [year, month, day, hour];
    ['年柱', '月柱', '日柱', '时柱'].forEach((k, i) => {
        const branchStr = pillarCycles[i].getEarthBranch().toString();
        if (kongSet.has(branchStr) && !shensha[k].includes('空亡')) {
            shensha[k].push('空亡');
        }
    });
    const pillars = {
        年柱: buildPillar(year, me, false, gender, shensha.年柱),
        月柱: buildPillar(month, me, false, gender, shensha.月柱),
        日柱: buildPillar(day, me, true, gender, shensha.日柱),
        时柱: buildPillar(hour, me, false, gender, shensha.时柱),
    };
    const genderEnum = gender === 1 ? Gender.MAN : Gender.WOMAN;
    const dayun = buildDayun(solarTime, genderEnum, me);
    const wuxingScore = calcWuxingScore([year, month, day, hour], me);
    // 刑冲合会 — 四柱 pair-wise 天干/地支 关系 (port of bazi_service.py)
    const gans = [year, month, day, hour].map((p) => p.getHeavenStem().toString());
    const zhis = [year, month, day, hour].map((p) => p.getEarthBranch().toString());
    const xingChongHeHui = {
        天干: findGanRelations(gans, true),
        地支: findZhiRelations(zhis, true),
    };
    return {
        四柱: `${year.toString()} ${month.toString()} ${day.toString()} ${hour.toString()}`,
        日主: me.toString(),
        生肖: year.getEarthBranch().getZodiac().toString(),
        柱位详细: pillars,
        五行分值: wuxingScore,
        刑冲合会: xingChongHeHui,
        起运: dayun.起运,
        起运日期: dayun.起运日期,
        大运: dayun.大运,
        命宫: eightChar.getOwnSign().toString(),
        身宫: eightChar.getBodySign().toString(),
        胎元: eightChar.getFetalOrigin().toString(),
        胎息: eightChar.getFetalBreath().toString(),
        农历: lunarHour.toString(),
        公历: solarTime.toString(),
    };
}
//# sourceMappingURL=bazi.js.map
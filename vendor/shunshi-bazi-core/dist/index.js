/**
 * shunshi-mcp — public programmatic API.
 *
 * All field names follow the shunshi Python backend schema so the MCP
 * output stays in lockstep with shunshi.ai's reading engine.
 */
import { buildBaziChart } from './lib/bazi.js';
import { calcSolarTimeInfo } from './lib/solarTime.js';
import { buildHuangli } from './lib/huangli.js';
function fmtDt(dt) {
    const p = (n) => n.toString().padStart(2, '0');
    return `${dt.year}-${p(dt.month)}-${p(dt.day)} ${p(dt.hour)}:${p(dt.minute)}`;
}
export function getBaziChart(input) {
    const { year, month, day, hour, minute = 0, gender, city, longitude, latitude, useTrueSolarTime = true, standardMeridian, sect = 1, } = input;
    const clockDt = { year, month, day, hour, minute, second: 0 };
    const hasLocation = (longitude !== undefined && latitude !== undefined) || !!city;
    const shouldCorrect = useTrueSolarTime && hasLocation;
    let solarDt = clockDt;
    let info;
    let lat;
    let lon;
    if (shouldCorrect) {
        info = calcSolarTimeInfo(clockDt, {
            city,
            lat: latitude,
            lon: longitude,
            standardMeridian,
        });
        solarDt = info.solarDt;
        lat = info.lat;
        lon = info.lon;
    }
    else if (hasLocation) {
        lat = latitude;
        lon = longitude;
    }
    const chart = buildBaziChart({ solarDt, gender, sect });
    return {
        输入: {
            公历: fmtDt(clockDt),
            性别: gender === 1 ? '男' : '女',
            ...(city !== undefined ? { 城市: city } : {}),
            ...(lon !== undefined ? { 经度: Math.round(lon * 10000) / 10000 } : {}),
            ...(lat !== undefined ? { 纬度: Math.round(lat * 10000) / 10000 } : {}),
        },
        ...(info
            ? {
                真太阳时: {
                    钟表时间: fmtDt(info.clockDt),
                    真太阳时: fmtDt(info.solarDt),
                    修正分钟: info.correctionMinutes,
                    时辰: info.shichenName,
                    时辰索引: info.shichenIndex,
                },
            }
            : {}),
        八字: chart,
    };
}
/**
 * 计算指定日期的黄历 (老黄历 / 宜忌)。
 * 不传日期时返回「今天」(服务器本地时区) 的黄历。
 */
export function getHuangli(input = {}) {
    let { year, month, day } = input;
    if (year === undefined || month === undefined || day === undefined) {
        // 任一缺失 → 整体回退到今天 (公历)，忽略 isLunar
        const now = new Date();
        return buildHuangli({
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
        });
    }
    return buildHuangli({
        year,
        month,
        day,
        isLunar: input.isLunar,
        isLeapMonth: input.isLeapMonth,
    });
}
export { buildBaziChart } from './lib/bazi.js';
export { calcSolarTimeInfo, trueSolarTime, equationOfTime } from './lib/solarTime.js';
export { buildHuangli } from './lib/huangli.js';
//# sourceMappingURL=index.js.map
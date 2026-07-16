/**
 * shunshi-mcp — public programmatic API.
 *
 * All field names follow the shunshi Python backend schema so the MCP
 * output stays in lockstep with shunshi.ai's reading engine.
 */
import { type BaziChart } from './lib/bazi.js';
import { type HuangliResult } from './lib/huangli.js';
export interface GetBaziChartInput {
    /** 公历年 */
    year: number;
    /** 公历月 1-12 */
    month: number;
    /** 公历日 */
    day: number;
    /** 小时 0-23 */
    hour: number;
    /** 分钟 0-59 */
    minute?: number;
    /** 0 = 女, 1 = 男 */
    gender: 0 | 1;
    /** 出生城市 (中文名, 优先使用) — 会自动应用真太阳时修正 */
    city?: string;
    /** 出生经度 (° E, 可与 lat 一起提供, 绕过 city 缓存) */
    longitude?: number;
    /** 出生纬度 */
    latitude?: number;
    /** 是否应用真太阳时修正 (默认 true, 只在提供了 city/longitude 时生效) */
    useTrueSolarTime?: boolean;
    /**
     * 钟表所在时区的标准经线 (°E)。不传时按 Math.round(longitude/15)*15 推算。
     * 仅在经度四舍五入结果与实际时区经线不符时需要显式指定，例如：
     *   - 🇰🇷 韓國 (首尔/仁川/光州/大田 longitude≈127° 但 KST=135°) → 135
     *   - 🇫🇷 巴黎 (longitude≈2.35° 但 CET=15°) → 15
     * 传 city 时若缓存里已有 override, 该字段为 undefined 时会自动使用缓存值。
     */
    standardMeridian?: number;
    /** 子时分日法: 1=23:00算明天 (shunshi 默认), 2=算今天 */
    sect?: 1 | 2;
}
export interface GetBaziChartOutput {
    输入: {
        公历: string;
        性别: '男' | '女';
        城市?: string;
        经度?: number;
        纬度?: number;
    };
    真太阳时?: {
        钟表时间: string;
        真太阳时: string;
        修正分钟: number;
        时辰: string;
        时辰索引: number;
    };
    八字: BaziChart;
}
export declare function getBaziChart(input: GetBaziChartInput): GetBaziChartOutput;
/** 黄历查询入参。不传 year/month/day 时默认查询「今天」(公历)。 */
export interface GetHuangliInput {
    /** 年份 (公历年, 或 isLunar=true 时为农历年)。不传则用今天 */
    year?: number;
    /** 月份 1-12。不传则用今天 */
    month?: number;
    /** 日 1-31 (或农历日)。不传则用今天 */
    day?: number;
    /** true = 按农历日期解析 (默认 false = 公历) */
    isLunar?: boolean;
    /** 农历闰月: true 表示这是闰月 (仅 isLunar=true 时有意义) */
    isLeapMonth?: boolean;
}
/**
 * 计算指定日期的黄历 (老黄历 / 宜忌)。
 * 不传日期时返回「今天」(服务器本地时区) 的黄历。
 */
export declare function getHuangli(input?: GetHuangliInput): HuangliResult;
export { buildBaziChart } from './lib/bazi.js';
export { calcSolarTimeInfo, trueSolarTime, equationOfTime } from './lib/solarTime.js';
export { buildHuangli } from './lib/huangli.js';
export type { BaziChart } from './lib/bazi.js';
export type { HuangliResult } from './lib/huangli.js';

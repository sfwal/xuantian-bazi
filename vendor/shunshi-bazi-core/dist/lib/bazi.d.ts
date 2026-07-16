/**
 * Bazi chart computation — wraps tyme4ts, outputs shunshi-shaped JSON.
 * Field names are kept in Chinese to match shunshi/bazi.py::calc_bazi output.
 */
import type { ClockDateTime } from './solarTime.js';
export interface BaziChartInput {
    /** 真太阳时修正后的公历 datetime (或原始钟表时间, 如果 useTrueSolarTime=false) */
    solarDt: ClockDateTime;
    /** 0 = 女, 1 = 男 */
    gender: 0 | 1;
    /** 子时分日法: 1 = 23:00 日柱算明天 (shunshi 默认), 2 = 算今天 */
    sect?: 1 | 2;
}
export declare function buildBaziChart(input: BaziChartInput): {
    四柱: string;
    日主: string;
    生肖: string;
    柱位详细: {
        年柱: {
            干支: string;
            天干: string;
            地支: string;
            纳音: string;
            五行: string;
            主星: string;
            副星: string[];
            藏干: string[];
            藏干详情: {
                干: string;
                五行: string;
            }[];
            星运: string;
            自坐: string;
            空亡: string;
            神煞: string[];
        };
        月柱: {
            干支: string;
            天干: string;
            地支: string;
            纳音: string;
            五行: string;
            主星: string;
            副星: string[];
            藏干: string[];
            藏干详情: {
                干: string;
                五行: string;
            }[];
            星运: string;
            自坐: string;
            空亡: string;
            神煞: string[];
        };
        日柱: {
            干支: string;
            天干: string;
            地支: string;
            纳音: string;
            五行: string;
            主星: string;
            副星: string[];
            藏干: string[];
            藏干详情: {
                干: string;
                五行: string;
            }[];
            星运: string;
            自坐: string;
            空亡: string;
            神煞: string[];
        };
        时柱: {
            干支: string;
            天干: string;
            地支: string;
            纳音: string;
            五行: string;
            主星: string;
            副星: string[];
            藏干: string[];
            藏干详情: {
                干: string;
                五行: string;
            }[];
            星运: string;
            自坐: string;
            空亡: string;
            神煞: string[];
        };
    };
    五行分值: {
        日主五行: string;
    };
    刑冲合会: {
        天干: string[];
        地支: string[];
    };
    起运: string;
    起运日期: string;
    大运: {
        起始年龄: number;
        结束年龄: number;
        起始年份: number;
        结束年份: number;
        干支: string;
        天干: string;
        地支: string;
        天干五行: string;
        纳音: string;
        主星: string;
        藏干十神: string[];
        自坐: string;
        星运: string;
        空亡: string;
        日主关系: string;
        当前: boolean;
    }[];
    命宫: string;
    身宫: string;
    胎元: string;
    胎息: string;
    农历: string;
    公历: string;
};
export type BaziChart = ReturnType<typeof buildBaziChart>;

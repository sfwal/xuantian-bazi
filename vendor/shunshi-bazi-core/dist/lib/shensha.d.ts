/**
 * 八字神煞计算引擎 — faithful port of shunshi/shensha.py.
 *
 * Design goal: every table and every check is a 1:1 transcription from the
 * Python original so that results match byte-for-byte. Do not "clean up"
 * anything that differs from the Python — that divergence would silently
 * break parity with the shunshi backend.
 *
 * v0.1: natal chart only (calc_shensha_for_pillars).
 * v0.2: calc_dynamic_shensha for 大运/流年/流月.
 */
export interface ShenshaResult {
    年柱: string[];
    月柱: string[];
    日柱: string[];
    时柱: string[];
}
export interface ShenshaInput {
    yearGan: string;
    yearZhi: string;
    monthGan: string;
    monthZhi: string;
    dayGan: string;
    dayZhi: string;
    timeGan: string;
    timeZhi: string;
    /** 年柱纳音, 例如 "大林木" (末字用于五行判定) */
    yearNayin?: string;
    /** 1 = 男, 0 = 女 (用于元辰) */
    gender?: 0 | 1;
}
/**
 * 计算原局四柱神煞。Port of shunshi/shensha.py::calc_shensha_for_pillars.
 */
export declare function calcShenshaForPillars(input: ShenshaInput): ShenshaResult;

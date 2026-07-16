/**
 * 刑冲合会 — 天干/地支 pair-wise relations.
 *
 * Faithful port of shunshi `services/bazi_service.py` (lines ~35-175):
 *   _GAN_HE / _GAN_CHONG / _GAN_KE
 *   _ZHI_LIU_HE / _ZHI_CHONG / _ZHI_XING / _ZHI_HAI / _ZHI_PO
 *   _find_gan_relations / _find_zhi_relations
 *
 * Only pair-wise relations are computed — matching the shunshi backend.
 * 三合/三会 are intentionally NOT included (the backend doesn't compute them,
 * and the frontend "四柱關係圖示" only renders pair-wise lines).
 */
/**
 * 找出天干之间的合、冲、克关系。
 * short=true → 简洁文案 ("甲己相合" / "甲庚相冲" / "甲克戊")
 * short=false → 完整文案 ("年干甲与月干己相合(中正之合)")
 */
export declare function findGanRelations(gans: string[], short?: boolean, labels?: string[]): string[];
/**
 * 找出地支之间的合、冲、刑、害、破关系。
 * short=true → 简洁文案 ("午子相冲" / "子丑暗合")
 */
export declare function findZhiRelations(zhis: string[], short?: boolean, labels?: string[]): string[];

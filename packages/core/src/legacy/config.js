/**
 * 排盘引擎配置
 */

module.exports = {
  // HTTP 服务配置
  server: {
    port: process.env.CHART_ENGINE_PORT || 3400,
    host: process.env.CHART_ENGINE_HOST || '127.0.0.1',
  },

  // 排盘默认参数
  defaults: {
    // 子时流派: 1=早子时, 2=晚子时(默认)
    sect: 2,
    // 标准经线（中国用东八区 120°E）
    standardMeridian: 120,
  },

  // 性别映射
  genderMap: {
    1: 0, // 男 → 0 (shunshi-bazi-core 用 0 表示男)
    2: 1, // 女 → 1
  },

  // 日历类型
  calendarType: {
    SOLAR: 1,  // 公历
    LUNAR: 2,  // 农历
  },
};

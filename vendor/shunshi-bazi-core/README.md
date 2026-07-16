# shunshi-bazi-core

> 🇨🇳 **中国八字 (Four Pillars of Destiny)** ・ 🇯🇵 **四柱推命 (しちゅうすいめい)** ・ 🇰🇷 **사주팔자 (四柱八字)**
>
> Calculation library — powered by [Shunshi.AI](https://shunshi.ai) / 顺时.
>
> Pure TypeScript, zero framework deps. The same engine that powers [shunshi.ai](https://shunshi.ai)'s Bazi / 四柱推命 / 사주팔자 readings, packaged as a standalone library so any Node.js or browser app can compute charts with the same accuracy.

[![npm](https://img.shields.io/npm/v/shunshi-bazi-core.svg)](https://www.npmjs.com/package/shunshi-bazi-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Powered by Shunshi.AI](https://img.shields.io/badge/powered%20by-Shunshi.AI-purple)](https://shunshi.ai)

> 🇯🇵 **日本の開発者の方へ**: これは中国の「八字 (bāzì)」— 日本で言う**四柱推命**の計算ライブラリです。生年月日・出生時刻・出生地から四柱（年柱・月柱・日柱・時柱）、十神、大運、五行バランスを計算します。真太陽時（均時差）補正にも対応。
>
> 🇰🇷 **한국 개발자분들께**: 중국의 "八字 (bāzì)" — 한국에서는 **사주팔자**라고 부르는 명리학 계산 라이브러리입니다. 생년월일·출생시각·출생지로부터 사주(년주·월주·일주·시주), 십성, 대운, 오행 균형을 계산합니다. 진태양시 보정도 지원합니다.

---

## Why another Bazi library?

Most existing Bazi libraries have at least one of these problems:

1. **No true solar time correction.** They use clock time as-is, which gives wrong charts for people born far from their timezone's standard meridian (e.g. 新疆, 黑龙江, the U.S. West Coast). A 30-minute error can shift the whole hour pillar.
2. **Inconsistent 子时 handling.** Some libraries put 23:00-23:59 in "yesterday's" day pillar, others in "tomorrow's". If you don't pick, your charts disagree with the professional reference tools.
3. **No parity with a production backend.** You compute a chart locally, compare against a paid service, and get different answers — with no way to tell who's right.

`shunshi-bazi-core` fixes all three:

- **True solar time built in.** Provide `city` or `{latitude, longitude}` and it corrects automatically using the same Equation of Time formula as [shunshi.ai](https://shunshi.ai)'s production backend.
- **Default `sect=1`** (23:00 = tomorrow's day pillar), matching the 问真八字 reference tool.
- **Parity-tested** against Shunshi.AI's Python backend on 5 golden cases covering the tricky edges: 23:48 births, midnight boundaries, spring festival boundaries.

---

## Install

```bash
npm install shunshi-bazi-core
```

## Quick start

```typescript
import { getBaziChart } from 'shunshi-bazi-core';

const chart = getBaziChart({
  year: 1990,
  month: 3,
  day: 24,
  hour: 10,
  minute: 28,
  gender: 1,            // 0 = 女, 1 = 男
  city: '广州',          // auto-applies true solar time correction
});

console.log(chart.八字.四柱);          // "庚午 己卯 戊子 丁巳"
console.log(chart.八字.刑冲合会);      // { 天干: [], 地支: ["午卯相破", "午子相冲", "卯子相刑"] }
console.log(chart.真太阳时?.修正分钟); // -33.85 (minutes of correction applied)
```

## Full output shape

Here's a trimmed real output for the Quick start case (`1990-03-24 10:28 男 广州`):

```jsonc
{
  "输入": {
    "公历": "1990-03-24 10:28",
    "性别": "男",
    "城市": "广州",
    "经度": 113.2644,
    "纬度": 23.1291
  },
  "真太阳时": {
    "钟表时间": "1990-03-24 10:28",
    "真太阳时": "1990-03-24 09:54",
    "修正分钟": -33.85,
    "时辰": "巳时",
    "时辰索引": 6
  },
  "八字": {
    "四柱": "庚午 己卯 戊子 丁巳",
    "日主": "戊",
    "生肖": "马",
    "柱位详细": {
      "年柱": {
        "干支": "庚午",
        "天干": "庚", "地支": "午",
        "纳音": "路旁土",
        "五行": "金火",
        "主星": "食神",
        "副星": ["正印"],
        "藏干": ["丁", "己"],
        "藏干详情": [
          { "天干": "丁", "十神": "正印", "比例": 0.7 },
          { "天干": "己", "十神": "劫财", "比例": 0.3 }
        ],
        "星运": "胎", "自坐": "胎", "空亡": false,
        "神煞": ["将星", "红鸾"]
      },
      "月柱": { /* ... 干支: 己卯 ... */ },
      "日柱": { /* ... 干支: 戊子 ... */ },
      "时柱": { /* ... 干支: 丁巳 ... */ }
    },
    "五行分值": {
      "金": { "分值": 0.8, "占比": "10%" },
      "木": { "分值": 2.1, "占比": "27%" },
      "水": { "分值": 1.0, "占比": "13%" },
      "火": { "分值": 2.3, "占比": "30%" },
      "土": { "分值": 1.5, "占比": "19%" },
      "日主五行": "土"
    },
    "刑冲合会": {
      "天干": [],
      "地支": ["午卯相破", "午子相冲", "卯子相刑"]
    },
    "起运": "6岁9个月16天起运",
    "起运日期": "1997-01-10",
    "大运": [
      {
        "起始年龄": 7, "结束年龄": 16,
        "起始年份": 1997, "结束年份": 2006,
        "干支": "戊寅", "天干": "戊", "地支": "寅",
        "天干五行": "土", "纳音": "城头土",
        "主星": "比肩",
        "藏干十神": ["偏官", "偏印", "比肩"],
        "自坐": "长生", "星运": "长生",
        "空亡": false,
        "日主关系": "",
        "当前": false
      },
      /* ... 8 more decades ... */
      {
        "起始年龄": 37, "结束年龄": 46,
        "起始年份": 2027, "结束年份": 2036,
        "干支": "癸未",
        "主星": "正财",
        "日主关系": "戊癸相合",
        "当前": true
      }
    ],
    "命宫": "辛未", "身宫": "癸酉",
    "胎元": "庚午", "胎息": "癸亥",
    "农历": "庚午年二月廿七",
    "公历": "1990-03-24"
  }
}
```

See [`src/index.ts`](./src/index.ts) for the full TypeScript type (`GetBaziChartOutput`).

## API

### `getBaziChart(input)`

```typescript
interface GetBaziChartInput {
  year: number;              // 公历年
  month: number;             // 公历月 1-12
  day: number;               // 公历日
  hour: number;              // 0-23 (clock time, uncorrected)
  minute?: number;           // 0-59, default 0
  gender: 0 | 1;             // 0 = female, 1 = male

  // Location — any one of these enables true solar time correction:
  city?: string;             // City name (90+ cached across 🇨🇳🇯🇵🇰🇷🇺🇸🇨🇦🇦🇺🇪🇺).
                             // Accepts 繁體中文, 日本漢字 (東京, 神戸), and 한글 (서울) aliases.
  longitude?: number;        // decimal degrees (east positive)
  latitude?: number;

  useTrueSolarTime?: boolean;   // default true
  sect?: 1 | 2;                 // 子时分日法, default 1 (23:00 = tomorrow)
}
```

Returns a structured object with:

- **`八字.四柱`** — the four pillars as a space-separated string (`"庚午 己卯 戊子 丁巳"`)
- **`八字.柱位详细`** — per-pillar detail: 干支, 天干, 地支, 纳音, 五行, 主星, 副星, 藏干, 藏干详情, 星运, 自坐, 空亡, 神煞
- **`八字.五行分值`** — five-element scores with percentage breakdown
- **`八字.刑冲合会`** — pair-wise 天干/地支 relations (合/冲/刑/害/破/克)
- **`八字.大运`** — 9 decades of 大运, each enriched with 起始/结束年龄, 起始/结束年份, 干支, 天干五行, 纳音, 主星, 藏干十神, 自坐, 星运, 空亡, 日主关系, 当前 (isCurrent)
- **`八字.命宫 / 身宫 / 胎元 / 胎息`** — special palaces
- **`真太阳时`** — optional block showing the correction applied (only present when location was given)

See `src/index.ts` for the full output type.

### Lower-level exports

```typescript
import {
  buildBaziChart,      // direct access, skips the input-normalization layer
  calcSolarTimeInfo,   // compute true solar time standalone
  trueSolarTime,
  equationOfTime,
} from 'shunshi-bazi-core';
```

## Edge cases & common pitfalls

Bazi calculation has a handful of edges that trip up every library. Here's how `shunshi-bazi-core` handles them, and how to opt out if you need different behavior.

### 1. 子时 (23:00-00:59) — whose day is it?

There are two conventions:

- **Sect 1 (default)**: 23:00-23:59 belongs to **tomorrow's** day pillar. This matches [问真八字](https://www.buyaolian.cn/) and the Shunshi.AI production backend. Most professional practitioners in mainland China use this.
- **Sect 2**: 23:00-23:59 belongs to **today's** day pillar. Some Taiwanese and Hong Kong lineages use this.

```typescript
// Default: 2025-01-15 23:30 → day pillar = 2025-01-16's stem/branch
getBaziChart({ year: 2025, month: 1, day: 15, hour: 23, minute: 30, gender: 0 });

// Opt out: 2025-01-15 23:30 → day pillar = 2025-01-15's stem/branch
getBaziChart({ year: 2025, month: 1, day: 15, hour: 23, minute: 30, gender: 0, sect: 2 });
```

### 2. True solar time — when is it applied, when isn't it?

True solar time correction kicks in **only if you provide location** (`city` or `longitude` + `latitude`). Without location, we have no way to compute the correction.

```typescript
// ✅ Correction applied: 广州 lon ≈ 113.3°, -33.85 min offset from Beijing time
getBaziChart({ year: 1990, month: 3, day: 24, hour: 10, minute: 28, gender: 1, city: '广州' });

// ❌ No correction: clock time used as-is
getBaziChart({ year: 1990, month: 3, day: 24, hour: 10, minute: 28, gender: 1 });

// Explicit opt-out even with location (e.g. to match 问真八字 when user enters clock time)
getBaziChart({
  year: 1990, month: 3, day: 24, hour: 10, minute: 28, gender: 1,
  city: '广州', useTrueSolarTime: false
});
```

A 30-minute correction shifts the hour pillar 1 时辰 — for births near a 时辰 boundary, the entire 时柱 flips. This matters a lot for 新疆 / 黑龙江 / North American West Coast / Hokkaido births.

### 3. City cache miss

~70 Chinese cities are bundled. If your city isn't in the cache, pass `longitude` + `latitude` directly:

```typescript
// Urumqi isn't in the cache — use coordinates
getBaziChart({
  year: 1985, month: 6, day: 15, hour: 14, minute: 0, gender: 0,
  longitude: 87.6, latitude: 43.8,
});
```

Coordinates always take precedence over `city` when both are provided.

### 4. Midnight boundary (00:00 / 24:00)

`hour: 0, minute: 0` is unambiguously the start of that day (in sect 1, the 日柱 advanced at 23:00 the previous night, so 00:00-00:59 is the **same** day pillar as 01:00). No special handling needed — just pass `hour: 0`.

### 5. Century / year boundary

`getBaziChart` uses the **solar year** (立春 boundary), not the calendar year. A person born on 2000-01-20 is technically 己卯年 (1999), not 庚辰年 (2000), because 立春 hasn't happened yet. The library handles this via `tyme4ts`'s lunar/solar primitives, so you never need to think about it — just pass the calendar date.

### 6. Southern Hemisphere / negative latitude

The true solar time formula is hemisphere-symmetric. Pass `latitude: -33.87` (Sydney) and it works. That said, the entire Bazi system was developed in the Northern Hemisphere — some practitioners argue 节气 boundaries should be flipped for Southern births. `shunshi-bazi-core` does **not** flip them (following the mainstream Hong Kong / Taiwan / mainland conventions).

## Parity & accuracy

This library is **parity-tested** on every release against two independent sources:

| Test | What it checks | Status |
|---|---|---|
| `tests/parity.test.ts` | Output matches the Shunshi.AI Python backend on 5 golden cases (四柱 / 十神 / 空亡 / 纳音 / 藏干) | ✅ 5/5 |
| `tests/relations-vs-cantian.test.ts` | 刑冲合会 matches `cantian-tymext`'s `calculateRelation()` on the same cases | ✅ 5/5 |

The golden cases include hand-labeled screenshots from 问真八字, covering edge cases like 23:48 births (sect boundary) and midnight (day boundary).

```bash
npm test          # runs both suites
npm run test:parity
npm run test:relations
```

## What's NOT in here (by design)

- **Natural-language interpretation / readings.** This library only computes the chart. For a full natural-language reading, use [shunshi.ai](https://shunshi.ai) directly or drive your own LLM with this chart as input.
- **流年 / 流月 / 流日 detail.** v0.2 roadmap.
- **三合 / 三会 relations.** Neither the Shunshi backend nor the frontend UI compute these — only pair-wise 合/冲/刑/害/破/克. If you need them, open an issue.
- **动态神煞** (大运/流年 神煞). v0.2 roadmap.
- **繁體中文 / 日本語 / 한국어 label output.** All field keys and labels are currently Simplified Chinese. v0.2 will add an opt-in `locale` parameter for 繁體中文 (covers TW / HK / Japanese 四柱推命 terminology). Pure-Hangul Korean and English label translation are further out.

## FAQ

### Why default to `sect: 1` (23:00 = tomorrow)?

Because [问真八字](https://www.buyaolian.cn/) — the de-facto reference tool in mainland professional Bazi practice — defaults to sect 1, and so does the Shunshi.AI production backend. If you're cross-checking your charts against either of those, you want the same default. If you're in a Taiwanese / Hong Kong lineage that uses sect 2, just pass `sect: 2` — no behavior change from v0.1 onward.

### Why is true solar time correction `true` by default?

Because most people are asking "what are my Bazi?" not "what would my Bazi be if the planet were flat and everyone in the same timezone had the same solar noon?" A 30-minute correction is enough to shift a 时辰 boundary, which means the entire 时柱 — 3 out of your 8 characters — can flip. If you're coming from tools that use clock time, pass `useTrueSolarTime: false` to match their output.

### How is this different from `cantian-tymext`?

They're sibling libraries covering mostly the same ground. Key differences:

| | `cantian-tymext` | `shunshi-bazi-core` |
|---|---|---|
| **True solar time** | ❌ | ✅ default on |
| **子时 default** | sect 2 (23:00 = today) | sect 1 (23:00 = tomorrow) |
| **刑冲合会** | pair-wise + 拱/双合/伏吟/半三合 | pair-wise only (合/冲/刑/害/破/克) |
| **大运 enrichment** | Partial | 15 fields per decade incl. 当前 / 藏干十神 / 日主关系 |
| **Parity baseline** | — | vs Shunshi.AI Python backend + cantian |

We use `cantian-tymext` as a **dev dependency** in `tests/relations-vs-cantian.test.ts` to cross-check pair-wise relations. The two libraries are complementary — pick whichever matches the conventions your users expect.

### Can I use this in a browser?

Yes. `shunshi-bazi-core` is pure TypeScript, ESM, no Node-specific APIs. Works in the browser out of the box with any bundler (Vite, webpack, esbuild). `tyme4ts` (the calendar primitive we build on) also runs in the browser.

### Does it support ESM and CommonJS?

Currently **ESM only** (`"type": "module"`). If you're on CommonJS Node, you'll need dynamic `import()`. CJS dual-publish is on the v0.2 roadmap — open an issue if you need it sooner.

### What Node version?

`>=20`. We rely on stable `Intl.DateTimeFormat` and modern ES features.

### How big is the bundle?

~80KB unminified (including `tyme4ts`). ~25KB gzipped. Tree-shakeable — if you only import `equationOfTime`, you don't ship the Bazi chart builder.

### I found a discrepancy with 问真八字 / some other tool. Is the library wrong?

Possibly, but first check:
1. **Did you provide `city` or `longitude`/`latitude`?** 问真八字 uses clock time by default. Pass `useTrueSolarTime: false` to match.
2. **Are you on the sect boundary (23:00-00:59)?** Some tools default to sect 2. Pass `sect: 2` to match.
3. **节气 boundary day?** The solar year flips at 立春, not Jan 1 — but `tyme4ts` handles this, so this is usually **not** the source of discrepancies.

If after checking those three, the output still differs, please [open an issue](https://github.com/shunshi-ai/bazi-reader-mcp/issues) with the exact input and expected output — we'll investigate against our 5 golden parity cases.

## Related packages

- **[`shunshi-bazi-mcp`](../bazi-mcp)** — MCP (Model Context Protocol) server wrapping this library. Lets Claude Desktop / Cursor / Cline / any MCP-compatible AI agent compute Bazi charts directly. Same engine, same accuracy.

## About Shunshi.AI

🌐 **Website**: [https://shunshi.ai](https://shunshi.ai)
🐦 **X / Twitter**: [@shunshiai2026](https://x.com/shunshiai2026)
🚀 **Product Hunt**: [Shunshi.AI](https://www.producthunt.com/products/shunshi-ai)

[Shunshi.AI (顺时)](https://shunshi.ai) is an AI-powered Bazi reading platform supporting English, 中文, 日本語, and 한국어. Free to try, no credit card required. This library is the calculation engine behind our production backend — open-sourced so any developer can build on top of it with confidence that the numbers line up.

## License

[MIT](../../LICENSE) © 2026 [Shunshi.AI](https://shunshi.ai)

## Acknowledgements

- [`tyme4ts`](https://github.com/6tail/tyme4ts) by 6tail — the lunar/solar calendar primitives this library builds on
- [`cantian-ai/bazi-mcp`](https://github.com/cantian-ai/bazi-mcp) — pioneering open-source Bazi MCP; we use their `cantian-tymext` as a dev dependency for relations parity testing

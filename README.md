# Xuantian BaZi Engine / 玄天八字排盘引擎 / 玄天八字命式エンジン

[中文](#中文) · [English](#english) · [日本語](#日本語)

---

## 中文

### 介绍

玄天八字排盘引擎是一个独立的 TypeScript/JavaScript 八字计算库和 MCP stdio 服务，支持：

- 公历、农历及农历闰月出生日期。
- 四柱、十神、藏干、纳音、五行、生肖、命宫、身宫、胎元、胎息。
- 起运、大运、流年、流月和流日。
- 基于经度与 IANA 时区的真太阳时及历史夏令时修正。
- 四柱神煞、五行统计、十神统计和标准化命盘数据。
- 简体中文、繁体中文和英文术语输出。
- TypeScript 类型 API、兼容旧接口的 JSON API、命令行工具和 MCP 工具。

| 包 | 用途 |
| --- | --- |
| `xuantian-bazi` | 八字核心 API、兼容 API 和 JSON CLI |
| `xuantian-bazi-mcp` | 可通过 `npx` 启动的 MCP stdio 服务 |

> 想直接生成命盘并与 AI 命理智能体对话，请访问 **玄天 AI**：[https://www.xuantian-ai.com](https://www.xuantian-ai.com)

### 安装核心包

需要 Node.js 20 或更高版本。

```bash
npm install xuantian-bazi
```

### 生成完整命盘

```ts
import { calculateChart } from 'xuantian-bazi';

const result = calculateChart({
  name: '张三',
  gender: 'male',
  calendar: 'solar',
  birthDate: '1990-01-01',
  birthTime: '08:30',
  longitude: 116.4074,
  latitude: 39.9042,
  timeZone: 'Asia/Shanghai',
  trueSolarTime: true,
  sect: 2,
  locale: 'zh-CN',
});

console.log(result.normalizedChart.year_pillar);
console.log(result.normalizedChart.month_pillar);
console.log(result.normalizedChart.day_pillar);
console.log(result.normalizedChart.hour_pillar);
```

`calculateChart` 参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `gender` | `'male' \| 'female'` | 是 | 排运使用的性别 |
| `birthDate` | `YYYY-MM-DD` | 是 | 出生日期 |
| `birthTime` | `HH:mm` | 是 | 出生地当地民用时间 |
| `calendar` | `'solar' \| 'lunar'` | 否 | 默认 `solar` |
| `name` | `string` | 否 | 命主名称 |
| `profileId` | `string \| number` | 否 | 外部档案标识 |
| `longitude` | `number` | 否 | 出生地经度，东经为正 |
| `latitude` | `number` | 否 | 出生地纬度 |
| `timeZone` | `string` | 否 | IANA 时区，如 `Asia/Shanghai` |
| `trueSolarTime` | `boolean` | 否 | 是否启用真太阳时；经度和时区齐全时默认启用 |
| `leapMonth` | `boolean` | 否 | 农历日期是否为闰月 |
| `sect` | `1 \| 2` | 否 | 子时换日流派，默认 `2` |
| `locale` | `'zh-CN' \| 'zh-TW' \| 'en'` | 否 | 输出术语语言，默认 `zh-CN` |

返回值包含：

- `inputDateTime`：原始输入时间。
- `solarDateTime`：转换后的公历民用时间。
- `chartDateTime`：实际参与排盘的时间。
- `timeCorrections`：真太阳时和夏令时修正详情。
- `coreChart`：底层完整命盘数据。
- `cycles`：大运和流年数据。
- `shenSha`：四柱神煞数据。
- `normalizedChart`：适合应用、数据库和 AI 使用的标准化命盘。

参数不合法或计算失败时会抛出 `ChartEngineError`：

```ts
import { calculateChart, ChartEngineError } from 'xuantian-bazi';

try {
  calculateChart({
    gender: 'male',
    birthDate: '2023-02-31',
    birthTime: '08:30',
  });
} catch (error) {
  if (error instanceof ChartEngineError) {
    console.error(error.code, error.message);
  }
}
```

### 查询流年、流月和流日

```ts
import { calculateCycles } from 'xuantian-bazi';

const result = calculateCycles({
  gender: 'male',
  birthDate: '1990-01-01',
  birthTime: '08:30',
  targetYear: 2026,
  targetMonth: 1,
});

console.log(result.yearCycle);
console.log(result.monthlyCycles);
console.log(result.dailyCycles);
```

除完整命盘参数外，`calculateCycles` 还接受：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `targetYear` | `number` | 是 | 目标流年，范围 1800–2300 |
| `targetMonth` | `number` | 否 | 目标流月，范围 1–12；提供后返回对应流日 |
| `targetDate` | `YYYY-MM-DD` | 否 | 用具体日期自动定位所属流月 |

### 兼容 JSON API

旧项目可以继续使用 `chart()` 和 `cycles()`。输入保持蛇形字段，并返回 `{ code, message, data }`：

```ts
import { chart, cycles } from 'xuantian-bazi';

const chartResult = chart({
  name: '张三',
  gender: 1,
  calendar_type: 1,
  birth_date: '1990-01-01',
  birth_time: '08:30',
  birth_longitude: 116.4074,
  birth_latitude: 39.9042,
  birth_timezone: 'Asia/Shanghai',
  locale: 'zh-CN',
});

const cycleResult = cycles({
  gender: 1,
  calendar_type: 1,
  birth_date: '1990-01-01',
  birth_time: '08:30',
  target_year: 2026,
  target_month: 1,
});
```

### JSON 命令行工具

通过 stdin：

```bash
echo '{"gender":1,"calendar_type":1,"birth_date":"1990-01-01","birth_time":"08:30"}' \
  | npx xuantian-bazi-calculate
```

通过参数或文件：

```bash
npx xuantian-bazi-calculate --data '{"gender":1,"birth_date":"1990-01-01","birth_time":"08:30"}'
npx xuantian-bazi-calculate --file input.json --pretty
npx xuantian-bazi-calculate --action cycles --file cycles.json --pretty
```

### MCP 用法

直接启动：

```bash
npx -y xuantian-bazi-mcp
```

MCP 客户端配置：

```json
{
  "mcpServers": {
    "xuantian-bazi": {
      "command": "npx",
      "args": ["-y", "xuantian-bazi-mcp"]
    }
  }
}
```

可用工具：

- `calculate_bazi_chart`：生成完整八字命盘。
- `calculate_bazi_cycles`：查询指定流年、流月和流日。

两个工具使用与 TypeScript API 相同的 camelCase 参数，返回 JSON 文本及 MCP `structuredContent`。

---

## English

### Introduction

Xuantian BaZi Engine is a standalone TypeScript/JavaScript BaZi calculation library and MCP stdio server. It supports:

- Solar, lunar, and leap-lunar birth dates.
- Four Pillars, Ten Gods, hidden stems, Na Yin, Five Elements, zodiac, Life Palace, Body Palace, Tai Yuan, and Tai Xi.
- Luck onset, decade luck, annual, monthly, and daily cycles.
- True solar time and historical daylight-saving correction using longitude and an IANA time zone.
- Pillar-based Shen Sha, Five Element statistics, Ten God statistics, and normalized chart data.
- Simplified Chinese, Traditional Chinese, and English terminology.
- Typed TypeScript APIs, a legacy-compatible JSON API, a CLI, and MCP tools.

| Package | Purpose |
| --- | --- |
| `xuantian-bazi` | Core BaZi API, legacy-compatible API, and JSON CLI |
| `xuantian-bazi-mcp` | MCP stdio server runnable through `npx` |

> To generate charts online and talk with AI BaZi agents, visit **Xuantian AI**: [https://www.xuantian-ai.com](https://www.xuantian-ai.com)

### Install the core package

Node.js 20 or newer is required.

```bash
npm install xuantian-bazi
```

### Calculate a complete chart

```ts
import { calculateChart } from 'xuantian-bazi';

const result = calculateChart({
  name: 'Alex',
  gender: 'male',
  calendar: 'solar',
  birthDate: '1990-01-01',
  birthTime: '08:30',
  longitude: 116.4074,
  latitude: 39.9042,
  timeZone: 'Asia/Shanghai',
  trueSolarTime: true,
  sect: 2,
  locale: 'en',
});

console.log(result.normalizedChart.year_pillar);
console.log(result.normalizedChart.month_pillar);
console.log(result.normalizedChart.day_pillar);
console.log(result.normalizedChart.hour_pillar);
```

`calculateChart` parameters:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `gender` | `'male' \| 'female'` | Yes | Gender used by the luck-cycle rules |
| `birthDate` | `YYYY-MM-DD` | Yes | Birth date |
| `birthTime` | `HH:mm` | Yes | Local civil birth time |
| `calendar` | `'solar' \| 'lunar'` | No | Defaults to `solar` |
| `name` | `string` | No | Profile name |
| `profileId` | `string \| number` | No | External profile identifier |
| `longitude` | `number` | No | Birth longitude, east positive |
| `latitude` | `number` | No | Birth latitude |
| `timeZone` | `string` | No | IANA zone such as `Asia/Shanghai` |
| `trueSolarTime` | `boolean` | No | Enables true solar time; defaults on when longitude and time zone are present |
| `leapMonth` | `boolean` | No | Whether a lunar date belongs to a leap month |
| `sect` | `1 \| 2` | No | Zi-hour day-switching school; defaults to `2` |
| `locale` | `'zh-CN' \| 'zh-TW' \| 'en'` | No | Output terminology; defaults to `zh-CN` |

The result contains:

- `inputDateTime`: original input time.
- `solarDateTime`: converted solar civil time.
- `chartDateTime`: time actually used for chart calculation.
- `timeCorrections`: true-solar-time and DST correction details.
- `coreChart`: complete low-level chart data.
- `cycles`: decade and annual cycle data.
- `shenSha`: pillar-based Shen Sha data.
- `normalizedChart`: normalized data suitable for applications, databases, and AI.

Invalid input or calculation failures throw `ChartEngineError`:

```ts
import { calculateChart, ChartEngineError } from 'xuantian-bazi';

try {
  calculateChart({
    gender: 'male',
    birthDate: '2023-02-31',
    birthTime: '08:30',
  });
} catch (error) {
  if (error instanceof ChartEngineError) {
    console.error(error.code, error.message);
  }
}
```

### Calculate annual, monthly, and daily cycles

```ts
import { calculateCycles } from 'xuantian-bazi';

const result = calculateCycles({
  gender: 'male',
  birthDate: '1990-01-01',
  birthTime: '08:30',
  targetYear: 2026,
  targetMonth: 1,
});

console.log(result.yearCycle);
console.log(result.monthlyCycles);
console.log(result.dailyCycles);
```

In addition to the chart parameters, `calculateCycles` accepts:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `targetYear` | `number` | Yes | Target annual cycle, from 1800 to 2300 |
| `targetMonth` | `number` | No | Target month, from 1 to 12; includes daily cycles when provided |
| `targetDate` | `YYYY-MM-DD` | No | Resolves the corresponding cycle month from a date |

### Legacy-compatible JSON API

Existing applications can keep using `chart()` and `cycles()`. They accept snake_case input and return `{ code, message, data }`:

```ts
import { chart, cycles } from 'xuantian-bazi';

const chartResult = chart({
  name: 'Alex',
  gender: 1,
  calendar_type: 1,
  birth_date: '1990-01-01',
  birth_time: '08:30',
  birth_longitude: 116.4074,
  birth_latitude: 39.9042,
  birth_timezone: 'Asia/Shanghai',
  locale: 'en',
});

const cycleResult = cycles({
  gender: 1,
  calendar_type: 1,
  birth_date: '1990-01-01',
  birth_time: '08:30',
  target_year: 2026,
  target_month: 1,
});
```

### JSON CLI

Using stdin:

```bash
echo '{"gender":1,"calendar_type":1,"birth_date":"1990-01-01","birth_time":"08:30"}' \
  | npx xuantian-bazi-calculate
```

Using inline JSON or a file:

```bash
npx xuantian-bazi-calculate --data '{"gender":1,"birth_date":"1990-01-01","birth_time":"08:30"}'
npx xuantian-bazi-calculate --file input.json --pretty
npx xuantian-bazi-calculate --action cycles --file cycles.json --pretty
```

### MCP usage

Start the server directly:

```bash
npx -y xuantian-bazi-mcp
```

MCP client configuration:

```json
{
  "mcpServers": {
    "xuantian-bazi": {
      "command": "npx",
      "args": ["-y", "xuantian-bazi-mcp"]
    }
  }
}
```

Available tools:

- `calculate_bazi_chart`: calculates a complete BaZi natal chart.
- `calculate_bazi_cycles`: calculates a selected annual, monthly, and daily cycle.

Both tools use the same camelCase parameters as the TypeScript API and return JSON text plus MCP `structuredContent`.

---

## 日本語

### 紹介

玄天八字命式エンジンは、独立した TypeScript/JavaScript の八字・四柱推命計算ライブラリおよび MCP stdio サーバーです。以下の機能を提供します。

- 新暦、旧暦、旧暦の閏月による生年月日入力。
- 四柱、通変星、蔵干、納音、五行、十二支、命宮、身宮、胎元、胎息。
- 起運、大運、流年、流月、流日。
- 経度と IANA タイムゾーンに基づく真太陽時および過去の夏時間補正。
- 各柱の神煞、五行統計、通変星統計、正規化された命式データ。
- 簡体字中国語、繁体字中国語、英語の用語出力。
- TypeScript 型付き API、旧 API 互換 JSON API、CLI、MCP ツール。

| パッケージ | 用途 |
| --- | --- |
| `xuantian-bazi` | 八字計算 API、旧 API 互換 API、JSON CLI |
| `xuantian-bazi-mcp` | `npx` で起動できる MCP stdio サーバー |

> オンラインで命式を作成し、AI の命理エージェントと対話するには、**玄天 AI** をご利用ください：[https://www.xuantian-ai.com](https://www.xuantian-ai.com)

### コアパッケージのインストール

Node.js 20 以降が必要です。

```bash
npm install xuantian-bazi
```

### 完全な命式を計算する

```ts
import { calculateChart } from 'xuantian-bazi';

const result = calculateChart({
  name: '山田太郎',
  gender: 'male',
  calendar: 'solar',
  birthDate: '1990-01-01',
  birthTime: '08:30',
  longitude: 139.6917,
  latitude: 35.6895,
  timeZone: 'Asia/Tokyo',
  trueSolarTime: true,
  sect: 2,
  locale: 'en',
});

console.log(result.normalizedChart.year_pillar);
console.log(result.normalizedChart.month_pillar);
console.log(result.normalizedChart.day_pillar);
console.log(result.normalizedChart.hour_pillar);
```

`calculateChart` の引数：

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `gender` | `'male' \| 'female'` | はい | 大運計算に使用する性別 |
| `birthDate` | `YYYY-MM-DD` | はい | 生年月日 |
| `birthTime` | `HH:mm` | はい | 出生地の現地標準時 |
| `calendar` | `'solar' \| 'lunar'` | いいえ | 既定値は `solar` |
| `name` | `string` | いいえ | 命式の名前 |
| `profileId` | `string \| number` | いいえ | 外部プロフィール ID |
| `longitude` | `number` | いいえ | 出生地の経度、東経を正とする |
| `latitude` | `number` | いいえ | 出生地の緯度 |
| `timeZone` | `string` | いいえ | `Asia/Tokyo` などの IANA タイムゾーン |
| `trueSolarTime` | `boolean` | いいえ | 真太陽時を有効化。経度とタイムゾーンがある場合は既定で有効 |
| `leapMonth` | `boolean` | いいえ | 旧暦の日付が閏月かどうか |
| `sect` | `1 \| 2` | いいえ | 子刻の日付切替方式。既定値は `2` |
| `locale` | `'zh-CN' \| 'zh-TW' \| 'en'` | いいえ | 出力用語。既定値は `zh-CN` |

戻り値には以下が含まれます。

- `inputDateTime`：入力された時刻。
- `solarDateTime`：新暦へ変換された現地時刻。
- `chartDateTime`：命式計算に実際に使用された時刻。
- `timeCorrections`：真太陽時と夏時間の補正情報。
- `coreChart`：完全な低レベル命式データ。
- `cycles`：大運と流年のデータ。
- `shenSha`：各柱の神煞データ。
- `normalizedChart`：アプリ、データベース、AI で利用しやすい正規化データ。

入力エラーまたは計算エラーの場合は `ChartEngineError` が送出されます。

```ts
import { calculateChart, ChartEngineError } from 'xuantian-bazi';

try {
  calculateChart({
    gender: 'male',
    birthDate: '2023-02-31',
    birthTime: '08:30',
  });
} catch (error) {
  if (error instanceof ChartEngineError) {
    console.error(error.code, error.message);
  }
}
```

### 流年・流月・流日を計算する

```ts
import { calculateCycles } from 'xuantian-bazi';

const result = calculateCycles({
  gender: 'male',
  birthDate: '1990-01-01',
  birthTime: '08:30',
  targetYear: 2026,
  targetMonth: 1,
});

console.log(result.yearCycle);
console.log(result.monthlyCycles);
console.log(result.dailyCycles);
```

命式用の引数に加えて、`calculateCycles` は以下を受け取ります。

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `targetYear` | `number` | はい | 対象の流年。1800～2300 |
| `targetMonth` | `number` | いいえ | 対象の流月。1～12。指定すると流日も返す |
| `targetDate` | `YYYY-MM-DD` | いいえ | 指定日から該当する流月を判定する |

### 旧 JSON API との互換性

既存アプリケーションでは `chart()` と `cycles()` をそのまま利用できます。snake_case の引数を受け取り、`{ code, message, data }` を返します。

```ts
import { chart, cycles } from 'xuantian-bazi';

const chartResult = chart({
  name: '山田太郎',
  gender: 1,
  calendar_type: 1,
  birth_date: '1990-01-01',
  birth_time: '08:30',
  birth_longitude: 139.6917,
  birth_latitude: 35.6895,
  birth_timezone: 'Asia/Tokyo',
  locale: 'en',
});

const cycleResult = cycles({
  gender: 1,
  calendar_type: 1,
  birth_date: '1990-01-01',
  birth_time: '08:30',
  target_year: 2026,
  target_month: 1,
});
```

### JSON CLI

stdin を使用する場合：

```bash
echo '{"gender":1,"calendar_type":1,"birth_date":"1990-01-01","birth_time":"08:30"}' \
  | npx xuantian-bazi-calculate
```

JSON 引数またはファイルを使用する場合：

```bash
npx xuantian-bazi-calculate --data '{"gender":1,"birth_date":"1990-01-01","birth_time":"08:30"}'
npx xuantian-bazi-calculate --file input.json --pretty
npx xuantian-bazi-calculate --action cycles --file cycles.json --pretty
```

### MCP の使い方

直接起動：

```bash
npx -y xuantian-bazi-mcp
```

MCP クライアント設定：

```json
{
  "mcpServers": {
    "xuantian-bazi": {
      "command": "npx",
      "args": ["-y", "xuantian-bazi-mcp"]
    }
  }
}
```

利用できるツール：

- `calculate_bazi_chart`：完全な八字命式を計算します。
- `calculate_bazi_cycles`：指定した流年、流月、流日を計算します。

どちらのツールも TypeScript API と同じ camelCase の引数を使用し、JSON テキストと MCP `structuredContent` を返します。

> AI によるオンライン命式作成と命理解釈は **玄天 AI** で体験できます：[https://www.xuantian-ai.com](https://www.xuantian-ai.com)

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  calculateChart,
  calculateCycles,
  chart,
  ChartEngineError,
  type ChartInput,
} from '../src/index.js';

interface Fixture {
  input: ChartInput;
  chartDateTime: string;
  pillars: string[];
  dayMaster: string;
  zodiac: string;
  shenShaCount: number;
}

const fixtures = JSON.parse(
  readFileSync(fileURLToPath(new URL('./fixtures/known-charts.json', import.meta.url)), 'utf8'),
) as Record<string, Fixture>;

const require = createRequire(import.meta.url);
const legacyCalculator = require('../src/legacy/calculator.js') as {
  applyDSTCorrection: (
    hour: number,
    minute: number,
    year: number,
    month: number,
    day: number,
  ) => { dstApplied: boolean; dstMinutes: number };
};

describe('calculateChart', () => {
  for (const [name, fixture] of Object.entries(fixtures)) {
    it(`matches ${name}`, () => {
      const result = calculateChart(fixture.input);
      const normalized = result.normalizedChart;
      expect(result.chartDateTime).toBe(fixture.chartDateTime);
      expect([
        normalized.year_pillar,
        normalized.month_pillar,
        normalized.day_pillar,
        normalized.hour_pillar,
      ]).toEqual(fixture.pillars);
      expect(normalized.day_master).toBe(fixture.dayMaster);
      expect(normalized.zodiac).toBe(fixture.zodiac);
      expect(normalized.shen_sha_insights).toHaveLength(fixture.shenShaCount);
      expect(result.shenSha.source).toBe('shunshi-bazi-core');
    });
  }

  it('rejects an impossible Gregorian date', () => {
    expect(() => calculateChart({
      gender: 'male',
      birthDate: '2023-02-31',
      birthTime: '08:30',
    })).toThrow(ChartEngineError);
  });

  it('requires location when true solar time is explicitly enabled', () => {
    expect(() => calculateChart({
      gender: 'male',
      birthDate: '1990-01-01',
      birthTime: '08:30',
      trueSolarTime: true,
    })).toThrow(/requires longitude and timeZone/);
  });

  it('retains the legacy response envelope', () => {
    const result = chart({
      gender: 1,
      calendar_type: 1,
      birth_date: '1990-01-01',
      birth_time: '08:30',
      use_true_solar_time: false,
    });
    expect(result.code).toBe(0);
    expect(result.data?.normalized_chart.year_pillar).toBe('己巳');
  });

  it('uses the lunar-javascript gender convention when arranging luck cycles', () => {
    const male = calculateChart({
      gender: 'male',
      birthDate: '1990-01-01',
      birthTime: '08:30',
    });
    const female = calculateChart({
      gender: 'female',
      birthDate: '1990-01-01',
      birthTime: '08:30',
    });

    expect(male.normalizedChart.decade_cycles).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '乙亥', start_year: 1998, end_year: 2007 }),
    ]));
    expect(female.normalizedChart.decade_cycles).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '丁丑', start_year: 1991, end_year: 2000 }),
    ]));
  });

  it('uses month-strength scores consistently for useful elements and day-master strength', () => {
    const result = calculateChart({
      name: '喜用神基准',
      gender: 'male',
      birthDate: '1993-03-31',
      birthTime: '08:00',
      trueSolarTime: false,
    });

    expect(Object.fromEntries(
      (result.normalizedChart.five_elements_summary as Array<{ element: string; score: number }>)
        .map((item) => [item.element, item.score]),
    )).toEqual({ 木: 3.12, 火: 0, 土: 0.5, 金: 2, 水: 2.9 });
    expect(result.normalizedChart.useful_elements).toEqual(['土', '金']);
    expect(result.normalizedChart.unfavorable_elements).toEqual(['火', '水', '木']);
    expect((result.normalizedChart.day_master_analysis as { overall: { label: string } }).overall.label).toBe('偏弱');
    expect(result.normalizedChart.engine_version).toBe('v1.3');
  });

  it('rejects unsupported years and nonexistent lunar dates', () => {
    expect(() => calculateChart({
      gender: 'female',
      birthDate: '1700-01-01',
      birthTime: '12:00',
    })).toThrow(/1800.*2300/);

    expect(() => calculateChart({
      gender: 'male',
      calendar: 'lunar',
      birthDate: '2024-03-30',
      birthTime: '12:00',
    })).toThrow(/实际天数/);
  });
});

describe('calculateCycles', () => {
  it('returns twelve months and daily detail on demand', () => {
    const result = calculateCycles({
      gender: 'male',
      birthDate: '1990-01-01',
      birthTime: '08:30',
      targetYear: 2026,
      targetMonth: 1,
    });
    expect(result.year).toBe(2026);
    expect(result.decadeCycle).toEqual(expect.objectContaining({
      start_age: expect.any(Number),
      end_age: expect.any(Number),
      main_star: expect.any(String),
    }));
    expect(result.transitInteractions.length).toBeGreaterThan(0);
    expect(result.transitInteractions).toEqual(expect.arrayContaining([
      expect.objectContaining({ source_b: expect.stringMatching(/大运|流年/) }),
    ]));
    expect(result.monthlyCycles).toHaveLength(12);
    expect(result.dailyCycles.length).toBeGreaterThan(27);
  });
});

describe('historical daylight-saving boundaries', () => {
  it('uses the real 1986 start date and the 02:00 transition time', () => {
    expect(legacyCalculator.applyDSTCorrection(1, 59, 1986, 5, 4)).toEqual(expect.objectContaining({
      dstApplied: false,
      dstMinutes: 0,
    }));
    expect(legacyCalculator.applyDSTCorrection(2, 0, 1986, 5, 4)).toEqual(expect.objectContaining({
      dstApplied: true,
      dstMinutes: -60,
    }));
  });
});

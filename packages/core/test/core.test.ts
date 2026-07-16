import { readFileSync } from 'node:fs';
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
    expect(result.monthlyCycles).toHaveLength(12);
    expect(result.dailyCycles.length).toBeGreaterThan(27);
  });
});

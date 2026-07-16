import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  calculateChart,
  calculateCycles,
  ChartEngineError,
  getEngineInfo,
  type ChartInput,
  type CycleInput,
} from 'xuantian-bazi';
import { z } from 'zod';

const chartInputShape = {
  name: z.string().max(100).optional(),
  profileId: z.union([z.string(), z.number()]).optional(),
  gender: z.enum(['male', 'female']).describe('Birth gender used by the BaZi cycle rules'),
  calendar: z.enum(['solar', 'lunar']).default('solar'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Birth date in YYYY-MM-DD form'),
  birthTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).describe('Local civil time in HH:mm form'),
  longitude: z.number().min(-180).max(180).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  timeZone: z.string().optional().describe('IANA time zone, for example Asia/Shanghai'),
  locale: z.enum(['zh-CN', 'zh-TW', 'en']).default('zh-CN'),
  leapMonth: z.boolean().default(false),
  sect: z.union([z.literal(1), z.literal(2)]).default(2),
  trueSolarTime: z.boolean().optional(),
};

function toolError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const code = error instanceof ChartEngineError ? (error as ChartEngineError).code : 500;
  return {
    isError: true as const,
    content: [{ type: 'text' as const, text: JSON.stringify({ code, message }) }],
  };
}

export function createMcpServer(): McpServer {
  const server = new McpServer(getEngineInfo());

  server.registerTool(
    'calculate_bazi_chart',
    {
      title: 'Calculate BaZi Chart',
      description: 'Calculate a complete BaZi natal chart, true solar time, ten gods, five elements, cycles and Shen Sha.',
      inputSchema: chartInputShape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (input) => {
      try {
        const result = calculateChart(input as ChartInput);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'calculate_bazi_cycles',
    {
      title: 'Calculate BaZi Cycles',
      description: 'Calculate the selected annual cycle and optionally its monthly and daily cycles.',
      inputSchema: {
        ...chartInputShape,
        targetYear: z.number().int().min(1800).max(2300),
        targetMonth: z.number().int().min(1).max(12).optional(),
        targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (input) => {
      try {
        const result = calculateCycles(input as CycleInput);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  return server;
}

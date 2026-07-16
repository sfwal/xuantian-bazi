import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createMcpServer } from '../src/server.js';

describe('xuantian-bazi MCP server', () => {
  let server: ReturnType<typeof createMcpServer>;
  let client: Client;

  beforeEach(async () => {
    server = createMcpServer();
    client = new Client({ name: 'xuantian-bazi-test', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);
  });

  afterEach(async () => {
    await Promise.all([client.close(), server.close()]);
  });

  it('publishes the two read-only calculation tools', async () => {
    const response = await client.listTools();
    expect(response.tools.map((tool) => tool.name)).toEqual([
      'calculate_bazi_chart',
      'calculate_bazi_cycles',
    ]);
    expect(response.tools.every((tool) => tool.annotations?.readOnlyHint)).toBe(true);
  });

  it('returns structured chart content', async () => {
    const response = await client.callTool({
      name: 'calculate_bazi_chart',
      arguments: {
        gender: 'male',
        birthDate: '1990-01-01',
        birthTime: '08:30',
      },
    });
    expect(response.isError).not.toBe(true);
    expect(response.structuredContent).toMatchObject({
      normalizedChart: {
        year_pillar: '己巳',
        month_pillar: '丙子',
      },
    });
  });

  it('returns a tool error for invalid dates', async () => {
    const response = await client.callTool({
      name: 'calculate_bazi_chart',
      arguments: {
        gender: 'male',
        birthDate: '2023-02-31',
        birthTime: '08:30',
      },
    });
    expect(response.isError).toBe(true);
  });
});

#!/usr/bin/env node

const { readFile } = require('node:fs/promises');
const { chart, cycles } = require('../dist/index.js');

async function readStdin() {
  if (process.stdin.isTTY) return '';
  process.stdin.setEncoding('utf8');
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

function valueAfter(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

async function main() {
  const args = process.argv.slice(2);
  const file = valueAfter(args, '--file');
  const inline = valueAfter(args, '--data');
  const action = valueAfter(args, '--action') || 'chart';
  if (!['chart', 'cycles'].includes(action)) throw new Error('--action must be chart or cycles');

  const source = file ? await readFile(file, 'utf8') : inline || await readStdin();
  if (!source.trim()) throw new Error('provide JSON through stdin, --data, or --file');

  const input = JSON.parse(source);
  const result = action === 'cycles' ? cycles(input) : chart(input);
  process.stdout.write(`${JSON.stringify(result, null, args.includes('--pretty') ? 2 : 0)}\n`);
  process.exitCode = result.code === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error('[xuantian-bazi] error:', error instanceof Error ? error.message : error);
  process.exitCode = 2;
});

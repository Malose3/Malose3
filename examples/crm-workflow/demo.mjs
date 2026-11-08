import { readFile } from 'node:fs/promises';
import { planTasks } from './workflow.mjs';

// Carga únicamente el archivo ficticio incluido junto a este script.
const records = JSON.parse(await readFile(new URL('./demo-records.json', import.meta.url), 'utf8'));
const result = planTasks(records, { asOf: '2026-11-08', followUpDays: 7 });
console.log(JSON.stringify(result, null, 2));

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { planTasks } from './workflow.mjs';

const options = { asOf: '2026-11-08' };
const record = (extra = {}) => ({
  id: 'DEMO-001', email: 'demo@example.invalid', stage: 'new', lastContactDate: null, ...extra,
});

test('la demo separa tareas, registros válidos sin acción y errores', async () => {
  const input = JSON.parse(await readFile(new URL('./demo-records.json', import.meta.url), 'utf8'));
  const result = planTasks(input, options);
  assert.deepEqual(result.summary, { input: 7, accepted: 4, rejected: 3, tasks: 2 });
  assert.deepEqual(result.tasks, [
    { recordId: 'DEMO-001', action: 'review_new_record' },
    { recordId: 'DEMO-002', action: 'review_follow_up' },
  ]);
  assert.deepEqual(result.issues, [
    { row: 5, reason: 'duplicate_identity' },
    { row: 6, reason: 'missing_id_or_invalid_email' },
    { row: 7, reason: 'invalid_or_future_contact_date' },
  ]);
});

test('el umbral incluye exactamente siete días y excluye seis', () => {
  for (const [lastContactDate, count] of [['2026-11-01', 1], ['2026-11-02', 0]]) {
    assert.equal(planTasks([record({ stage: 'contacted', lastContactDate })], options).tasks.length, count);
  }
});

test('un expediente cerrado no genera seguimiento aunque sea antiguo', () => {
  const result = planTasks([record({ stage: 'closed', lastContactDate: '2020-01-01' })], options);
  assert.equal(result.summary.accepted, 1);
  assert.deepEqual(result.tasks, []);
});

test('deduplica por correo normalizado y por identificador', () => {
  const result = planTasks([
    record(), record({ id: 'DEMO-002', email: ' DEMO@EXAMPLE.INVALID ' }),
    record({ email: 'otro@example.invalid' }),
  ], options);
  assert.equal(result.tasks.length, 1);
  assert.equal(result.issues.length, 2);
});

test('un registro inválido no bloquea una versión válida posterior', () => {
  const result = planTasks([record({ stage: 'unsupported' }), record()], options);
  assert.equal(result.summary.accepted, 1);
  assert.equal(result.tasks.length, 1);
});

test('rechaza fechas imposibles, futuras y contactos sin fecha', () => {
  for (const lastContactDate of ['2026-02-30', '2026-11-09', '', null]) {
    const result = planTasks([record({ stage: 'contacted', lastContactDate })], options);
    assert.equal(result.summary.rejected, 1);
    assert.deepEqual(result.tasks, []);
  }
  assert.equal(planTasks([record({ stage: 'contacted', lastContactDate: '2024-02-29' })], options).tasks.length, 1);
});

test('informa filas mal formadas sin detener el resto del lote', () => {
  const result = planTasks([null, [], {}, record()], options);
  assert.equal(result.summary.rejected, 3);
  assert.equal(result.summary.accepted, 1);
});

test('valida la configuración antes de procesar datos', () => {
  assert.throws(() => planTasks([], { asOf: '2026-02-30' }), TypeError);
  assert.throws(() => planTasks({}, options), TypeError);
  for (const followUpDays of [0, -1, 1.5, Infinity]) {
    assert.throws(() => planTasks([], { ...options, followUpDays }), RangeError);
  }
});

test('es reproducible, no modifica la entrada y no copia correos en la salida', () => {
  const input = Object.freeze([Object.freeze(record())]);
  const first = planTasks(input, options);
  assert.deepEqual(planTasks(input, options), first);
  assert.equal(JSON.stringify(first).includes('example.invalid'), false);
  assert.deepEqual(input, [record()]);
});

test('un lote vacío produce un informe vacío', () => {
  assert.deepEqual(planTasks([], options), {
    asOf: '2026-11-08', summary: { input: 0, accepted: 0, rejected: 0, tasks: 0 }, tasks: [], issues: [],
  });
});

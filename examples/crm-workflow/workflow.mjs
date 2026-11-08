/** Ejemplo independiente de portafolio; no reproduce un CRM ni sus reglas reales. */
const DAY_MS = 86_400_000;
const STAGES = new Set(['new', 'contacted', 'closed']);

function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(value + 'T00:00:00Z');
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp).toISOString().slice(0, 10) === value ? timestamp : null;
}

/**
 * Genera propuestas locales de tareas y un informe de errores.
 * La fecha es explícita para que el resultado sea reproducible.
 * No modifica la entrada ni envía mensajes o escribe en servicios externos.
 */
export function planTasks(records, { asOf, followUpDays = 7 } = {}) {
  const today = parseDate(asOf);
  if (today === null) throw new TypeError('asOf debe ser una fecha real YYYY-MM-DD.');
  if (!Array.isArray(records)) throw new TypeError('Se requiere una lista de registros.');
  if (!Number.isInteger(followUpDays) || followUpDays < 1) {
    throw new RangeError('followUpDays debe ser un entero positivo.');
  }

  const tasks = [];
  const issues = [];
  const seenIds = new Set();
  const seenEmails = new Set();
  let accepted = 0;

  records.forEach((record, index) => {
    const row = index + 1;
    const reject = reason => issues.push({ row, reason });
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      reject('invalid_record');
      return;
    }

    const id = typeof record.id === 'string' ? record.id.trim() : '';
    const email = typeof record.email === 'string' ? record.email.trim().toLowerCase() : '';
    if (!id || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      reject('missing_id_or_invalid_email');
      return;
    }
    if (!STAGES.has(record.stage)) {
      reject('unknown_stage');
      return;
    }

    let lastContact = null;
    if (record.lastContactDate !== null && record.lastContactDate !== undefined) {
      lastContact = parseDate(record.lastContactDate);
      if (lastContact === null || lastContact > today) {
        reject('invalid_or_future_contact_date');
        return;
      }
    }
    if (record.stage === 'contacted' && lastContact === null) {
      reject('contact_date_required');
      return;
    }
    // Solo un registro válido reserva la identidad; el primero prevalece.
    if (seenIds.has(id) || seenEmails.has(email)) {
      reject('duplicate_identity');
      return;
    }
    seenIds.add(id);
    seenEmails.add(email);
    accepted += 1;

    if (record.stage === 'new') {
      tasks.push({ recordId: id, action: 'review_new_record' });
    } else if (record.stage === 'contacted' && (today - lastContact) / DAY_MS >= followUpDays) {
      tasks.push({ recordId: id, action: 'review_follow_up' });
    }
  });

  // La salida no necesita copiar correos, nombres ni el resto del registro.
  return {
    asOf,
    summary: { input: records.length, accepted, rejected: issues.length, tasks: tasks.length },
    tasks,
    issues,
  };
}

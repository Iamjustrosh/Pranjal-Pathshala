import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  academicRow, academicHistory, closeAcademicRecord, editAcademicRecord,
  listAcademicRecords, promoteAcademicRecord, searchAcademicRecords,
} from './academicRecords.js';

const record = { academic_record_id: 42, student_id: 7, academic_year: 2026, class: 7, status: 'active' };

for (const shape of ['object', 'array', 'null', 'empty array']) {
  test(`maps ${shape} student relationship without losing academic identity`, () => {
    const student = { student_name: 'Anuswara singhal', photo_url: 'photo.jpg', contact_number: 'redacted' };
    const students = shape === 'object' ? student : shape === 'array' ? [student] : shape === 'null' ? null : [];
    const mapped = academicRow({ id: 23, student_id: 113, uid: 'PP2604101', academic_year: 2026, class: 4, status: 'active', students });
    assert.equal(mapped.academic_record_id, 23);
    assert.equal(mapped.student_id, 113);
    assert.equal(mapped.student_name, ['object', 'array'].includes(shape) ? student.student_name : '');
    assert.equal(mapped.photo_url, ['object', 'array'].includes(shape) ? student.photo_url : null);
    assert.deepEqual(mapped.interested_subjects, []);
    assert.equal('students' in mapped, false);
    assert.equal('id' in mapped, false);
    assert.equal('0' in mapped, false);
  });
}

test('nine nested active 2026 records survive the service and UI search path', async () => {
  const raw = Array.from({ length: 9 }, (_, index) => ({
    id: 23 + index, student_id: 113 + index, uid: `PP2604${101 + index}`,
    academic_year: 2026, class: 4, status: 'active',
    students: index % 2 ? [{ student_name: `Student ${index}` }] : { student_name: `Student ${index}` },
  }));
  const client = queryClient([raw]);
  const filters = { year: '2026', classNumber: '', status: 'active' };
  const mapped = await listAcademicRecords(client, filters);
  assert.equal(searchAcademicRecords(mapped, '').length, 9);
  assert.equal(searchAcademicRecords(mapped, 'student').length, 9);
  assert.equal(searchAcademicRecords(mapped, 'PP2604101').length, 1);
  assert.equal(mapped.filter(row => row.status === filters.status).length, 9);
  assert.ok(client.calls.some(call => call[0] === 'eq' && call[1] === 'status' && call[2] === 'active'));
});

function queryClient(pages = [[{ id: 42 }]]) {
  const calls = [];
  let page = 0;
  const query = {};
  for (const method of ['select', 'order', 'eq', 'update']) {
    query[method] = (...args) => { calls.push([method, ...args]); return query; };
  }
  query.range = async (...args) => { calls.push(['range', ...args]); return { data: pages[page++] || [], error: null }; };
  query.single = async () => ({ data: pages[0][0], error: null });
  return { calls, from: table => { calls.push(['from', table]); return query; } };
}

test('academic identity cannot be replaced by legacy profile values', () => {
  const row = academicRow({ id: 42, student_id: 7, class: 8, academic_year: 2026, uid: 'PP2608101', students: { id: 7, class: 3, session: 'old', username: 'old', student_name: 'Anita' } });
  assert.equal(row.academic_record_id, 42);
  assert.equal(row.student_id, 7);
  assert.equal(row.class, 8);
  assert.equal(row.uid, 'PP2608101');
  assert.equal(searchAcademicRecords([row], ' ANITA ').length, 1);
  assert.equal(searchAcademicRecords([row], 'pp2608').length, 1);
  assert.equal(searchAcademicRecords([row], 'old').length, 0);
});

test('roster paginates and applies academic filters to a profile join', async () => {
  const client = queryClient([Array.from({ length: 500 }, (_, id) => ({ id, student_id: id })), [{ id: 501, student_id: 1 }]]);
  const rows = await listAcademicRecords(client, { year: '2026', classNumber: '7', status: 'active' });
  assert.equal(rows.length, 501);
  assert.ok(client.calls.some(call => call[0] === 'select' && call[1].includes('students!inner(')));
  for (const filter of [['eq', 'academic_year', 2026], ['eq', 'class', 7], ['eq', 'status', 'active'], ['range', 500, 999]]) {
    assert.ok(client.calls.some(call => JSON.stringify(call) === JSON.stringify(filter)));
  }
});

test('history queries permanent student identity', async () => {
  const client = queryClient();
  await academicHistory(client, 7);
  assert.ok(client.calls.some(call => call[0] === 'eq' && call[1] === 'student_id' && call[2] === 7));
  assert.ok(!client.calls.some(call => call[1] === 'uid'));
});

test('promotion uses one atomic RPC with exact parameters', async () => {
  const calls = [];
  const client = { rpc: async (...args) => { calls.push(args); return { data: { id: 43, uid: 'PP2708101' }, error: null }; } };
  const result = await promoteAcademicRecord(client, record, { academic_year: '2027', class: '8' });
  assert.equal(result.id, 43);
  assert.deepEqual(calls, [['promote_student_academic_record', {
    p_academic_record_id: 42, p_new_academic_year: 2027, p_new_class: 8,
    p_board: null, p_school_name: null, p_interested_subjects: null,
  }]]);
});

test('invalid and historical promotions never call the database', async () => {
  const client = { rpc: () => assert.fail('Unexpected mutation') };
  for (const fields of [{ academic_year: 2026, class: 8 }, { academic_year: 2027, class: 13 }, { academic_year: 2101, class: 8 }]) {
    await assert.rejects(promoteAcademicRecord(client, record, fields));
  }
  await assert.rejects(promoteAcademicRecord(client, { ...record, status: 'promoted' }, { academic_year: 2027, class: 8 }));
});

test('RPC errors are propagated instead of reporting success', async () => {
  await assert.rejects(promoteAcademicRecord({ rpc: async () => ({ error: new Error('Duplicate year') }) }, record, { academic_year: 2027, class: 8 }), /Duplicate year/);
});

test('corrections allowlist fields and guard against a concurrently closed record', async () => {
  const client = queryClient();
  await editAcademicRecord(client, record, { board: ' CBSE ', school_name: '', interested_subjects: ['Math'], class: 9, uid: 'changed' });
  const changes = client.calls.find(call => call[0] === 'update')[1];
  assert.deepEqual(Object.keys(changes).sort(), ['board', 'interested_subjects', 'school_name', 'updated_at']);
  assert.equal(changes.board, 'CBSE');
  assert.ok(client.calls.some(call => call[0] === 'eq' && call[1] === 'status' && call[2] === 'active'));
  await assert.rejects(editAcademicRecord(queryClient([[]]), record, { board: '', school_name: '', interested_subjects: [] }), /Record changed/);
});

test('closing preserves records and rejects unsupported status transitions', async () => {
  const client = queryClient();
  await closeAcademicRecord(client, record, 'withdrawn');
  const changes = client.calls.find(call => call[0] === 'update')[1];
  assert.equal(changes.status, 'withdrawn');
  assert.match(changes.completed_at, /^\d{4}-\d{2}-\d{2}$/);
  assert.throws(() => closeAcademicRecord(client, record, 'promoted'));
});

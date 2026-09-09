import { test } from 'node:test';
import assert from 'node:assert/strict';
import { updateAcademicUid, resetStudentPassword } from './studentAccounts.js';

test('UID correction updates only the selected academic record and preserves login identity', async () => {
  const calls = [];
  const query = {};
  for (const method of ['update', 'eq', 'select']) query[method] = (...args) => { calls.push([method, ...args]); return query; };
  query.single = async () => ({ data: { id: 42, uid: 'NEW' }, error: null });
  const client = { from: table => { assert.equal(table, 'student_academic_records'); return query; } };
  await updateAcademicUid(client, { academic_record_id: 42, student_id: 7, uid: 'OLD' }, ' NEW ');
  assert.deepEqual(Object.keys(calls[0][1]).sort(), ['uid', 'updated_at']);
  assert.equal(calls[0][1].uid, 'NEW');
  for (const filter of [['eq', 'id', 42], ['eq', 'student_id', 7], ['eq', 'uid', 'OLD']]) {
    assert.ok(calls.some(call => JSON.stringify(call) === JSON.stringify(filter)));
  }
});

test('password reset calls the admin function with student identity, not browser Auth update', async () => {
  const client = { functions: { invoke: async (name, { body }) => {
    assert.equal(name, 'update-student-password');
    assert.deepEqual(body, { studentId: 7, password: 'new-password' });
    return { data: { success: true }, error: null };
  } } };
  await resetStudentPassword(client, 7, 'new-password');
  await assert.rejects(resetStudentPassword(client, 7, 'short'), /6 characters/);
});

test('UID uniqueness and password authorization failures are surfaced', async () => {
  await assert.rejects(updateAcademicUid({}, {}, 'bad uid'), /without spaces/);
  const query = { update: () => query, eq: () => query, select: () => query,
    single: async () => ({ data: null, error: new Error('duplicate key') }) };
  await assert.rejects(updateAcademicUid({ from: () => query }, { uid: 'OLD' }, 'NEW'), /duplicate/);
  await assert.rejects(resetStudentPassword({ functions: { invoke: async () => ({
    error: { message: 'Forbidden', context: { json: async () => ({ error: 'Only active admins can change student passwords' }) } },
  }) } }, 7, 'new-password'), /Only active admins/);
});

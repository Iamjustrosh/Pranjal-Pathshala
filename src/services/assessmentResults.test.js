import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAssessment, loadStudentAssessmentResults, listResultStudents, listAssessments, loadAssessmentResults, saveAssessmentResult } from './assessmentResults.js';

const assessment = { id: 9, academic_year: 2025, class: 7, max_marks: 100 };
const record = { academic_record_id: 42, student_id: 7, academic_year: 2025, class: 7, uid: 'PP2507101', status: 'promoted' };

const newFields = { title: ' Algebra test ', subject: ' Mathematics ', assessment_type: 'test', assessment_date: '2026-09-09', max_marks: '50', academic_year: '2026', class: '8' };

test('createAssessment inserts published assessment with numeric academic scope and returns selected row', async () => {
  const client = clientFor();
  const from = client.from;
  const created = { id: 91, title: 'Algebra test', subject: 'Mathematics', assessment_type: 'test', assessment_date: '2026-09-09', max_marks: 50, academic_year: 2026, class: 8, status: 'published' };
  let selected = false;
  client.from = table => {
    const query = from(table);
    const select = query.select;
    query.select = fields => { selected = fields.includes('academic_year') && fields.includes('class'); return select(fields); };
    query.single = async () => { assert.equal(selected, true); return { data: created, error: null }; };
    return query;
  };
  assert.equal(await createAssessment(client, { ...newFields, student_id: 7, status: 'draft' }), created);
  const { id: _id, ...payload } = created;
  assert.deepEqual(client.calls.find(call => call[0] === 'insert')[1], payload);
  assert.deepEqual(client.calls.filter(call => call[0] === 'from'), [['from', 'assessments']]);
});

test('createAssessment validates title, type, date, maximum marks and academic scope before insert', async () => {
  for (const invalid of [
    { title: '' }, { title: '  ' }, { assessment_type: '' }, { assessment_type: 'exam' },
    { assessment_date: '' }, { assessment_date: '2026-02-30' }, { assessment_date: 'not-a-date' },
    { max_marks: '' }, { max_marks: 0 }, { max_marks: -1 }, { max_marks: Infinity }, { max_marks: 'invalid' },
    { academic_year: 1999 }, { academic_year: 2101 }, { academic_year: 2026.5 },
    { class: '' }, { class: 0 }, { class: 13 }, { class: 1.5 },
  ]) {
    const client = clientFor();
    await assert.rejects(createAssessment(client, { ...newFields, ...invalid }));
    assert.equal(client.calls.length, 0, JSON.stringify(invalid));
  }
});

test('createAssessment accepts quiz, leap day and positive fractional maximum marks', async () => {
  const client = clientFor();
  await createAssessment(client, { ...newFields, assessment_type: 'quiz', assessment_date: '2024-02-29', max_marks: '0.5', subject: '' });
  assert.equal(client.calls.find(call => call[0] === 'insert')[1].max_marks, 0.5);
  assert.equal(client.calls.find(call => call[0] === 'insert')[1].subject, null);
});

test('createAssessment propagates Supabase insert/RLS errors', async () => {
  const error = { code: '42501', message: 'new row violates row-level security policy' };
  const client = clientFor();
  const from = client.from;
  client.from = table => {
    const query = from(table);
    query.single = async () => ({ data: null, error });
    return query;
  };
  await assert.rejects(createAssessment(client, newFields), caught => caught === error);
});

test('new-result student selector uses academic IDs for the chosen scope', async () => {
  const client = clientFor({ student_academic_records: [
    { id: 42, student_id: 7, academic_year: 2025, class: 7, uid: 'OLD', status: 'promoted', students: { student_name: 'Student' } },
    { id: 43, student_id: 7, academic_year: 2026, class: 8, uid: 'NEW', status: 'active', students: { student_name: 'Student' } },
  ] });
  const rows = await listResultStudents(client, { year: '2026', classNumber: '8' });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].academic_record_id, 43);
  assert.equal(rows[0].student_id, 7);
  assert.equal(rows[0].uid, 'NEW');
});

test('all classes roster includes only the selected year and creates an assessment for the chosen student class', async () => {
  const client = clientFor({ student_academic_records: [
    { id: 42, student_id: 7, academic_year: 2026, class: 7, uid: 'SEVEN', students: { student_name: 'First' } },
    { id: 43, student_id: 8, academic_year: 2026, class: 8, uid: 'EIGHT', students: { student_name: 'Second' } },
    { id: 44, student_id: 8, academic_year: 2025, class: 7, uid: 'OLD', students: { student_name: 'Second' } },
  ] });
  const rows = await listResultStudents(client, { year: '2026', classNumber: '' });
  assert.deepEqual(rows.map(row => row.academic_record_id), [42, 43]);
  assert.ok(!client.calls.some(call => call[0] === 'eq' && call[1] === 'class'));
  await createAssessment(client, { ...newFields, class: rows[0].class });
  assert.equal(client.calls.find(call => call[0] === 'insert')[1].class, 7);
});

function clientFor(tables = {}) {
  const calls = [];
  return { calls, from(table) {
    calls.push(['from', table]);
    const query = {};
    const filters = [];
    for (const method of ['select', 'eq', 'is', 'order', 'update', 'insert']) {
      query[method] = (...args) => { calls.push([method, ...args]); return query; };
    }
    query.eq = (field, value) => { calls.push(['eq', field, value]); filters.push([field, value]); return query; };
    query.range = async (start, end) => ({ data: (tables[table] || [])
      .filter(row => filters.every(([field, value]) => String(row[field]) === String(value)))
      .slice(start, end + 1), error: null });
    query.limit = async () => ({ data: tables[table] || [], error: null });
    query.single = async () => ({ data: { id: 88 }, error: null });
    return query;
  } };
}

test('assessment list is scoped by academic year/class and paginated', async () => {
  const client = clientFor({ assessments: Array.from({ length: 501 }, (_, id) => ({ id, academic_year: 2025, class: 7 })) });
  assert.equal((await listAssessments(client, { year: '2025', classNumber: '7' })).length, 501);
  assert.ok(client.calls.some(call => JSON.stringify(call) === JSON.stringify(['eq', 'academic_year', 2025])));
  assert.ok(client.calls.some(call => JSON.stringify(call) === JSON.stringify(['eq', 'class', 7])));
});

test('historical results join academic record IDs, including promoted records, rather than permanent student IDs', async () => {
  const result = { id: 88, assessment_id: 9, student_academic_record_id: 42, marks_obtained: 0, max_marks: 100, status: 'graded' };
  const client = clientFor({
    student_academic_records: [
      { id: 42, student_id: 7, academic_year: 2025, class: 7, uid: record.uid, status: 'promoted', students: { student_name: 'Student' } },
      { id: 43, student_id: 8, academic_year: 2025, class: 7, uid: 'PP2507102', status: 'completed', students: { student_name: 'Second' } },
    ], assessment_results: [result],
  });
  const rows = await loadAssessmentResults(client, assessment);
  assert.equal(rows[0].result, result);
  assert.equal(rows[0].uid, record.uid);
  assert.equal(rows[1].result, null);
  assert.ok(!client.calls.some(call => call[0] === 'eq' && call[1] === 'status'));
});

test('unresolved historical links block editing instead of silently hiding results', async () => {
  const client = clientFor({ assessment_results: [{ assessment_id: 9, student_academic_record_id: 99 }] });
  await assert.rejects(loadAssessmentResults(client, assessment), /do not resolve/);
});

test('new scores write academic identity, accept zero and never mutate student identity', async () => {
  const client = clientFor();
  await saveAssessmentResult(client, assessment, record, { marks: '0', maxMarks: '100' });
  assert.deepEqual(client.calls.find(call => call[0] === 'insert')[1], {
    marks_obtained: 0, max_marks: 100, status: 'graded', assessment_id: 9, student_academic_record_id: 42,
  });
  assert.ok(client.calls.filter(call => call[0] === 'from').every(call => call[1] === 'assessment_results'));
});

test('editing pins the original academic record and checks previous score for concurrent changes', async () => {
  const client = clientFor();
  await saveAssessmentResult(client, assessment, { ...record, result: { id: 88, assessment_id: 9, student_academic_record_id: 42, marks_obtained: null, max_marks: 100, status: 'pending' } }, { marks: '75', maxMarks: '100' });
  for (const expected of [['eq', 'id', 88], ['eq', 'student_academic_record_id', 42], ['eq', 'assessment_id', 9], ['is', 'marks_obtained', null], ['eq', 'status', 'pending']]) {
    assert.ok(client.calls.some(call => JSON.stringify(call) === JSON.stringify(expected)));
  }
});

test('wrong-year/class records and invalid scores are rejected before writes', async () => {
  for (const row of [{ ...record, academic_year: 2026 }, { ...record, class: 8 }]) {
    await assert.rejects(saveAssessmentResult(clientFor(), assessment, row, { marks: '10', maxMarks: '100' }), /year and class/);
  }
  for (const [marks, maxMarks] of [['', '100'], ['-1', '100'], ['101', '100'], ['1', '0'], ['Infinity', '100']]) {
    const client = clientFor();
    await assert.rejects(saveAssessmentResult(client, assessment, record, { marks, maxMarks }), /score/);
    assert.equal(client.calls.length, 0);
  }
});

test('a newly discovered result is not overwritten by a stale add form', async () => {
  const client = clientFor({ assessment_results: [{ id: 88 }] });
  await assert.rejects(saveAssessmentResult(client, assessment, record, { marks: '10', maxMarks: '100' }), /already exists/);
  assert.ok(!client.calls.some(call => ['insert', 'update'].includes(call[0])));
});

test('optional subject filter combines with year and class, while all classes remains supported', async () => {
  const client = clientFor({ assessments: [
    { id: 1, academic_year: 2025, class: 7, subject: 'Math' },
    { id: 2, academic_year: 2025, class: 7, subject: 'Science' },
    { id: 3, academic_year: 2026, class: 7, subject: 'Math' },
    { id: 4, academic_year: 2025, class: 8, subject: 'Math' },
  ] });
  assert.deepEqual((await listAssessments(client, { year: '2025', classNumber: '7', subject: 'Math' })).map(row => row.id), [1]);
  assert.deepEqual((await listAssessments(client, { year: '2025', classNumber: '', subject: 'Math' })).map(row => row.id), [1, 4]);
  assert.deepEqual((await listAssessments(client, { year: '2025', classNumber: '7' })).map(row => row.id), [1, 2]);
});

test('roster isolates year/class and matches both result keys, preserving missing profiles/results', async () => {
  const result = { id: 88, assessment_id: 9, student_academic_record_id: 42, marks_obtained: 50, max_marks: 100, status: 'graded' };
  const client = clientFor({
    student_academic_records: [
      { id: 42, student_id: 7, academic_year: 2025, class: 7, uid: record.uid, status: 'promoted', students: [{ student_name: 'Student' }] },
      { id: 43, student_id: 7, academic_year: 2026, class: 8, uid: 'NEW-UID', status: 'active', students: { student_name: 'Student' } },
      { id: 44, student_id: 8, academic_year: 2025, class: 8, uid: 'OTHER-CLASS', status: 'active', students: { student_name: 'Second' } },
      { id: 45, student_id: 9, academic_year: 2025, class: 7, uid: 'HIDDEN-PROFILE', status: 'withdrawn', students: null },
    ],
    assessment_results: [result, { ...result, id: 89, assessment_id: 10, marks_obtained: 90 }],
  });
  assert.deepEqual(await loadAssessmentResults(client, assessment), [
    { academic_record_id: 42, student_id: 7, student_name: 'Student', uid: record.uid, class: 7, academic_year: 2025, status: 'promoted', result },
    { academic_record_id: 45, student_id: 9, student_name: '', uid: 'HIDDEN-PROFILE', class: 7, academic_year: 2025, status: 'withdrawn', result: null },
  ]);
  assert.ok(client.calls.some(call => call[0] === 'select' && call[1].includes('students(student_name)')));
});

test('missing assessment scope is rejected before an unscoped roster query or write', async () => {
  for (const invalid of [null, { id: 9 }, { ...assessment, class: null }, { ...assessment, academic_year: '' }]) {
    const client = clientFor();
    await assert.rejects(loadAssessmentResults(client, invalid), /valid/);
    await assert.rejects(saveAssessmentResult(client, invalid, record, { marks: '10', maxMarks: '100' }), /valid/);
    assert.equal(client.calls.length, 0);
  }
});

test('query relationship errors reach the existing ResultsManager error handler', async () => {
  const client = clientFor();
  const from = client.from;
  const error = { code: 'PGRST200', message: 'Could not find a relationship between student_academic_records and students' };
  client.from = table => {
    const query = from(table);
    if (table === 'student_academic_records') query.range = async () => ({ data: null, error });
    return query;
  };
  await assert.rejects(loadAssessmentResults(client, assessment), caught => caught === error);
});


test('student assessment list loads the full academic year/class and matches results by academic record', async () => {
  const result = { id: 90, assessment_id: 1, student_academic_record_id: 42, marks_obtained: 0 };
  const client = clientFor({ assessments: [
    { id: 1, academic_year: 2025, class: 7 },
    { id: 2, academic_year: 2025, class: 7 },
    { id: 3, academic_year: 2026, class: 8 },
    { id: 4, academic_year: 2025, class: 8 },
  ], assessment_results: [result, { id: 91, assessment_id: 2, student_academic_record_id: 43, marks_obtained: 99 }] });
  const rows = await loadStudentAssessmentResults(client, record);
  assert.deepEqual(rows.map(row => row.assessment.id), [1, 2]);
  assert.equal(rows[0].result, result);
  assert.equal(rows[1].result, null);
});

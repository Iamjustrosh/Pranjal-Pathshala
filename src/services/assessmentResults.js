import { academicRow } from './academicRecords.js';

const assessmentFields = 'id, title, subject, assessment_type, assessment_date, max_marks, status, academic_year, class';

export async function createAssessment(client, fields) {
  requireScope(fields.academic_year, fields.class, true);
  const title = String(fields.title ?? '').trim();
  if (!title) throw new Error('Assessment title is required.');
  if (!['quiz', 'test'].includes(fields.assessment_type)) throw new Error('Choose quiz or test as the assessment type.');
  const date = fields.assessment_date;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error('A valid assessment date is required.');
  }
  const max = Number(fields.max_marks);
  if (!Number.isFinite(max) || max <= 0) throw new Error('Maximum marks must be greater than zero.');
  const { data, error } = await client.from('assessments').insert({
    title, subject: String(fields.subject ?? '').trim() || null,
    assessment_type: fields.assessment_type, assessment_date: date, max_marks: max,
    academic_year: Number(fields.academic_year), class: Number(fields.class), status: 'published',
  }).select(assessmentFields).single();
  if (error) throw error;
  if (!data) throw new Error('The created assessment could not be read. Check Review & Update before retrying.');
  return data;
}

export async function listResultStudents(client, { year, classNumber }) {
  requireScope(year, classNumber);
  const records = await allRows(() => {
    let query = client.from('student_academic_records')
    .select('id, student_id, uid, class, academic_year, status, students(student_name)')
    .eq('academic_year', Number(year)).order('class').order('id');
    if (classNumber) query = query.eq('class', Number(classNumber));
    return query;
  });
  return records.map(record => {
    const { academic_record_id, student_id, student_name, uid, class: academicClass, academic_year, status } = academicRow(record);
    return { academic_record_id, student_id, student_name, uid, class: academicClass, academic_year, status };
  });
}

function requireScope(year, classNumber, requireClass = false) {
  if (!Number.isInteger(Number(year)) || Number(year) < 2000 || Number(year) > 2100) {
    throw new Error('Select a valid academic year before loading results.');
  }
  const hasClass = classNumber != null && classNumber !== '';
  if ((requireClass && !hasClass) || (hasClass &&
      (!Number.isInteger(Number(classNumber)) || Number(classNumber) < 1 || Number(classNumber) > 12))) {
    throw new Error('Select a valid assessment class before loading results.');
  }
}

async function allRows(makeQuery) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await makeQuery().range(offset, offset + 499);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 500) return rows;
  }
}

export function listAssessments(client, { year, classNumber, subject }) {
  requireScope(year, classNumber);
  return allRows(() => {
    let query = client.from('assessments')
      .select(assessmentFields)
      .eq('academic_year', Number(year)).order('assessment_date', { ascending: false }).order('id');
    if (classNumber) query = query.eq('class', Number(classNumber));
    if (subject != null && subject !== '') query = query.eq('subject', subject);
    return query;
  });
}

export async function loadAssessmentResults(client, assessment) {
  requireScope(assessment?.academic_year, assessment?.class, true);
  if (!assessment?.id) throw new Error('Select an assessment before loading results.');
  const [records, results] = await Promise.all([
    // A left embed preserves every academic record, even if student RLS hides
    // its permanent profile. Never restrict historical rosters to active status.
    listResultStudents(client, { year: assessment.academic_year, classNumber: assessment.class }),
    allRows(() => client.from('assessment_results')
      .select('id, assessment_id, student_academic_record_id, marks_obtained, max_marks, status')
      .eq('assessment_id', assessment.id).order('id')),
  ]);
  const byRecord = new Map();
  for (const result of results) {
    const key = String(result.student_academic_record_id);
    if (byRecord.has(key)) throw new Error('Duplicate results exist for an academic record. Resolve these before editing.');
    byRecord.set(key, result);
  }
  const recordIds = new Set(records.map(record => String(record.academic_record_id)));
  if (results.some(result => !recordIds.has(String(result.student_academic_record_id)))) {
    throw new Error('Some results do not resolve to this assessment’s year/class roster. Check academic links and access permissions before editing.');
  }
  return records.map(record => {
    const { academic_record_id, student_id, student_name, uid, class: classNumber, academic_year, status } = record;
    return { academic_record_id, student_id, student_name, uid, class: classNumber, academic_year, status,
      result: byRecord.get(String(academic_record_id)) ?? null };
  });
}

export async function loadStudentAssessmentResults(client, record) {
  requireScope(record?.academic_year, record?.class, true);
  if (!record?.academic_record_id) throw new Error('Select a student academic record.');
  const [assessments, results] = await Promise.all([
    listAssessments(client, { year: record.academic_year, classNumber: record.class }),
    allRows(() => client.from('assessment_results')
      .select('id, assessment_id, student_academic_record_id, marks_obtained, max_marks, status')
      .eq('student_academic_record_id', record.academic_record_id).order('id')),
  ]);
  const byAssessment = new Map();
  for (const result of results) {
    const key = String(result.assessment_id);
    if (byAssessment.has(key)) throw new Error('Duplicate results exist for this academic record and assessment.');
    byAssessment.set(key, result);
  }
  return assessments.map(assessment => ({ assessment, result: byAssessment.get(String(assessment.id)) ?? null }));
}

export async function saveAssessmentResult(client, assessment, row, fields) {
  requireScope(assessment?.academic_year, assessment?.class, true);
  if (!row.academic_record_id || !assessment.id ||
      Number(row.academic_year) !== Number(assessment.academic_year) ||
      Number(row.class) !== Number(assessment.class)) {
    throw new Error('The academic record must belong to the assessment’s year and class.');
  }
  const marks = Number(fields.marks);
  const max = Number(fields.maxMarks);
  if (String(fields.marks ?? '').trim() === '' || String(fields.maxMarks ?? '').trim() === '' ||
      !Number.isFinite(marks) || !Number.isFinite(max) || max <= 0 || marks < 0 || marks > max) {
    throw new Error('Enter a score from zero to the maximum, and a maximum greater than zero.');
  }
  const changes = { marks_obtained: marks, max_marks: max, status: 'graded' };
  let query;
  if (row.result) {
    if (String(row.result.student_academic_record_id) !== String(row.academic_record_id) ||
        String(row.result.assessment_id) !== String(assessment.id)) {
      throw new Error('The result does not belong to this academic record and assessment.');
    }
    query = client.from('assessment_results').update(changes)
      .eq('id', row.result.id).eq('assessment_id', assessment.id)
      .eq('student_academic_record_id', row.academic_record_id);
    // Refuse to overwrite a result changed by another admin since it was loaded.
    for (const field of ['marks_obtained', 'max_marks', 'status']) {
      query = row.result[field] == null ? query.is(field, null) : query.eq(field, row.result[field]);
    }
  } else {
    // Insert, never upsert: a concurrent/newly discovered result must not be overwritten.
    const { data, error } = await client.from('assessment_results').select('id')
      .eq('assessment_id', assessment.id).eq('student_academic_record_id', row.academic_record_id).limit(1);
    if (error) throw error;
    if (data.length) throw new Error('A result already exists. Refresh before editing it.');
    query = client.from('assessment_results').insert({ ...changes,
      assessment_id: assessment.id, student_academic_record_id: row.academic_record_id,
    });
  }
  const { data, error } = await query.select('id').single();
  if (error) throw error;
  if (!data) throw new Error('The result changed or access was denied. Refresh before retrying.');
  return data;
}

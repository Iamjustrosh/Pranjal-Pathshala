export const ACADEMIC_STATUSES = ['active', 'promoted', 'completed', 'withdrawn'];
const academicFields = 'id, student_id, uid, academic_year, class, board, school_name, interested_subjects, status, promoted_from_id, enrolled_at, completed_at';
// Use the referenced table name; PostgREST resolves the existing student_id FK.
const joinedFields = `${academicFields}, students!inner(student_name, photo_url, contact_number, parent_contact_number, email)`;

export function academicRow(record) {
  const student = Array.isArray(record.students) ? record.students[0] : record.students;
  return {
    academic_record_id: record.id,
    student_id: record.student_id,
    uid: record.uid,
    academic_year: record.academic_year,
    class: record.class,
    board: record.board,
    school_name: record.school_name,
    interested_subjects: record.interested_subjects ?? [],
    status: record.status,
    promoted_from_id: record.promoted_from_id,
    enrolled_at: record.enrolled_at,
    completed_at: record.completed_at,
    student_name: student?.student_name ?? '',
    photo_url: student?.photo_url ?? null,
    contact_number: student?.contact_number ?? null,
    parent_contact_number: student?.parent_contact_number ?? null,
    email: student?.email ?? null,
  };
}

async function allRows(makeQuery) {
  const rows = [];
  // Avoid silently truncating the roster/history at the API's row limit.
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await makeQuery().range(offset, offset + pageSize - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}

export async function listAcademicRecords(client, { year, classNumber, status }) {
  const rows = await allRows(() => {
    let query = client.from('student_academic_records').select(joinedFields)
      .order('academic_year', { ascending: false }).order('class').order('id');
    if (year) query = query.eq('academic_year', Number(year));
    if (classNumber) query = query.eq('class', Number(classNumber));
    if (status) query = query.eq('status', status);
    return query;
  });
  return rows.map(academicRow);
}

export function searchAcademicRecords(rows, search) {
  const term = search.trim().toLocaleLowerCase();
  return rows.filter(row => [row.student_name, row.uid].some(value =>
    (value || '').toLocaleLowerCase().includes(term)));
}

export async function academicHistory(client, studentId) {
  const rows = await allRows(() => client.from('student_academic_records')
    .select(academicFields).eq('student_id', studentId)
    .order('academic_year', { ascending: false }).order('id'));
  return rows.map(academicRow);
}

function requireActive(record) {
  if (record.status !== 'active') throw new Error('Only active academic records can be changed.');
}

async function updateActive(client, record, changes) {
  requireActive(record);
  const { data, error } = await client.from('student_academic_records')
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq('id', record.academic_record_id).eq('student_id', record.student_id)
    .eq('status', 'active').select('id').single();
  if (error) throw error;
  if (!data) throw new Error('Record changed or access was denied. Refresh and try again.');
}

export function editAcademicRecord(client, record, fields) {
  // Explicit allowlist: identity and promotion links can never be edited here.
  return updateActive(client, record, {
    board: fields.board.trim() || null,
    school_name: fields.school_name.trim() || null,
    interested_subjects: fields.interested_subjects,
  });
}

export function closeAcademicRecord(client, record, status) {
  if (!['completed', 'withdrawn'].includes(status)) throw new Error('Invalid closing status.');
  return updateActive(client, record, {
    status,
    completed_at: new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date()),
  });
}

export async function promoteAcademicRecord(client, record, fields) {
  requireActive(record);
  const year = Number(fields.academic_year);
  const classNumber = Number(fields.class);
  if (!Number.isInteger(year) || year < 2000 || year > 2100 || year <= record.academic_year) {
    throw new Error('Choose an academic year after this record’s year, between 2000 and 2100.');
  }
  if (!Number.isInteger(classNumber) || classNumber < 1 || classNumber > 12) {
    throw new Error('Class must be between 1 and 12.');
  }
  const { data, error } = await client.rpc('promote_student_academic_record', {
    p_academic_record_id: record.academic_record_id,
    p_new_academic_year: year,
    p_new_class: classNumber,
    p_board: fields.board ?? null,
    p_school_name: fields.school_name ?? null,
    p_interested_subjects: fields.interested_subjects ?? null,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

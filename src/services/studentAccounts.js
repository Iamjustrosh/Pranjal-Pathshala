export async function updateAcademicUid(client, record, uid) {
  const value = String(uid ?? '').trim();
  if (!value || /\s/.test(value)) throw new Error('Enter an academic UID without spaces.');
  const { data, error } = await client.from('student_academic_records')
    .update({ uid: value, updated_at: new Date().toISOString() })
    .eq('id', record.academic_record_id).eq('student_id', record.student_id)
    .eq('uid', record.uid).select('id, uid').single();
  if (error) throw error;
  if (!data) throw new Error('The academic record changed or access was denied. Refresh before retrying.');
  return data;
}

export async function resetStudentPassword(client, studentId, password) {
  if (typeof password !== 'string' || password.length < 6) throw new Error('Password must contain at least 6 characters.');
  const { data, error } = await client.functions.invoke('update-student-password', {
    body: { studentId, password },
  });
  if (error) {
    let message = error.message;
    try {
      const body = await error.context?.json();
      message = body?.error || message;
    } catch { /* Keep the transport error if no JSON response is available. */ }
    throw new Error(message || 'Unable to change password.');
  }
  if (!data?.success) throw new Error(data?.error || 'Unable to change password.');
}

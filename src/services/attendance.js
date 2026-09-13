function requireScope(year, classNumber) {
  const academicYear = Number(year);
  const academicClass = Number(classNumber);

  if (!Number.isInteger(academicYear)) {
    throw new Error('A valid academic year is required.');
  }

  if (
    !Number.isInteger(academicClass) ||
    academicClass < 1 ||
    academicClass > 12
  ) {
    throw new Error('A valid class is required.');
  }

  return {
    academicYear,
    academicClass,
  };
}

export async function listAttendanceStudents(
  client,
  { year, classNumber }
) {
  const { academicYear, academicClass } = requireScope(
    year,
    classNumber
  );

  const { data, error } = await client
    .from('student_academic_records')
    .select(`
      id,
      student_id,
      uid,
      academic_year,
      class,
      status,
      students (
        student_name
      )
    `)
    .eq('academic_year', academicYear)
    .eq('class', academicClass)
    .order('uid');

  if (error) {
    throw error;
  }

  return (data ?? []).map((record) => ({
    academicRecordId: record.id,
    studentId: record.student_id,
    studentName: record.students?.student_name ?? 'Unknown Student',
    uid: record.uid,
    academicYear: record.academic_year,
    class: record.class,
    academicStatus: record.status,
  }));
}

export async function loadMonthlyAttendance(
  client,
  {
    year,
    classNumber,
    month,
  }
) {
  const { academicYear, academicClass } = requireScope(
    year,
    classNumber
  );

  const monthNumber = Number(month);

  if (
    !Number.isInteger(monthNumber) ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    throw new Error('A valid month is required.');
  }

  const students = await listAttendanceStudents(client, {
    year: academicYear,
    classNumber: academicClass,
  });

  if (students.length === 0) {
    return {
      scope: {
        academicYear,
        class: academicClass,
        month: monthNumber,
      },
      students: [],
      attendance: [],
    };
  }

  const firstDate =
    `${academicYear}-${String(monthNumber).padStart(2, '0')}-01`;

  const lastDay = new Date(
    academicYear,
    monthNumber,
    0
  ).getDate();

  const lastDate =
    `${academicYear}-${String(monthNumber).padStart(2, '0')}-${String(
      lastDay
    ).padStart(2, '0')}`;

  const academicRecordIds = students.map(
    (student) => student.academicRecordId
  );

  const { data, error } = await client
    .from('attendance')
    .select(`
      id,
      student_academic_record_id,
      attendance_date,
      status,
      remarks,
      marked_by,
      created_at,
      updated_at
    `)
    .in(
      'student_academic_record_id',
      academicRecordIds
    )
    .gte('attendance_date', firstDate)
    .lte('attendance_date', lastDate)
    .order('attendance_date');

  if (error) {
    throw error;
  }

  return {
    scope: {
      academicYear,
      class: academicClass,
      month: monthNumber,
    },

    students,

    attendance: (data ?? []).map((row) => ({
      id: row.id,
      academicRecordId:
        row.student_academic_record_id,
      date: row.attendance_date,
      status: row.status,
      remarks: row.remarks,
      markedBy: row.marked_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  };
}


export async function saveAttendance(
  client,
  {
    academicRecordId,
    date,
    status,
    remarks = null,
  }
) {
  const allowedStatuses = [
    'present',
    'absent',
    'late',
    'leave',
  ];

  if (!academicRecordId) {
    throw new Error(
      'Academic record is required.'
    );
  }

  if (!date) {
    throw new Error(
      'Attendance date is required.'
    );
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      'Invalid attendance status.'
    );
  }

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      'You must be signed in to mark attendance.'
    );
  }

  const payload = {
    student_academic_record_id:
      Number(academicRecordId),

    attendance_date: date,
    status,

    remarks:
      remarks?.trim() || null,

    marked_by: user.id,

    updated_at:
      new Date().toISOString(),
  };

  const { data, error } = await client
    .from('attendance')
    .upsert(payload, {
      onConflict:
        'student_academic_record_id,attendance_date',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function clearAttendance(
  client,
  {
    academicRecordId,
    date,
  }
) {
  if (!academicRecordId || !date) {
    throw new Error(
      'Academic record and date are required.'
    );
  }

  const { error } = await client
    .from('attendance')
    .delete()
    .eq(
      'student_academic_record_id',
      Number(academicRecordId)
    )
    .eq('attendance_date', date);

  if (error) {
    throw error;
  }
}


export async function saveBulkAttendance(
  client,
  {
    academicRecordIds,
    date,
    status,
  }
) {
  const allowedStatuses = [
    'present',
    'absent',
    'late',
    'leave',
  ];

  if (
    !Array.isArray(academicRecordIds) ||
    academicRecordIds.length === 0
  ) {
    throw new Error(
      'At least one academic record is required.'
    );
  }

  if (!date) {
    throw new Error(
      'Attendance date is required.'
    );
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      'Invalid attendance status.'
    );
  }

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      'You must be signed in to mark attendance.'
    );
  }

  const now = new Date().toISOString();

  const rows = academicRecordIds.map(
    (academicRecordId) => ({
      student_academic_record_id:
        Number(academicRecordId),

      attendance_date: date,

      status,

      remarks: null,

      marked_by: user.id,

      updated_at: now,
    })
  );

  const { data, error } = await client
    .from('attendance')
    .upsert(rows, {
      onConflict:
        'student_academic_record_id,attendance_date',
    })
    .select();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function clearBulkAttendance(
  client,
  {
    academicRecordIds,
    date,
  }
) {
  if (
    !Array.isArray(academicRecordIds) ||
    academicRecordIds.length === 0
  ) {
    throw new Error(
      'At least one academic record is required.'
    );
  }

  if (!date) {
    throw new Error(
      'Attendance date is required.'
    );
  }

  const { error } = await client
    .from('attendance')
    .delete()
    .in(
      'student_academic_record_id',
      academicRecordIds.map(Number)
    )
    .eq('attendance_date', date);

  if (error) {
    throw error;
  }
}

export async function loadStudentAttendance(
  client,
  {
    academicRecordId,
    year,
    month,
  }
) {
  const recordId = Number(academicRecordId);
  const academicYear = Number(year);

  if (!Number.isInteger(recordId)) {
    throw new Error(
      'A valid academic record is required.'
    );
  }

  if (!Number.isInteger(academicYear)) {
    throw new Error(
      'A valid academic year is required.'
    );
  }

  let query = client
    .from('attendance')
    .select(`
      id,
      student_academic_record_id,
      attendance_date,
      status,
      remarks,
      created_at,
      updated_at
    `)
    .eq(
      'student_academic_record_id',
      recordId
    )
    .order('attendance_date', {
      ascending: false,
    });

  if (month != null) {
    const monthNumber = Number(month);

    if (
      !Number.isInteger(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12
    ) {
      throw new Error(
        'A valid month is required.'
      );
    }

    const firstDate =
      `${academicYear}-${String(
        monthNumber
      ).padStart(2, '0')}-01`;

    const lastDay = new Date(
      academicYear,
      monthNumber,
      0
    ).getDate();

    const lastDate =
      `${academicYear}-${String(
        monthNumber
      ).padStart(2, '0')}-${String(
        lastDay
      ).padStart(2, '0')}`;

    query = query
      .gte(
        'attendance_date',
        firstDate
      )
      .lte(
        'attendance_date',
        lastDate
      );
  }

  const { data, error } =
    await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (row) => ({
      id: row.id,

      academicRecordId:
        row.student_academic_record_id,

      date: row.attendance_date,
      status: row.status,
      remarks: row.remarks,

      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })
  );
}
export function calculateClassAnalytics(dataset) {
  const students = dataset?.students ?? [];
  const assessments = dataset?.assessments ?? [];
  const results = dataset?.results ?? [];

  const validResults = results.filter((result) => {
    const marks = Number(result.marks);
    const maxMarks = Number(result.maxMarks);

    return (
      Number.isFinite(marks) &&
      Number.isFinite(maxMarks) &&
      maxMarks > 0 &&
      marks >= 0 &&
      marks <= maxMarks
    );
  });

  const totalMarksObtained = validResults.reduce(
    (sum, result) => sum + Number(result.marks),
    0
  );

  const totalMaxMarks = validResults.reduce(
    (sum, result) => sum + Number(result.maxMarks),
    0
  );

  const overallPercentage =
    totalMaxMarks > 0
      ? (totalMarksObtained / totalMaxMarks) * 100
      : 0;

  const studentsWithResults = new Set(
    validResults.map((result) =>
      String(result.academicRecordId)
    )
  ).size;

  return {
    studentCount: students.length,
    assessmentCount: assessments.length,
    gradedResultCount: validResults.length,
    studentsWithResults,

    totalMarksObtained,
    totalMaxMarks,

    overallPercentage: Number(
      overallPercentage.toFixed(2)
    ),
  };
}

export function calculateAssessmentTypeAnalytics(dataset) {
  const results = dataset?.results ?? [];

  const groups = new Map();

  for (const result of results) {
    const type = result.assessmentType;

    if (!['test', 'quiz'].includes(type)) {
      continue;
    }

    const marks = Number(result.marks);
    const maxMarks = Number(result.maxMarks);

    if (
      !Number.isFinite(marks) ||
      !Number.isFinite(maxMarks) ||
      maxMarks <= 0 ||
      marks < 0 ||
      marks > maxMarks
    ) {
      continue;
    }

    if (!groups.has(type)) {
      groups.set(type, {
        type,
        gradedResultCount: 0,
        assessmentIds: new Set(),
        studentIds: new Set(),
        totalMarksObtained: 0,
        totalMaxMarks: 0,
      });
    }

    const group = groups.get(type);

    group.gradedResultCount += 1;
    group.assessmentIds.add(String(result.assessmentId));
    group.studentIds.add(String(result.academicRecordId));
    group.totalMarksObtained += marks;
    group.totalMaxMarks += maxMarks;
  }

  return ['test', 'quiz'].map((type) => {
    const group = groups.get(type);

    if (!group) {
      return {
        type,
        assessmentCount: 0,
        gradedResultCount: 0,
        studentCount: 0,
        totalMarksObtained: 0,
        totalMaxMarks: 0,
        percentage: 0,
      };
    }

    return {
      type,
      assessmentCount: group.assessmentIds.size,
      gradedResultCount: group.gradedResultCount,
      studentCount: group.studentIds.size,
      totalMarksObtained: group.totalMarksObtained,
      totalMaxMarks: group.totalMaxMarks,

      percentage:
        group.totalMaxMarks > 0
          ? Number(
              (
                (group.totalMarksObtained /
                  group.totalMaxMarks) *
                100
              ).toFixed(2)
            )
          : 0,
    };
  });
}


export function calculateSubjectAnalytics(dataset) {
  const results = dataset?.results ?? [];

  const groups = new Map();

  for (const result of results) {
    const subject = result.subject?.trim();

    if (!subject) {
      continue;
    }

    const marks = Number(result.marks);
    const maxMarks = Number(result.maxMarks);

    if (
      !Number.isFinite(marks) ||
      !Number.isFinite(maxMarks) ||
      maxMarks <= 0 ||
      marks < 0 ||
      marks > maxMarks
    ) {
      continue;
    }

    if (!groups.has(subject)) {
      groups.set(subject, {
        subject,
        assessmentIds: new Set(),
        studentIds: new Set(),
        gradedResultCount: 0,
        totalMarksObtained: 0,
        totalMaxMarks: 0,
      });
    }

    const group = groups.get(subject);

    group.assessmentIds.add(String(result.assessmentId));
    group.studentIds.add(String(result.academicRecordId));
    group.gradedResultCount += 1;
    group.totalMarksObtained += marks;
    group.totalMaxMarks += maxMarks;
  }

  return Array.from(groups.values())
    .map((group) => ({
      subject: group.subject,
      assessmentCount: group.assessmentIds.size,
      gradedResultCount: group.gradedResultCount,
      studentCount: group.studentIds.size,
      totalMarksObtained: group.totalMarksObtained,
      totalMaxMarks: group.totalMaxMarks,
      percentage:
        group.totalMaxMarks > 0
          ? Number(
              (
                (group.totalMarksObtained /
                  group.totalMaxMarks) *
                100
              ).toFixed(2)
            )
          : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

export function calculateStudentRanking(dataset) {
  const students = dataset?.students ?? [];
  const results = dataset?.results ?? [];

  const groups = new Map();

  // Include every student in the selected academic roster,
  // including students who do not yet have graded results.
  for (const student of students) {
    groups.set(String(student.academic_record_id), {
      academicRecordId: student.academic_record_id,
      studentId: student.student_id,
      studentName: student.student_name,
      uid: student.uid,
      academicStatus: student.status,

      assessmentIds: new Set(),
      gradedResultCount: 0,
      totalMarksObtained: 0,
      totalMaxMarks: 0,
    });
  }

  for (const result of results) {
    const key = String(result.academicRecordId);
    const group = groups.get(key);

    if (!group) {
      continue;
    }

    const marks = Number(result.marks);
    const maxMarks = Number(result.maxMarks);

    if (
      !Number.isFinite(marks) ||
      !Number.isFinite(maxMarks) ||
      maxMarks <= 0 ||
      marks < 0 ||
      marks > maxMarks
    ) {
      continue;
    }

    group.assessmentIds.add(String(result.assessmentId));
    group.gradedResultCount += 1;
    group.totalMarksObtained += marks;
    group.totalMaxMarks += maxMarks;
  }

  const ranked = Array.from(groups.values())
    .map((group) => ({
      academicRecordId: group.academicRecordId,
      studentId: group.studentId,
      studentName: group.studentName,
      uid: group.uid,
      academicStatus: group.academicStatus,

      assessmentCount: group.assessmentIds.size,
      gradedResultCount: group.gradedResultCount,
      totalMarksObtained: group.totalMarksObtained,
      totalMaxMarks: group.totalMaxMarks,

      percentage:
        group.totalMaxMarks > 0
          ? Number(
              (
                (group.totalMarksObtained /
                  group.totalMaxMarks) *
                100
              ).toFixed(2)
            )
          : null,

      rank: null,
    }))
    .sort((a, b) => {
      // Students with results come before students without results.
      if (a.percentage == null && b.percentage == null) {
        return String(a.studentName ?? '').localeCompare(
          String(b.studentName ?? '')
        );
      }

      if (a.percentage == null) return 1;
      if (b.percentage == null) return -1;

      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }

      return String(a.studentName ?? '').localeCompare(
        String(b.studentName ?? '')
      );
    });

  // Competition ranking:
  // 1, 2, 2, 4
  let previousPercentage = null;
  let previousRank = 0;

  return ranked.map((student, index) => {
    if (student.percentage == null) {
      return student;
    }

    const rank =
      previousPercentage !== null &&
      student.percentage === previousPercentage
        ? previousRank
        : index + 1;

    previousPercentage = student.percentage;
    previousRank = rank;

    return {
      ...student,
      rank,
    };
  });
}

export function calculateAssessmentAnalytics(dataset) {
  const assessments = dataset?.assessments ?? [];
  const results = dataset?.results ?? [];

  const groups = new Map();

  // Include every published assessment, even when it has no graded results.
  for (const assessment of assessments) {
    groups.set(String(assessment.id), {
      assessmentId: assessment.id,
      title: assessment.title,
      subject: assessment.subject?.trim() || null,
      assessmentType: assessment.assessment_type,
      assessmentDate: assessment.assessment_date,
      assessmentMaxMarks: Number(assessment.max_marks),

      studentIds: new Set(),
      gradedResultCount: 0,
      totalMarksObtained: 0,
      totalMaxMarks: 0,
    });
  }

  for (const result of results) {
    const group = groups.get(String(result.assessmentId));

    if (!group) continue;

    const marks = Number(result.marks);
    const maxMarks = Number(result.maxMarks);

    if (
      !Number.isFinite(marks) ||
      !Number.isFinite(maxMarks) ||
      maxMarks <= 0 ||
      marks < 0 ||
      marks > maxMarks
    ) {
      continue;
    }

    group.studentIds.add(String(result.academicRecordId));
    group.gradedResultCount += 1;
    group.totalMarksObtained += marks;
    group.totalMaxMarks += maxMarks;
  }

  return Array.from(groups.values())
    .map((group) => ({
      assessmentId: group.assessmentId,
      title: group.title,
      subject: group.subject,
      assessmentType: group.assessmentType,
      assessmentDate: group.assessmentDate,
      assessmentMaxMarks: Number.isFinite(group.assessmentMaxMarks)
        ? group.assessmentMaxMarks
        : null,

      studentCount: group.studentIds.size,
      gradedResultCount: group.gradedResultCount,

      totalMarksObtained: group.totalMarksObtained,
      totalMaxMarks: group.totalMaxMarks,

      percentage:
        group.totalMaxMarks > 0
          ? Number(
              (
                (group.totalMarksObtained /
                  group.totalMaxMarks) *
                100
              ).toFixed(2)
            )
          : null,

      rank: null,
    }))
    .sort((a, b) => {
      if (a.percentage == null && b.percentage == null) {
        return new Date(b.assessmentDate) - new Date(a.assessmentDate);
      }

      if (a.percentage == null) return 1;
      if (b.percentage == null) return -1;

      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }

      return new Date(b.assessmentDate) - new Date(a.assessmentDate);
    })
    .map((assessment, index, sorted) => {
      if (assessment.percentage == null) {
        return assessment;
      }

      let rank = index + 1;

      if (
        index > 0 &&
        sorted[index - 1].percentage === assessment.percentage
      ) {
        rank = sorted[index - 1].rank;
      }

      return {
        ...assessment,
        rank,
      };
    });
}

export function getStudentDrilldown(dataset, academicRecordId) {
  const students = dataset?.students ?? [];
  const results = dataset?.results ?? [];

  const student = students.find(
    (item) =>
      String(item.academic_record_id) ===
      String(academicRecordId)
  );

  if (!student) {
    return null;
  }

  const studentResults = results
    .filter(
      (result) =>
        String(result.academicRecordId) ===
        String(academicRecordId)
    )
    .map((result) => ({
      resultId: result.resultId,
      assessmentId: result.assessmentId,

      title: result.title,
      subject: result.subject,
      assessmentType: result.assessmentType,
      assessmentDate: result.assessmentDate,

      marks: result.marks,
      maxMarks: result.maxMarks,
      percentage: result.percentage,
    }))
    .sort(
      (a, b) =>
        new Date(b.assessmentDate) -
        new Date(a.assessmentDate)
    );

  const totalMarksObtained = studentResults.reduce(
    (sum, result) => sum + Number(result.marks),
    0
  );

  const totalMaxMarks = studentResults.reduce(
    (sum, result) => sum + Number(result.maxMarks),
    0
  );

  return {
    academicRecordId: student.academic_record_id,
    studentId: student.student_id,
    studentName: student.student_name,
    uid: student.uid,
    academicStatus: student.status,

    gradedResultCount: studentResults.length,

    totalMarksObtained,
    totalMaxMarks,

    overallPercentage:
      totalMaxMarks > 0
        ? Number(
            (
              (totalMarksObtained / totalMaxMarks) *
              100
            ).toFixed(2)
          )
        : null,

    results: studentResults,
  };
}
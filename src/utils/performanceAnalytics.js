export function calculatePerformanceSummary(marks = []) {
  const validMarks = marks.filter(
    (mark) =>
      mark.marks !== null &&
      mark.marks !== undefined &&
      mark.max_marks !== null &&
      mark.max_marks !== undefined &&
      Number(mark.max_marks) > 0
  );

  if (validMarks.length === 0) {
    return {
      assessmentCount: 0,
      totalMarksObtained: 0,
      totalMaxMarks: 0,
      overallPercentage: null,
    };
  }

  const totalMarksObtained = validMarks.reduce(
    (sum, mark) => sum + Number(mark.marks),
    0
  );

  const totalMaxMarks = validMarks.reduce(
    (sum, mark) => sum + Number(mark.max_marks),
    0
  );

  const overallPercentage =
    totalMaxMarks > 0
      ? Number(
        (
          (totalMarksObtained / totalMaxMarks) *
          100
        ).toFixed(2)
      )
      : null;

  return {
    assessmentCount: validMarks.length,
    totalMarksObtained,
    totalMaxMarks,
    overallPercentage,
  };
}

export function calculateSubjectPerformance(marks = []) {
  const subjectMap = new Map();

  marks.forEach((mark) => {
    if (
      mark.marks === null ||
      mark.marks === undefined ||
      mark.max_marks === null ||
      mark.max_marks === undefined ||
      Number(mark.max_marks) <= 0
    ) {
      return;
    }

    const subject = mark.subject?.trim();

    if (!subject) {
      return;
    }
    

    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, {
        subject,
        assessmentCount: 0,
        totalMarksObtained: 0,
        totalMaxMarks: 0,
      });
    }

    const entry = subjectMap.get(subject);

    entry.assessmentCount += 1;
    entry.totalMarksObtained += Number(mark.marks);
    entry.totalMaxMarks += Number(mark.max_marks);
  });

  return Array.from(subjectMap.values())
    .map((entry) => ({
      ...entry,

      percentage:
        entry.totalMaxMarks > 0
          ? Number(
            (
              (entry.totalMarksObtained /
                entry.totalMaxMarks) *
              100
            ).toFixed(2)
          )
          : null,
    }))
    .sort(
      (a, b) =>
        (b.percentage ?? 0) -
        (a.percentage ?? 0)
    );
}

export function calculateAssessmentTypePerformance(
  marks = []
) {
  const typeMap = new Map();

  marks.forEach((mark) => {
    if (
      mark.marks === null ||
      mark.marks === undefined ||
      mark.max_marks === null ||
      mark.max_marks === undefined ||
      Number(mark.max_marks) <= 0
    ) {
      return;
    }

    const type = (
      mark.exam_type || 'unknown'
    )
      .toLowerCase()
      .trim();

    if (!typeMap.has(type)) {
      typeMap.set(type, {
        type,
        assessmentCount: 0,
        totalMarksObtained: 0,
        totalMaxMarks: 0,
      });
    }

    const entry = typeMap.get(type);

    entry.assessmentCount += 1;
    entry.totalMarksObtained += Number(mark.marks);
    entry.totalMaxMarks += Number(mark.max_marks);
  });

  return Array.from(typeMap.values())
    .map((entry) => ({
      ...entry,

      percentage:
        entry.totalMaxMarks > 0
          ? Number(
            (
              (entry.totalMarksObtained /
                entry.totalMaxMarks) *
              100
            ).toFixed(2)
          )
          : null,
    }));
}
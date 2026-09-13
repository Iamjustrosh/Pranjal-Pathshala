import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, ClipboardCheck, GraduationCap, Users, FileText,
  CircleHelp,
} from 'lucide-react';

import PageHeader from '@/components/admin/PageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';

import { supabase } from '@/supabaseClient';
import { CURRENT_ACADEMIC_YEAR } from '@/config/academicYear';

import { loadAdminAnalyticsDataset } from '@/services/assessmentResults';
import { calculateClassAnalytics, calculateAssessmentTypeAnalytics, calculateSubjectAnalytics, calculateStudentRanking, calculateAssessmentAnalytics, getStudentDrilldown, } from '@/utils/adminPerformanceAnalytics';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';


const CLASS_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

export default function AnalyticsPage() {
  const [year, setYear] = useState(CURRENT_ACADEMIC_YEAR);
  const [classNumber, setClassNumber] = useState(6);

  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedStudentId, setSelectedStudentId] =
    useState(null);



  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setLoading(true);
      setError('');

      try {
        const data = await loadAdminAnalyticsDataset(
          supabase,
          {
            year,
            classNumber,
          }
        );

        if (!cancelled) {
          setDataset(data);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);

        if (!cancelled) {
          setDataset(null);
          setError(
            err?.message || 'Unable to load analytics.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [year, classNumber]);

  const summary = useMemo(() => {
    if (!dataset) return null;

    return calculateClassAnalytics(dataset);
  }, [dataset]);

  const typeAnalytics = useMemo(() => {
    if (!dataset) return [];

    return calculateAssessmentTypeAnalytics(dataset);
  }, [dataset]);

  const subjectAnalytics = useMemo(() => {
    if (!dataset) return [];

    return calculateSubjectAnalytics(dataset);
  }, [dataset]);

  const studentRanking = useMemo(() => {
    if (!dataset) return [];

    return calculateStudentRanking(dataset);
  }, [dataset]);
  const assessmentAnalytics = useMemo(() => {
    if (!dataset) return [];

    return calculateAssessmentAnalytics(dataset);
  }, [dataset]);

  const selectedStudent = useMemo(() => {
    if (!dataset || !selectedStudentId) {
      return null;
    }

    return getStudentDrilldown(
      dataset,
      selectedStudentId
    );
  }, [dataset, selectedStudentId]);
  useEffect(() => {
    setSelectedStudentId(null);
  }, [year, classNumber]);




  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Analytics"
        description="Analyse class performance, assessments, and student results."
      />

      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:max-w-xl">
          <label className="space-y-2">
            <span className="text-sm font-medium">
              Academic Year
            </span>

            <select
              value={year}
              onChange={(event) =>
                setYear(Number(event.target.value))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {[
                CURRENT_ACADEMIC_YEAR - 2,
                CURRENT_ACADEMIC_YEAR - 1,
                CURRENT_ACADEMIC_YEAR,
                CURRENT_ACADEMIC_YEAR + 1,
              ].map((optionYear) => (
                <option
                  key={optionYear}
                  value={optionYear}
                >
                  {optionYear}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Class
            </span>

            <select
              value={classNumber}
              onChange={(event) =>
                setClassNumber(Number(event.target.value))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {CLASS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  Class {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {loading && (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading analytics...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && summary && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              title="Class Performance"
              value={`${summary.overallPercentage.toFixed(2)}%`}
              description={`${summary.totalMarksObtained} / ${summary.totalMaxMarks} weighted marks`}
              icon={BarChart3}
            />

            <AdminStatCard
              title="Students"
              value={summary.studentCount}
              description={`${summary.studentsWithResults} with graded results`}
              icon={Users}
            />

            <AdminStatCard
              title="Assessments"
              value={summary.assessmentCount}
              description="Published assessments"
              icon={ClipboardCheck}
            />

            <AdminStatCard
              title="Graded Results"
              value={summary.gradedResultCount}
              description={`Class ${classNumber} · ${year}`}
              icon={GraduationCap}
            />
          </section>
          {summary.gradedResultCount > 0 && (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Assessment Performance
                </h2>

                <p className="text-sm text-muted-foreground">
                  Weighted performance across tests and quizzes.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {typeAnalytics.map((item) => {
                  const isTest = item.type === 'test';
                  const Icon = isTest ? FileText : CircleHelp;

                  return (
                    <div
                      key={item.type}
                      className="rounded-xl border bg-card p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                            <Icon className="size-5 text-muted-foreground" />
                          </div>

                          <div>
                            <h3 className="font-semibold">
                              {isTest ? 'Test Performance' : 'Quiz Performance'}
                            </h3>

                            <p className="text-sm text-muted-foreground">
                              {item.assessmentCount}{' '}
                              {item.assessmentCount === 1
                                ? 'assessment'
                                : 'assessments'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-semibold tracking-tight">
                            {item.gradedResultCount > 0
                              ? `${item.percentage.toFixed(2)}%`
                              : '—'}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {item.gradedResultCount > 0
                              ? 'weighted'
                              : 'No graded results'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(
                              Math.max(item.percentage, 0),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Score
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {item.totalMarksObtained} / {item.totalMaxMarks}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Results
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {item.gradedResultCount}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Students
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {item.studentCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Subject Performance
              </h2>

              <p className="text-sm text-muted-foreground">
                Performance grouped only by assessments with a genuine subject.
              </p>
            </div>

            {subjectAnalytics.length > 0 ? (
              <div className="rounded-xl border bg-card">
                <div className="divide-y">
                  {subjectAnalytics.map((subject) => (
                    <div
                      key={subject.subject}
                      className="p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-medium">
                            {subject.subject}
                          </h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {subject.assessmentCount}{' '}
                            {subject.assessmentCount === 1
                              ? 'assessment'
                              : 'assessments'}
                            {' · '}
                            {subject.studentCount}{' '}
                            {subject.studentCount === 1
                              ? 'student'
                              : 'students'}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-xl font-semibold tracking-tight">
                            {subject.percentage.toFixed(2)}%
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {subject.totalMarksObtained} /{' '}
                            {subject.totalMaxMarks}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(
                              Math.max(subject.percentage, 0),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed bg-card p-8 text-center">
                <h3 className="font-medium">
                  No subject-specific results
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  This class does not currently have graded assessments
                  with a genuine subject value.
                </p>
              </div>
            )}
          </section>
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Student Performance
              </h2>

              <p className="text-sm text-muted-foreground">
                Students ranked by weighted performance for the selected class.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border bg-card">
              {studentRanking.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Rank
                        </th>

                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Student
                        </th>

                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          UID
                        </th>

                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                          Results
                        </th>

                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                          Score
                        </th>

                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                          Performance
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {studentRanking.map((student) => (
                        <tr
                          key={student.academicRecordId}
                          onClick={() =>
                            setSelectedStudentId(student.academicRecordId)
                          }
                          className="cursor-pointer transition-colors hover:bg-muted/50"
                        >
                          <td className="px-4 py-4">
                            {student.rank != null ? (
                              <span className="font-semibold">
                                #{student.rank}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium">
                                {student.studentName || 'Unknown student'}
                              </p>

                              <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                                {student.academicStatus}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                            {student.uid || '—'}
                          </td>

                          <td className="px-4 py-4 text-right">
                            {student.gradedResultCount}
                          </td>

                          <td className="px-4 py-4 text-right">
                            {student.totalMaxMarks > 0 ? (
                              <>
                                {student.totalMarksObtained} /{' '}
                                {student.totalMaxMarks}
                              </>
                            ) : (
                              <span className="text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-right">
                            {student.percentage != null ? (
                              <div className="inline-flex min-w-[72px] justify-end font-semibold">
                                {student.percentage.toFixed(2)}%
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                No results
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <h3 className="font-medium">
                    No students found
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    There are no student academic records for this class
                    and academic year.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Assessment Performance
              </h2>

              <p className="text-sm text-muted-foreground">
                Individual assessment performance ranked by weighted class score.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border bg-card">
              {assessmentAnalytics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Rank
                        </th>

                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Assessment
                        </th>

                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Type
                        </th>

                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                          Date
                        </th>

                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                          Results
                        </th>

                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                          Score
                        </th>

                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                          Performance
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {assessmentAnalytics.map((assessment) => (
                        <tr
                          key={assessment.assessmentId}
                          className="transition-colors hover:bg-muted/30"
                        >
                          <td className="px-4 py-4">
                            {assessment.rank != null ? (
                              <span className="font-semibold">
                                #{assessment.rank}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium">
                                {assessment.title}
                              </p>

                              {assessment.subject && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {assessment.subject}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize">
                              {assessment.assessmentType}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-muted-foreground">
                            {assessment.assessmentDate
                              ? new Date(
                                `${assessment.assessmentDate}T00:00:00`
                              ).toLocaleDateString()
                              : '—'}
                          </td>

                          <td className="px-4 py-4 text-right">
                            {assessment.gradedResultCount}
                          </td>

                          <td className="px-4 py-4 text-right">
                            {assessment.totalMaxMarks > 0 ? (
                              <>
                                {assessment.totalMarksObtained} /{' '}
                                {assessment.totalMaxMarks}
                              </>
                            ) : (
                              <span className="text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-right">
                            {assessment.percentage != null ? (
                              <span className="font-semibold">
                                {assessment.percentage.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                No results
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <h3 className="font-medium">
                    No assessments found
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    There are no published assessments for this class and academic year.
                  </p>
                </div>
              )}
            </div>
          </section>
          {summary.gradedResultCount === 0 && (
            <section className="rounded-xl border border-dashed bg-card p-10 text-center">
              <h2 className="font-medium">
                No graded results available
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                There are no published graded results for
                Class {classNumber} in academic year {year}.
              </p>
            </section>
          )}

          <Sheet
            open={Boolean(selectedStudentId)}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedStudentId(null);
              }
            }}
          >
            <SheetContent className="w-full overflow-y-auto border-l bg-white p-0 shadow-2xl sm:max-w-xl">
              {selectedStudent && (
                <div className="min-h-full bg-background">
                  {/* Header */}
                  <div className="sticky top-0 z-10 border-b bg-background px-6 py-5">
                    <SheetHeader>
                      <SheetTitle className="text-xl">
                        {selectedStudent.studentName}
                      </SheetTitle>

                      <SheetDescription>
                        {selectedStudent.uid} · Class {classNumber} · {year}
                      </SheetDescription>
                    </SheetHeader>
                  </div>

                  {/* Body */}
                  <div className="space-y-8 bg-background px-6 py-6">

                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs font-medium text-muted-foreground">
                          Performance
                        </p>

                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                          {selectedStudent.overallPercentage != null
                            ? `${selectedStudent.overallPercentage.toFixed(2)}%`
                            : '—'}
                        </p>
                      </div>

                      <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs font-medium text-muted-foreground">
                          Graded Results
                        </p>

                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                          {selectedStudent.gradedResultCount}
                        </p>
                      </div>

                      <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs font-medium text-muted-foreground">
                          Marks Scored
                        </p>

                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                          {selectedStudent.totalMaxMarks > 0
                            ? `${selectedStudent.totalMarksObtained} / ${selectedStudent.totalMaxMarks}`
                            : '—'}
                        </p>
                      </div>

                      <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs font-medium text-muted-foreground">
                          Academic Status
                        </p>

                        <p className="mt-2 text-2xl font-semibold capitalize tracking-tight">
                          {selectedStudent.academicStatus}
                        </p>
                      </div>
                    </div>

                    {/* Assessment History */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-semibold">
                          Assessment History
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Graded assessments for this academic record.
                        </p>
                      </div>

                      {selectedStudent.results.length > 0 ? (
                        <div className="divide-y rounded-lg border bg-card">
                          {selectedStudent.results.map((result) => (
                            <div
                              key={result.resultId}
                              className="p-4"
                            >
                              <div className="flex items-start justify-between gap-6">
                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    {result.title}
                                  </p>

                                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="capitalize">
                                      {result.assessmentType}
                                    </span>

                                    {result.subject && (
                                      <>
                                        <span>·</span>
                                        <span>{result.subject}</span>
                                      </>
                                    )}

                                    {result.assessmentDate && (
                                      <>
                                        <span>·</span>
                                        <span>
                                          {new Date(
                                            `${result.assessmentDate}T00:00:00`
                                          ).toLocaleDateString()}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0 text-right">
                                  <p className="font-semibold">
                                    {result.marks} / {result.maxMarks}
                                  </p>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {result.percentage.toFixed(2)}%
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(result.percentage, 0),
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed bg-card p-8 text-center">
                          <p className="text-sm text-muted-foreground">
                            No graded results are available for this student.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}
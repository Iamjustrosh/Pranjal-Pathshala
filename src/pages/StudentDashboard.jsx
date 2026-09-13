import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

import {
  calculatePerformanceSummary,
  calculateSubjectPerformance,
  calculateAssessmentTypePerformance,
} from '../utils/performanceAnalytics';


import StudentHeader from '../components/student/StudentHeader';
import StudentBottomNav from '../components/student/StudentBottomNav';
import PerformancePage from '../components/student/PerformancePage';
import AttendancePage from '../components/student/AttendancePage';
import AIPage from '../components/student/AIPage';
import StudyPage from '../components/student/StudyPage';
import QuizPage from '../components/student/QuizPage';
import StudentState from '../components/student/StudentState';
const ATTENDANCE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1wFdGhXMf5biwrQ4g4G8PS_2e3suzuOBrwNACRPCSfX8/edit?usp=sharing';

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [studentProfile, setStudentProfile] = useState(null);
  const [student, setStudent] = useState(null);

  const [dashboardError, setDashboardError] = useState(null);


  const [academicRecords, setAcademicRecords] = useState([]);
  const [academicRecord, setAcademicRecord] = useState(null);
  const [academicYearPerformance, setAcademicYearPerformance] = useState([]);

  const [profileError, setProfileError] = useState('');
  const [switchingAcademicYear, setSwitchingAcademicYear] = useState(false);

  const [marks, setMarks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);

  const [activePage, setActivePage] = useState('performance');
  const [testView, setTestView] = useState('chart');
  const [quizView, setQuizView] = useState('chart');
  const [materialSubject, setMaterialSubject] = useState('All');
  const [iframeKey, setIframeKey] = useState(0);


  const handleDashboardRetry = async () => {
    if (!studentId) return;

    setDashboardError(null);

    await initializeDashboard(studentId);
  };


  const {
    appUser,
    studentId,
    signOut,
    loading: authLoading,
  } = useAuth();

  const normalizeClass = (value) =>
    String(value || '').replace(/\D/g, '').trim();

  useEffect(() => {
    if (authLoading) return;

    if (
      !appUser ||
      appUser.role !== 'student' ||
      appUser.status !== 'active' ||
      !studentId
    ) {
      return;
    }

    initializeDashboard(studentId);
  }, [
    authLoading,
    appUser?.auth_user_id,
    appUser?.role,
    appUser?.status,
    studentId,
  ]);

  const initializeDashboard = async (permanentStudentId) => {
    setProfileError('');
    setLoadingContent(true);
    setDashboardError(null);


    try {
      const {
        data: studentData,
        error: studentError,
      } = await supabase
        .from('students')
        .select(`
          id,
          student_name,
          photo_url,
          contact_number,
          parent_contact_number,
          login_username
        `)
        .eq('id', permanentStudentId)
        .single();

      if (studentError || !studentData) {
        console.error(
          'Failed to load student profile:',
          studentError
        );

        setProfileError(
          'Unable to load your student profile.'
        );

        return;
      }

      const {
        data: historyData,
        error: historyError,
      } = await supabase
        .from('student_academic_records')
        .select(`
          id,
          student_id,
          uid,
          academic_year,
          class,
          board,
          school_name,
          interested_subjects,
          status
        `)
        .eq('student_id', permanentStudentId)
        .order('academic_year', {
          ascending: false,
        });

      if (historyError) {
        console.error(
          'Failed to load academic history:',
          historyError
        );

        setProfileError(
          'Unable to load your academic history.'
        );

        return;
      }

      const records = historyData ?? [];

      if (records.length === 0) {
        setProfileError(
          'No academic record was found for your account.'
        );

        return;
      }

      const activeRecord =
        records.find(
          (record) => record.status === 'active'
        ) ?? records[0];

      setStudentProfile(studentData);
      setAcademicRecords(records);

      await fetchAcademicYearPerformance(records);

      await applyAcademicRecord(
        studentData,
        activeRecord
      );
    } catch (error) {
      console.error(
        'Student dashboard initialization failed:',
        error
      );

      setProfileError(
        'Unable to load your dashboard.'
      );
      setDashboardError(
        'We could not load your student dashboard. Please try again.'
      );
    } finally {
      setLoadingContent(false);
    }
  };

  const buildDashboardStudent = (
    permanentProfile,
    selectedRecord
  ) => ({
    ...permanentProfile,

    name: permanentProfile.student_name,

    // Academic identity changes when history selection changes.
    username: selectedRecord.uid,
    class: selectedRecord.class,
    board: selectedRecord.board,
    academic_record_id: selectedRecord.id,
    academic_year: selectedRecord.academic_year,
    academic_status: selectedRecord.status,
    school_name: selectedRecord.school_name,
    interested_subjects:
      selectedRecord.interested_subjects,
  });

  const fetchAcademicYearPerformance = async (academicRecords) => {
    if (!academicRecords?.length) {
      setAcademicYearPerformance([]);
      return;
    }

    try {
      const recordIds = academicRecords.map((record) => record.id);

      const { data, error } = await supabase
        .from('assessment_results')
        .select(`
        id,
        student_academic_record_id,
        marks_obtained,
        max_marks,
        status,
        assessment:assessments (
          id,
          assessment_type,
          max_marks,
          status
        )
      `)
        .in('student_academic_record_id', recordIds)
        .eq('status', 'graded');

      if (error) {
        throw error;
      }

      const publishedResults = (data || []).filter(
        (row) =>
          row.assessment &&
          row.assessment.status === 'published'
      );

      const summaries = academicRecords.map((record) => {
        const recordResults = publishedResults
          .filter(
            (row) =>
              Number(row.student_academic_record_id) ===
              Number(record.id)
          )
          .map((row) => ({
            marks: Number(row.marks_obtained),
            max_marks: Number(
              row.max_marks ??
              row.assessment?.max_marks ??
              0
            ),
          }))
          .filter(
            (row) =>
              Number.isFinite(row.marks) &&
              Number.isFinite(row.max_marks) &&
              row.max_marks > 0
          );

        const summary =
          calculatePerformanceSummary(recordResults);

        return {
          academicRecordId: record.id,
          academicYear: record.academic_year,
          class: record.class,
          uid: record.uid,
          status: record.status,

          assessmentCount: summary.assessmentCount,
          totalMarksObtained:
            summary.totalMarksObtained,
          totalMaxMarks: summary.totalMaxMarks,
          overallPercentage:
            summary.overallPercentage,
        };
      });

      summaries.sort(
        (a, b) =>
          Number(a.academicYear) -
          Number(b.academicYear)
      );

      setAcademicYearPerformance(summaries);
    } catch (error) {
      console.error(
        'Failed to fetch academic year performance:',
        error
      );

      setAcademicYearPerformance([]);
    }
  };

  const fetchAssessmentResults = async (
    academicRecordId
  ) => {
    const {
      data: resultData,
      error: resultError,
    } = await supabase
      .from('assessment_results')
      .select(`
        id,
        marks_obtained,
        max_marks,
        status,
        assessment:assessments (
          id,
          title,
          subject,
          assessment_type,
          assessment_date,
          max_marks,
          status
        )
      `)
      .eq(
        'student_academic_record_id',
        academicRecordId
      )
      .eq('status', 'graded');

    if (resultError) {
      console.error(
        'Failed to load assessment results:',
        resultError
      );

      setMarks([]);
      return;
    }

    const normalizedMarks = (resultData ?? [])
      .filter(
        (row) =>
          row.assessment &&
          row.assessment.status === 'published'
      )
      .map((row) => {
        const marksValue =
          row.marks_obtained !== null
            ? Number(row.marks_obtained)
            : null;

        const effectiveMaxMarks =
          row.max_marks ??
          row.assessment.max_marks ??
          null;

        const maxMarks =
          effectiveMaxMarks !== null
            ? Number(effectiveMaxMarks)
            : null;

        const percentage =
          marksValue !== null &&
            maxMarks !== null &&
            maxMarks > 0
            ? Number(
              (
                (marksValue / maxMarks) *
                100
              ).toFixed(2)
            )
            : null;

        return {
          id: row.id,
          subject:
            row.assessment.subject?.trim() || null,
          title: row.assessment.title,
          exam_type:
            row.assessment.assessment_type,
          exam_date:
            row.assessment.assessment_date,
          marks: marksValue,
          max_marks: maxMarks,
          percentage,
        };
      })
      .sort(
        (a, b) =>
          new Date(a.exam_date).getTime() -
          new Date(b.exam_date).getTime()
      );

    setMarks(normalizedMarks);
  };

  const fetchAcademicContent = async (
    selectedAcademicRecord
  ) => {
    if (!selectedAcademicRecord) {
      setMaterials([]);
      setQuizzes([]);
      return;
    }

    setLoadingContent(true);

    try {
      const targetClass = normalizeClass(
        selectedAcademicRecord.class
      );

      const targetAcademicYear =
        selectedAcademicRecord.academic_year;

      // ========================================================
      // STUDY MATERIALS
      // ========================================================

      const {
        data: materialData,
        error: materialError,
      } = await supabase
        .from('materials')
        .select(`
        id,
        title,
        subject,
        class,
        board,
        url,
        academic_year,
        description,
        material_type,
        status,
        created_at,
        updated_at
      `)
        .eq('status', 'published')
        .or(
          `academic_year.is.null,academic_year.eq.${targetAcademicYear}`
        )
        .order('created_at', {
          ascending: false,
        });

      if (materialError) {
        console.error(
          'Failed to load study materials:',
          materialError
        );

        setMaterials([]);
      } else {
        const filteredMaterials = (
          materialData ?? []
        ).filter(
          (material) =>
            normalizeClass(material.class) ===
            targetClass
        );

        setMaterials(filteredMaterials);
      }

      // ========================================================
      // EXTERNAL QUIZZES
      // ========================================================

      const {
        data: quizData,
        error: quizError,
      } = await supabase
        .from('quiz_links')
        .select(`
        id,
        title,
        subject,
        chapter,
        class,
        board,
        academic_year,
        url,
        provider,
        status,
        created_at,
        updated_at
      `)
        .eq('status', 'published')
        .eq(
          'class',
          Number(selectedAcademicRecord.class)
        )
        .or(
          `academic_year.is.null,academic_year.eq.${targetAcademicYear}`
        )
        .order('created_at', {
          ascending: false,
        });

      if (quizError) {
        console.error(
          'Failed to load quiz links:',
          quizError
        );

        setQuizzes([]);
      } else {
        setQuizzes(quizData ?? []);
      }
    } catch (error) {
      console.error(
        'Academic content fetch error:',
        error
      );

      setMaterials([]);
      setQuizzes([]);
    } finally {
      setLoadingContent(false);
    }
  };

  const applyAcademicRecord = async (
    permanentProfile,
    selectedRecord
  ) => {
    setAcademicRecord(selectedRecord);

    setStudent(
      buildDashboardStudent(
        permanentProfile,
        selectedRecord
      )
    );

    await Promise.all([
      fetchAssessmentResults(
        selectedRecord.id
      ),

      fetchAcademicContent(
        selectedRecord
      ),
    ]);
  };

  const handleAcademicRecordChange = async (
    academicRecordId
  ) => {
    if (!studentProfile) return;

    const nextRecord =
      academicRecords.find(
        (record) =>
          String(record.id) ===
          String(academicRecordId)
      );

    if (
      !nextRecord ||
      nextRecord.id === academicRecord?.id
    ) {
      return;
    }

    setSwitchingAcademicYear(true);

    try {
      await applyAcademicRecord(
        studentProfile,
        nextRecord
      );

      // Reset page-specific UI state when academic identity changes.
      setTestView('chart');
      setQuizView('chart');
    } finally {
      setSwitchingAcademicYear(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();

      navigate('/login', {
        replace: true,
      });
    } catch (error) {
      console.error(
        'Student logout failed:',
        error
      );
    }
  };

  const testMarks = useMemo(
    () =>
      marks.filter(
        (mark) =>
          (mark.exam_type || '')
            .toLowerCase()
            .trim() === 'test'
      ),
    [marks]
  );

  const quizMarks = useMemo(
    () =>
      marks.filter(
        (mark) =>
          (
            mark.exam_type || ''
          )
            .toLowerCase()
            .trim() === 'quiz'
      ),
    [marks]
  );
  const performanceSummary = useMemo(
    () => calculatePerformanceSummary(marks),
    [marks]
  );

  const subjectPerformance = useMemo(
    () => calculateSubjectPerformance(marks),
    [marks]
  );

  const assessmentTypePerformance = useMemo(
    () => calculateAssessmentTypePerformance(marks),
    [marks]
  );


  const toGraphData = (rows) =>
    rows.map((mark) => ({
      date: mark.exam_date,
      label: mark.title,
      title: mark.title,
      subject: mark.subject,
      marks: mark.marks,
      max: mark.max_marks,
      percentage: mark.percentage,
      displayDate: mark.exam_date
        ? new Date(mark.exam_date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
        })
        : '',
    }));

  const renderPage = () => {
    switch (activePage) {
      case 'attendance':
        return (
          <AttendancePage
            sheetUrl={ATTENDANCE_SHEET_URL}
            iframeKey={iframeKey}
            onRefresh={() =>
              setIframeKey(
                (value) => value + 1
              )
            }
          />
        );

      case 'ai':
        return <AIPage />;

      case 'study':
        return (
          <StudyPage
            student={student}
            materials={materials}
            loading={loadingContent}
            materialSubject={
              materialSubject
            }
            setMaterialSubject={
              setMaterialSubject
            }
          />
        );

      case 'quiz':
        return (
          <QuizPage
            quizzes={quizzes}
            loading={loadingContent}
          />
        );

      case 'performance':
      default:
        return (
          <PerformancePage
            student={student}
            academicRecord={
              academicRecord
            }
            testMarks={testMarks}
            quizMarks={quizMarks}
            testView={testView}
            setTestView={setTestView}
            quizView={quizView}
            setQuizView={setQuizView}
            toGraphData={toGraphData}
            switchingAcademicYear={
              switchingAcademicYear
            }
            subjectPerformance={subjectPerformance}
            performanceSummary={performanceSummary}
            assessmentTypePerformance={assessmentTypePerformance}
            academicYearPerformance={academicYearPerformance}
          />
        );
    }
  };

  if (dashboardError) {
    return (
      <div className="min-h-screen bg-slate-100 px-3 py-4">
        <div
          className="
          mx-auto flex min-h-[calc(100vh-2rem)]
          w-full max-w-[500px]
          items-center justify-center
          rounded-[32px] bg-white
          p-4 shadow-sm
        "
        >
          <StudentState
            type="error"
            title="Dashboard unavailable"
            description={dashboardError}
            onRetry={handleDashboardRetry}
          />
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 text-center">
        <div className="w-full max-w-sm rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-red-500">
            {profileError}
          </p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
          <p className="text-sm font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 font-sans sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-50 sm:h-[calc(100dvh-32px)] sm:max-w-[500px] sm:rounded-[34px] sm:border sm:border-white/70 sm:shadow-2xl sm:shadow-slate-400/20">
        <div className="flex h-full flex-col">
          <StudentHeader
            student={student}
            academicRecords={
              academicRecords
            }
            selectedAcademicRecordId={
              academicRecord?.id
            }
            onAcademicRecordChange={
              handleAcademicRecordChange
            }
            switchingAcademicYear={
              switchingAcademicYear
            }
            onLogout={handleLogout}
          />
          {switchingAcademicYear && (
            <div
              className="
      border-b border-indigo-100
      bg-indigo-50
      px-4 py-2
      text-center text-[11px]
      font-medium text-indigo-600
    "
            >
              Loading selected academic year...
            </div>
          )}
          <main
            className={`min-w-0 flex-1 overflow-y-auto overscroll-contain ${activePage === 'ai'
              ? 'px-4 py-4'
              : 'px-4 py-5'
              } pb-24`}
          >
            {renderPage()}
          </main>

          <StudentBottomNav
            activePage={activePage}
            onChange={setActivePage}
          />
        </div>
      </div>
    </div>
  );
}

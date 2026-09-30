/**
 * PhoneMockupPreviews.jsx
 *
 * Thin wrapper components that render the REAL app components
 * with hardcoded mock data — no auth, no API calls.
 *
 * Because we import the actual components, any UI update
 * you make to them will automatically show up here.
 */

import React, { useState } from 'react';

// ── Real components ──────────────────────────────────────────────
import AIPage from '../student/AIPage';
import { LabsIndex } from '../../pages/Labs';
import StudyPage from '../student/StudyPage';
import PerformancePage from '../student/PerformancePage';
import QuizPage from '../student/QuizPage';

// ─────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────

const MOCK_STUDENT = {
  id: 'preview',
  name: 'Aarav Sharma',
  student_name: 'Aarav Sharma',
  class: '10',
  board: 'CBSE',
  username: 'PP-2526-1001',
  academic_year: '2025-26',
};

const MOCK_MATERIALS = [
  {
    id: 1,
    title: "Newton's Laws of Motion",
    subject: 'Physics',
    class: '10',
    material_type: 'notes',
    url: '#',
  },
  {
    id: 2,
    title: 'Chemical Reactions & Equations',
    subject: 'Chemistry',
    class: '10',
    material_type: 'notes',
    url: '#',
  },
  {
    id: 3,
    title: 'Linear Equations in Two Variables',
    subject: 'Maths',
    class: '10',
    material_type: 'worksheet',
    url: '#',
  },
];

const MOCK_QUIZZES = [
  {
    id: 1,
    title: 'Electricity Chapter Test',
    subject: 'Physics',
    class: '10',
    chapter: 'Ch 12 — Electric Current',
    url: '#',
  },
  {
    id: 2,
    title: 'Acids, Bases & Salts Quiz',
    subject: 'Chemistry',
    class: '10',
    chapter: 'Ch 2 — Acids & Bases',
    url: '#',
  },
  {
    id: 3,
    title: 'Trigonometry Practice',
    subject: 'Maths',
    class: '10',
    chapter: 'Ch 8 — Trigonometry',
    url: '#',
  },
];

const MOCK_TEST_MARKS = [
  { id: 1, title: 'Unit Test 1', subject: 'Physics', exam_type: 'test', exam_date: '2026-04-10', marks: 38, max_marks: 50, percentage: 76 },
  { id: 2, title: 'Unit Test 2', subject: 'Chemistry', exam_type: 'test', exam_date: '2026-05-15', marks: 42, max_marks: 50, percentage: 84 },
  { id: 3, title: 'Mid Term', subject: 'Maths', exam_type: 'test', exam_date: '2026-06-20', marks: 78, max_marks: 100, percentage: 78 },
  { id: 4, title: 'Unit Test 3', subject: 'Physics', exam_type: 'test', exam_date: '2026-07-25', marks: 45, max_marks: 50, percentage: 90 },
];

const MOCK_QUIZ_MARKS = [
  { id: 5, title: 'Quiz 1', subject: 'Physics', exam_type: 'quiz', exam_date: '2026-04-18', marks: 8, max_marks: 10, percentage: 80 },
  { id: 6, title: 'Quiz 2', subject: 'Chemistry', exam_type: 'quiz', exam_date: '2026-05-22', marks: 9, max_marks: 10, percentage: 90 },
  { id: 7, title: 'Quiz 3', subject: 'Maths', exam_type: 'quiz', exam_date: '2026-06-28', marks: 7, max_marks: 10, percentage: 70 },
];

const MOCK_PERFORMANCE_SUMMARY = {
  assessmentCount: 7,
  totalMarksObtained: 227,
  totalMaxMarks: 280,
  overallPercentage: 81.07,
};

const MOCK_SUBJECT_PERFORMANCE = [
  { subject: 'Physics', assessmentCount: 3, totalMarksObtained: 91, totalMaxMarks: 110, percentage: 82.73 },
  { subject: 'Chemistry', assessmentCount: 2, totalMarksObtained: 51, totalMaxMarks: 60, percentage: 85 },
  { subject: 'Maths', assessmentCount: 2, totalMarksObtained: 85, totalMaxMarks: 110, percentage: 77.27 },
];

const MOCK_ASSESSMENT_TYPE_PERFORMANCE = [
  { type: 'test', assessmentCount: 4, totalMarksObtained: 203, totalMaxMarks: 250, percentage: 81.2 },
  { type: 'quiz', assessmentCount: 3, totalMarksObtained: 24, totalMaxMarks: 30, percentage: 80 },
];

const MOCK_ACADEMIC_YEAR_PERFORMANCE = [];

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

// ─────────────────────────────────────────────────────────────────
// PREVIEW COMPONENTS
// ─────────────────────────────────────────────────────────────────

/** AI Chat — renders the real AIPage component */
export function ChatbotPreview() {
  return <AIPage />;
}

/** Labs — renders the real LabsIndex (no auth needed) */
export function LabsPreview() {
  // onSelect is a no-op in preview mode
  return <LabsIndex onSelect={() => {}} />;
}

/** Study Material — real StudyPage with mock materials */
export function StudyMaterialPreview() {
  const [materialSubject, setMaterialSubject] = useState('All');

  return (
    <StudyPage
      student={MOCK_STUDENT}
      materials={MOCK_MATERIALS}
      loading={false}
      materialSubject={materialSubject}
      setMaterialSubject={setMaterialSubject}
    />
  );
}

/** Progress Analytics — real PerformancePage with mock data */
export function ProgressPreview() {
  const [testView, setTestView] = useState('chart');
  const [quizView, setQuizView] = useState('chart');

  return (
    <PerformancePage
      testMarks={MOCK_TEST_MARKS}
      quizMarks={MOCK_QUIZ_MARKS}
      testView={testView}
      setTestView={setTestView}
      quizView={quizView}
      setQuizView={setQuizView}
      toGraphData={toGraphData}
      performanceSummary={MOCK_PERFORMANCE_SUMMARY}
      subjectPerformance={MOCK_SUBJECT_PERFORMANCE}
      assessmentTypePerformance={MOCK_ASSESSMENT_TYPE_PERFORMANCE}
      academicYearPerformance={MOCK_ACADEMIC_YEAR_PERFORMANCE}
    />
  );
}

/** Quizzes — real QuizPage with mock quizzes */
export function QuizzesPreview() {
  return (
    <QuizPage
      quizzes={MOCK_QUIZZES}
      loading={false}
    />
  );
}

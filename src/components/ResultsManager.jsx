import { useEffect, useRef, useState } from 'react';
import { RiFileChartLine, RiEditLine } from 'react-icons/ri';
import { supabase } from '../supabaseClient';
import { CURRENT_ACADEMIC_YEAR } from '../config/academicYear';
import { searchAcademicRecords } from '../services/academicRecords';
import { createAssessment, listResultStudents, listAssessments, loadAssessmentResults, loadStudentAssessmentResults, saveAssessmentResult } from '../services/assessmentResults';

const inputStyle = 'w-full border border-slate-200 p-3 rounded-lg bg-slate-50';
const buttonStyle = 'px-4 py-2 rounded-lg border border-slate-200 hover:bg-blue-50 disabled:opacity-50';

const emptyAssessment = () => ({ academic_year: String(CURRENT_ACADEMIC_YEAR), class: '', student: '', title: '', subject: '', assessment_type: '', assessment_date: '', max_marks: '', marks: '' });

function NewResult({ onReview, onBusy }) {
  const [form, setForm] = useState(emptyAssessment);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);
  const [done, setDone] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setStudents([]);
    setLoadError('');
    setLoading(true);
    listResultStudents(supabase, { year: form.academic_year, classNumber: form.class })
      .then(rows => { if (!cancelled) setStudents(rows); })
      .catch(err => { if (!cancelled) setLoadError(err.message || 'Unable to load students.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [form.academic_year, form.class, revision]);

  function change(key, value) {
    setError('');
    setForm(previous => ({ ...previous, [key]: value, ...(['academic_year', 'class'].includes(key) ? { student: '' } : {}) }));
  }

  async function submit(event) {
    event.preventDefault();
    if (lock.current || done) return;
    lock.current = true;
    setSaving(true);
    onBusy(true);
    setError('');
    let assessment = created;
    try {
      const student = students.find(row => String(row.academic_record_id) === form.student);
      if (!student || loading || loadError || Number(student.academic_year) !== Number(form.academic_year) || (form.class && Number(student.class) !== Number(form.class))) {
        throw new Error('Select a student academic record for this year and class.');
      }
      const marks = Number(form.marks);
      const max = Number(form.max_marks);
      // Validate the result before inserting the assessment, avoiding partial writes for bad scores.
      if (!form.marks.trim() || !Number.isFinite(marks) || !Number.isFinite(max) || max <= 0 || marks < 0 || marks > max) {
        throw new Error('Enter marks from zero to the maximum, with maximum marks greater than zero.');
      }
      if (!assessment) {
        assessment = await createAssessment(supabase, { ...form, class: student.class });
        setCreated(assessment);
      }
      await saveAssessmentResult(supabase, assessment, student, { marks: form.marks, maxMarks: form.max_marks });
      setDone(true);
    } catch (err) {
      setError(assessment
        ? `Assessment created, but the result could not be confirmed: ${err.message || 'Save failed.'} Retry the result or open Review & Update to check it.`
        : `${err.message || 'Unable to create assessment.'} If the connection was interrupted, check Review & Update before retrying.`);
    } finally {
      lock.current = false;
      setSaving(false);
      onBusy(false);
    }
  }

  function reset() {
    setCreated(null);
    setDone(false);
    setError('');
    setForm(emptyAssessment());
  }

  return <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><RiFileChartLine className="text-green-600" /> Add New Result</h2>
    {done ? <div className="space-y-4">
      <p role="status" className="p-3 rounded-lg bg-green-50 text-green-800">Assessment and result created successfully.</p>
      <div className="flex flex-wrap gap-2"><button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={() => onReview(created)}>Add marks for more students</button><button className={buttonStyle} onClick={reset}>Create another assessment</button></div>
    </div> : <form onSubmit={submit} className="space-y-6">
      <fieldset disabled={saving || !!created} className="grid sm:grid-cols-3 gap-4">
        <legend className="font-semibold text-slate-700 mb-3">Student scope</legend>
        <label className="text-sm">Academic year<select required className={inputStyle} value={form.academic_year} onChange={event => change('academic_year', event.target.value)}>{Array.from({ length: 101 }, (_, index) => 2000 + index).map(year => <option key={year} value={year}>{year}</option>)}</select></label>
        <label className="text-sm">Class<select className={inputStyle} value={form.class} onChange={event => change('class', event.target.value)}><option value="">All classes</option>{Array.from({ length: 12 }, (_, index) => index + 1).map(number => <option key={number} value={number}>Class {number}</option>)}</select></label>
        <label className="text-sm">Student<select required disabled={loading || !!loadError} className={inputStyle} value={form.student} onChange={event => change('student', event.target.value)}><option value="">Select student</option>{students.map(student => <option key={student.academic_record_id} value={student.academic_record_id}>{student.student_name || 'Name unavailable'} — {student.uid} ? Class {student.class}</option>)}</select></label>
      </fieldset>
      {loading && <p role="status">Loading academic records...</p>}
      {loadError && <p role="alert" className="text-red-700">{loadError} <button type="button" disabled={saving} className={buttonStyle} onClick={() => setRevision(value => value + 1)}>Retry</button></p>}
      {!loading && !loadError && !students.length && <p className="text-slate-500">No academic records for this year and class.</p>}
      <fieldset disabled={saving || !!created} className="grid sm:grid-cols-2 gap-4">
        <legend className="font-semibold text-slate-700 mb-3">Assessment</legend>
        <label className="text-sm">Title<input required className={inputStyle} value={form.title} onChange={event => change('title', event.target.value)} /></label>
        <label className="text-sm">Subject<input className={inputStyle} value={form.subject} onChange={event => change('subject', event.target.value)} /></label>
        <label className="text-sm">Assessment Type<select required className={inputStyle} value={form.assessment_type} onChange={event => change('assessment_type', event.target.value)}><option value="">Select type</option><option value="quiz">Quiz</option><option value="test">Test</option></select></label>
        <label className="text-sm">Assessment Date<input required type="date" className={inputStyle} value={form.assessment_date} onChange={event => change('assessment_date', event.target.value)} /></label>
        <label className="text-sm">Maximum Marks<input required type="number" min="0" step="any" className={inputStyle} value={form.max_marks} onChange={event => change('max_marks', event.target.value)} /></label>
      </fieldset>
      <label className="block text-sm">Marks Obtained<input required disabled={saving} type="number" min="0" max={form.max_marks || undefined} step="any" className={inputStyle} value={form.marks} onChange={event => change('marks', event.target.value)} /></label>
      {error && <p role="alert" className="p-3 rounded-lg bg-red-50 text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button disabled={saving || loading || !!loadError || !form.student} className="px-4 py-3 bg-slate-900 text-white rounded-lg font-bold disabled:opacity-50">{saving ? 'Saving...' : created ? 'Retry result save' : 'Create Assessment & Result'}</button>
        {created && <button type="button" disabled={saving} className={buttonStyle} onClick={() => onReview(created)}>Open assessment in Review &amp; Update</button>}
      </div>
    </form>}
  </div>;
}

export default function ResultsManager() {
  const [mode, setMode] = useState('review');
  const [busy, setBusy] = useState(false);
  const [initialAssessment, setInitialAssessment] = useState(null);
  const [reviewKey, setReviewKey] = useState(0);
  function reviewCreated(assessment) {
    setInitialAssessment(assessment);
    setReviewKey(value => value + 1);
    setMode('review');
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap gap-2" aria-label="Results mode">
      {[['review', 'Review & Update'], ['add', 'Add New Result']].map(([value, label]) => <button key={value} disabled={busy} aria-pressed={mode === value} onClick={() => setMode(value)} className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${mode === value ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{label}</button>)}
    </div>
    <div hidden={mode !== 'review'}><ReviewResults key={reviewKey} initialAssessment={initialAssessment} onBusy={setBusy} /></div>
    <div hidden={mode !== 'add'}><NewResult onReview={reviewCreated} onBusy={setBusy} /></div>
  </div>;
}

function ReviewResults({ initialAssessment, onBusy }) {
  const [studentId, setStudentId] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [studentResultsLoading, setStudentResultsLoading] = useState(false);
  const [studentResultsError, setStudentResultsError] = useState('');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState('');
  const [filters, setFilters] = useState({ year: String(initialAssessment?.academic_year ?? CURRENT_ACADEMIC_YEAR), classNumber: initialAssessment ? String(initialAssessment.class) : '' });
  const [subject, setSubject] = useState('');
  const [assessmentId, setAssessmentId] = useState(initialAssessment ? String(initialAssessment.id) : '');
  const [assessments, setAssessments] = useState([]);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [error, setError] = useState('');
  const [rosterError, setRosterError] = useState('');
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');
  const [revision, setRevision] = useState(0);
  const [rosterRevision, setRosterRevision] = useState(0);
  const [editing, setEditing] = useState(null);
  const [fields, setFields] = useState({ marks: '', maxMarks: '' });
  const [saving, setSaving] = useState(false);
  const mutationLock = useRef(false);
  const mounted = useRef(false);
  const assessment = assessments.find(item => String(item.id) === assessmentId);
  const selectedStudent = students.find(row => String(row.academic_record_id) === studentId);

  useEffect(() => {
    let cancelled = false;
    setStudentResults([]);
    setStudentResultsError('');
    setStudentResultsLoading(Boolean(selectedStudent));
    if (selectedStudent) loadStudentAssessmentResults(supabase, selectedStudent).then(data => {
      if (!cancelled) setStudentResults(data);
    }).catch(err => {
      if (!cancelled) setStudentResultsError(err.message || 'Unable to load student results.');
    }).finally(() => { if (!cancelled) setStudentResultsLoading(false); });
    return () => { cancelled = true; };
  }, [selectedStudent, rosterRevision]);

  useEffect(() => {
    let cancelled = false;
    setStudentsLoading(true);
    setStudentsError('');
    setStudents([]);
    listResultStudents(supabase, filters).then(data => {
      if (!cancelled) setStudents(data);
    }).catch(err => {
      if (!cancelled) setStudentsError(err.message || 'Unable to load students.');
    }).finally(() => { if (!cancelled) setStudentsLoading(false); });
    return () => { cancelled = true; };
  }, [filters, revision]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setAssessments([]);
    listAssessments(supabase, filters).then(data => {
      if (!cancelled) setAssessments(data);
    }).catch(err => {
      if (!cancelled) setError(err.message || 'Unable to load assessments.');
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters, revision]);

  useEffect(() => {
    let cancelled = false;
    setRows([]);
    setRosterError('');
    setRosterLoading(Boolean(assessment) && !studentId);
    if (assessment && !studentId) {
      loadAssessmentResults(supabase, assessment).then(data => {
        if (!cancelled) setRows(data);
      }).catch(err => {
        if (!cancelled) setRosterError(err.message || 'Unable to load results.');
      }).finally(() => { if (!cancelled) setRosterLoading(false); });
    }
    return () => { cancelled = true; };
  }, [assessment, rosterRevision, studentId]);

  function clearSelection(keepStudent = false) {
    if (!keepStudent) setStudentId('');
    setAssessmentId('');
    setRows([]);
    setEditing(null);
    setActionError('');
    setRosterError('');
    setSuccess('');
  }

  function edit(row, targetAssessment = assessment) {
    setEditing(row);
    setFields({ marks: row.result?.marks_obtained ?? '', maxMarks: row.result?.max_marks ?? targetAssessment.max_marks ?? '' });
    setActionError('');
    setSuccess('');
  }

  async function submit(event) {
    event.preventDefault();
    if (mutationLock.current || !editing || !assessment) return;
    mutationLock.current = true;
    setSaving(true);
    onBusy(true);
    setActionError('');
    try {
      await saveAssessmentResult(supabase, assessment, editing, fields);
      if (mounted.current) {
        setSuccess(`Result saved for ${editing.student_name} (${editing.uid}), Class ${editing.class}, ${editing.academic_year}.`);
        setEditing(null);
        setRows([]);
        setRosterLoading(true);
        setRosterRevision(value => value + 1);
      }
    } catch (err) {
      if (mounted.current) setActionError(`${err.message || 'Unable to save result.'} If the connection was interrupted, refresh to verify before retrying.`);
    } finally {
      mutationLock.current = false;
      onBusy(false);
      if (mounted.current) setSaving(false);
    }
  }

  const subjects = [...new Set(assessments.map(item => item.subject).filter(Boolean))].sort();

  const visibleAssessments = assessments.filter(item => (!subject || item.subject === subject) &&
    (!selectedStudent || Number(item.class) === Number(selectedStudent.class)));
  const visibleRows = searchAcademicRecords(rows.filter(row => !studentId || String(row.academic_record_id) === studentId), search);

  return <div className="space-y-6">
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><RiFileChartLine className="text-green-600" /> Class &amp; Results</h2>
        <button className={buttonStyle} disabled={saving || loading} onClick={() => { clearSelection(); setSubject(''); setRevision(value => value + 1); }}>Refresh</button>
      </div>
      <fieldset disabled={saving} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <label className="text-sm">Academic year<select className={inputStyle} value={filters.year} onChange={event => { clearSelection(); setSubject(''); setFilters(previous => ({ ...previous, year: event.target.value })); }}>
          {Array.from({ length: 101 }, (_, index) => 2000 + index).map(year => <option key={year} value={year}>{year}{year === CURRENT_ACADEMIC_YEAR ? ' (current)' : ''}</option>)}
        </select></label>
        <label className="text-sm">Class<select className={inputStyle} value={filters.classNumber} onChange={event => { clearSelection(); setSubject(''); setFilters(previous => ({ ...previous, classNumber: event.target.value })); }}>
          <option value="">All classes</option>{Array.from({ length: 12 }, (_, index) => index + 1).map(number => <option key={number} value={number}>Class {number}</option>)}
        </select></label>
        <label className="text-sm">Student<select className={inputStyle} disabled={studentsLoading || !!studentsError} value={studentId} onChange={event => {
          clearSelection(true);
          setStudentId(event.target.value);
          setSubject('');
          setSearch('');
          setStudentResults([]);
          setStudentResultsLoading(Boolean(event.target.value));
        }}>
          <option value="">All students</option>{students.map(student => <option key={student.academic_record_id} value={student.academic_record_id}>{student.student_name || 'Name unavailable'} — {student.uid} — Class {student.class}</option>)}
        </select></label>
        <label className="text-sm">Subject<select className={inputStyle} disabled={loading || !!error} value={subject} onChange={event => { clearSelection(true); setSubject(event.target.value); }}>
          <option value="">All subjects</option>{subjects.map(name => <option key={name} value={name}>{name}</option>)}
        </select></label>
        {!studentId && <label className="text-sm">Assessment<select className={inputStyle} disabled={loading || !!error} value={assessmentId} onChange={event => { clearSelection(true); setRosterLoading(Boolean(event.target.value)); setAssessmentId(event.target.value); }}>
          <option value="">Select assessment</option>{visibleAssessments.map(item => <option key={item.id} value={item.id}>{item.title} — Class {item.class} — {item.subject || 'General'} — {item.assessment_date || 'Undated'} ({item.status})</option>)}
        </select></label>}
      </fieldset>
      {studentsLoading && <p role="status" className="mt-4">Loading students...</p>}
      {studentsError && <p role="alert" className="mt-4 text-red-700">{studentsError} Use Refresh to retry.</p>}
      {selectedStudent && <p className="mt-4 text-sm text-slate-600">{selectedStudent.student_name || 'Name unavailable'} — {selectedStudent.uid} · Class {selectedStudent.class} · {selectedStudent.academic_year}. All assessments for this academic record are listed below.</p>}
      {loading && <p role="status" className="mt-4">Loading assessments...</p>}
      {error && <p role="alert" className="mt-4 text-red-700">Unable to load assessments: {error} Use Refresh to retry.</p>}
      {!loading && !error && !visibleAssessments.length && <p className="mt-4 text-slate-500">No assessments match this academic year, class and subject.</p>}
    </div>

    {success && <p role="status" className="p-3 rounded-lg bg-green-50 text-green-800">{success}</p>}
    {selectedStudent && <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="font-bold mb-4 text-slate-700">Student Assessments — {selectedStudent.academic_year}</h3>
      {studentResultsLoading ? <p role="status">Loading all assessments and results...</p> : studentResultsError ? <p role="alert" className="text-red-700">{studentResultsError} <button disabled={saving} className={buttonStyle} onClick={() => setRosterRevision(value => value + 1)}>Retry</button></p> : <>
        {!studentResults.filter(item => !subject || item.assessment.subject === subject).length && <p className="text-slate-500">No assessments match this student's year, class and subject.</p>}
        <div className="overflow-x-auto"><table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="p-3">Assessment</th><th className="p-3">Subject / Date</th><th className="p-3">Score / Status</th><th className="p-3">Action</th></tr></thead>
          <tbody className="divide-y">{studentResults.filter(item => !subject || item.assessment.subject === subject).map(({ assessment: item, result }) => <tr key={item.id} className="hover:bg-slate-50">
            <td className="p-3 font-medium">{item.title}<span className="block text-xs text-slate-500">{item.assessment_type} · {item.status}</span></td>
            <td className="p-3">{item.subject || 'General'}<span className="block text-slate-500">{item.assessment_date || 'Undated'}</span></td>
            <td className="p-3 text-blue-600 font-bold">{result ? `${result.marks_obtained ?? '—'}/${result.max_marks ?? item.max_marks ?? '—'}` : 'Not entered'}<span className="block text-xs font-normal text-slate-500">{result?.status}</span></td>
            <td className="p-3"><button disabled={saving} className={buttonStyle} onClick={() => {
              setAssessments(previous => previous.some(value => String(value.id) === String(item.id)) ? previous : [...previous, item]);
              setAssessmentId(String(item.id));
              edit({ ...selectedStudent, result }, item);
            }}>{result ? 'Edit Result' : 'Add Result'}</button></td>
          </tr>)}</tbody>
        </table></div>
      </>}
    </div>}
    {assessment && (!studentId || editing) && <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-xl font-bold text-slate-800 mb-2">{assessment.title}</h3>
        <p className="text-sm text-slate-500 mb-4">Class {assessment.class} · {assessment.academic_year} · {assessment.subject || 'General'} · {assessment.assessment_type} · {assessment.assessment_date || 'Undated'} · {assessment.status}</p>
        <p className="text-sm text-slate-500 mb-4">Results saved here are graded. Students see graded results when the assessment is published.</p>
        {editing ? <form onSubmit={submit} className="space-y-4">
          <p className="font-semibold">{editing.student_name}<span className="block text-sm font-normal text-blue-600">{editing.uid} · Class {editing.class} · {editing.academic_year}</span></p>
          <fieldset disabled={saving} className="space-y-4">
            <label className="block text-sm">Marks obtained<input required type="number" min="0" max={fields.maxMarks || undefined} step="any" className={inputStyle} value={fields.marks} onChange={event => setFields(previous => ({ ...previous, marks: event.target.value }))} /></label>
            <label className="block text-sm">Maximum marks<input required type="number" min="0.000001" step="any" className={inputStyle} value={fields.maxMarks} onChange={event => setFields(previous => ({ ...previous, maxMarks: event.target.value }))} /></label>
            <p className="text-xs text-slate-500">Maximum marks apply to this result. Assessment default: {assessment.max_marks ?? 'Not set'}.</p>
            {editing.result && <p className="text-sm">Current status: {editing.result.status}. Saving sets this result to graded.</p>}
            {actionError && <p role="alert" className="text-red-700">{actionError}</p>}
            <div className="flex gap-2"><button className="flex-1 bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 font-bold disabled:opacity-50">{saving ? 'Saving...' : editing.result ? 'Update Result' : 'Submit Result'}</button><button type="button" className={buttonStyle} onClick={() => { setEditing(null); setActionError(''); }}>Cancel</button></div>
          </fieldset>
        </form> : <p className="text-slate-500">Select a student from the roster to add or edit a result.</p>}
      </div>
      {!studentId && <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold mb-4 text-slate-700">Assessment Results</h3>
        <label className="block text-sm mb-4">Search name or academic UID<input type="search" className={inputStyle} value={search} onChange={event => setSearch(event.target.value)} /></label>
        {rosterLoading ? <p role="status">Loading academic records and results...</p> : rosterError ? <p role="alert" className="text-red-700">{rosterError} <button className={buttonStyle} onClick={() => setRosterRevision(value => value + 1)}>Retry</button></p> : <>
          <p className="text-sm text-slate-500 mb-3">{visibleRows.length} academic records · All enrollment statuses included</p>
          {!visibleRows.length && <p className="text-slate-500">No academic records match this assessment and search.</p>}
          <div className="overflow-auto max-h-[500px]"><table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b sticky top-0"><tr><th className="p-3">Student / Academic UID</th><th className="p-3">Class / Year</th><th className="p-3">Score / Status</th><th className="p-3">Action</th></tr></thead>
            <tbody className="divide-y">{visibleRows.map(row => <tr key={row.academic_record_id} className="hover:bg-slate-50">
              <td className="p-3 font-medium">{row.student_name}<span className="block font-mono text-xs text-blue-600">{row.uid}</span><span className="text-xs text-slate-500">{row.status}</span></td>
              <td className="p-3">Class {row.class}<span className="block text-slate-500">{row.academic_year}</span></td>
              <td className="p-3 font-bold text-blue-600">{row.result ? `${row.result.marks_obtained ?? '—'}/${row.result.max_marks ?? assessment.max_marks ?? '—'}` : 'Not entered'}{row.result && <span className="block text-xs font-normal text-slate-500">{row.result.status}</span>}</td>
              <td className="p-3"><button disabled={saving} aria-label={`${row.result ? 'Edit' : 'Add'} result for ${row.student_name}, ${row.uid}`} onClick={() => edit(row)} className="text-blue-500 hover:bg-blue-100 p-2 rounded disabled:opacity-50"><RiEditLine className="inline" /> {row.result ? 'Edit' : 'Add'}</button></td>
            </tr>)}</tbody>
          </table></div>
        </>}
      </div>}
    </div>}
  </div>;
}

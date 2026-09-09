import { useEffect, useRef, useState } from 'react';
import { RiGroupLine } from 'react-icons/ri';
import { supabase } from '../supabaseClient';
import { CURRENT_ACADEMIC_YEAR } from '../config/academicYear';
import {
  ACADEMIC_STATUSES, academicHistory, closeAcademicRecord, editAcademicRecord,
  listAcademicRecords, promoteAcademicRecord, searchAcademicRecords,
} from '../services/academicRecords';

const inputStyle = 'w-full border border-slate-200 p-2 rounded-lg bg-white';
const buttonStyle = 'px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 hover:bg-blue-50 disabled:opacity-50';

export default function ClassManager() {
  const [filters, setFilters] = useState({ year: String(CURRENT_ACADEMIC_YEAR), classNumber: '', status: 'active' });
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [revision, setRevision] = useState(0);
  const [view, setView] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyRevision, setHistoryRevision] = useState(0);
  const [fields, setFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const mutationLock = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setRows([]);
    listAcademicRecords(supabase, filters).then(data => {
      if (!cancelled) setRows(data);
    }).catch(err => {
      if (!cancelled) setError(err.message || 'Unable to load academic records.');
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters, revision]);

  const historyStudentId = view?.mode === 'history' ? view.row.student_id : null;
  useEffect(() => {
    if (historyStudentId == null) return;
    let cancelled = false;
    setHistory([]);
    setHistoryError('');
    setHistoryLoading(true);
    academicHistory(supabase, historyStudentId).then(data => {
      if (!cancelled) setHistory(data);
    }).catch(err => {
      if (!cancelled) setHistoryError(err.message || 'Unable to load academic history.');
    }).finally(() => { if (!cancelled) setHistoryLoading(false); });
    return () => { cancelled = true; };
  }, [historyStudentId, historyRevision]);

  function open(mode, row) {
    setActionError('');
    setFields({
      academic_year: row.academic_year + 1,
      class: row.class < 12 ? row.class + 1 : '',
      board: row.board || '',
      school_name: row.school_name || '',
      subjects: (row.interested_subjects || []).join(', '),
    });
    setView({ mode, row });
  }

  async function submit(event) {
    event.preventDefault();
    if (mutationLock.current) return;
    mutationLock.current = true;
    setSaving(true);
    setActionError('');
    setSuccess('');
    const { row, mode } = view;
    try {
      const academic = {
        board: fields.board.trim(), school_name: fields.school_name.trim(),
        interested_subjects: fields.subjects.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (mode === 'promote') {
        const next = await promoteAcademicRecord(supabase, row, {
          ...academic, academic_year: fields.academic_year, class: fields.class,
        });
        setFilters(prev => ({ ...prev, year: String(fields.academic_year), classNumber: '', status: 'active' }));
        setSuccess(`Promotion successful${next?.uid ? `: ${next.uid}` : ''}. Showing the destination academic year.`);
      } else if (mode === 'edit') {
        await editAcademicRecord(supabase, row, academic);
        setSuccess('Academic record updated.');
      } else {
        await closeAcademicRecord(supabase, row, mode);
        setSuccess(`Academic record marked ${mode}. History has been preserved.`);
      }
      setView(null);
      setRevision(value => value + 1);
    } catch (err) {
      setActionError(err.message || 'The operation could not be completed. Refresh before retrying if the connection was interrupted.');
    } finally {
      mutationLock.current = false;
      setSaving(false);
    }
  }

  const visible = searchAcademicRecords(rows, search);
  const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const setField = (key, value) => setFields(prev => ({ ...prev, [key]: value }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><RiGroupLine className="text-blue-500" /> Class Manager</h2>
        <button className={buttonStyle} disabled={loading || saving} onClick={() => setRevision(v => v + 1)}>Refresh</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <label className="text-sm">Academic year
          <select className={inputStyle} value={filters.year} onChange={e => setFilter('year', e.target.value)}>
            <option value="">All years</option>
            {Array.from({ length: 101 }, (_, i) => 2000 + i).map(year => <option key={year} value={year}>{year}{year === CURRENT_ACADEMIC_YEAR ? ' (current)' : ''}</option>)}
          </select>
        </label>
        <label className="text-sm">Class
          <select className={inputStyle} value={filters.classNumber} onChange={e => setFilter('classNumber', e.target.value)}>
            <option value="">All classes</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Class {n}</option>)}
          </select>
        </label>
        <label className="text-sm">Status
          <select className={inputStyle} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            {ACADEMIC_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label className="text-sm">Search name or UID
          <input type="search" className={inputStyle} value={search} onChange={e => setSearch(e.target.value)} placeholder="Student name or UID" />
        </label>
      </div>
      {success && <p role="status" className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg">{success}</p>}
      {error && <p role="alert" className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">Unable to load Class Manager: {error} <button className={buttonStyle} onClick={() => setRevision(v => v + 1)}>Retry</button></p>}
      {loading ? <p role="status">Loading academic records...</p> : !error && <>
        <p className="text-sm text-slate-500 mb-4">{visible.length} academic records</p>
        {visible.length === 0 && <p className="p-8 text-center text-slate-500">No academic records match these filters.</p>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(row => <div key={row.academic_record_id} className="bg-white border border-slate-100 p-4 rounded-xl hover:shadow-md hover:border-blue-300 transition">
            <div className="flex items-center gap-4">
              {row.photo_url ? <img src={row.photo_url} alt={`${row.student_name || 'Student'} profile`} className="w-12 h-12 rounded-full object-cover border" /> : <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">{row.student_name?.[0] || '?'}</div>}
              <div className="min-w-0"><p className="font-bold text-slate-800 break-words">{row.student_name}</p><p className="text-sm font-mono text-blue-600">{row.uid}</p></div>
            </div>
            <div className="mt-3 text-sm text-slate-600 space-y-1">
              <p>Class {row.class} · {row.academic_year} · {row.board || 'Board not set'}</p>
              <p>Status: <span className="font-semibold">{row.status}</span></p>
              <p>Contact: {row.contact_number || 'Not provided'}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className={buttonStyle} onClick={() => open('profile', row)}>View Profile</button>
              <button className={buttonStyle} onClick={() => open('history', row)}>Academic History</button>
              {row.status === 'active' && <>
                <button className={buttonStyle} onClick={() => open('edit', row)}>Edit Academic Record</button>
                <button className={`${buttonStyle} text-blue-600`} onClick={() => open('promote', row)}>Promote</button>
                <button className={buttonStyle} onClick={() => open('completed', row)}>Mark Completed</button>
                <button className={`${buttonStyle} text-red-600`} onClick={() => open('withdrawn', row)}>Withdraw</button>
              </>}
            </div>
          </div>)}
        </div>
      </>}
      {view && <RecordDialog title={`${({ profile: 'Student Profile', history: 'Academic History', edit: 'Edit Academic Record', promote: 'Promote Student', completed: 'Mark Completed', withdrawn: 'Withdraw Student' })[view.mode]}: ${view.row.student_name}`} saving={saving} onClose={() => setView(null)}>
        <p className="text-sm text-slate-500 mb-4">{view.row.uid} · Class {view.row.class} · {view.row.academic_year} · {view.row.status}</p>
        {view.mode === 'profile' ? <dl className="grid sm:grid-cols-2 gap-4">
          {Object.entries({ Name: view.row.student_name, Contact: view.row.contact_number, 'Parent contact': view.row.parent_contact_number, Email: view.row.email, Board: view.row.board, School: view.row.school_name, Subjects: view.row.interested_subjects?.join(', '), 'Enrolled on': view.row.enrolled_at, 'Completed on': view.row.completed_at }).map(([label, value]) => <div key={label}><dt className="text-xs uppercase text-slate-500">{label}</dt><dd className="break-words">{value || 'Not provided'}</dd></div>)}
        </dl> : view.mode === 'history' ? <>
          {historyLoading && <p role="status">Loading academic history...</p>}
          {historyError && <p role="alert" className="text-red-700">{historyError} <button className={buttonStyle} onClick={() => setHistoryRevision(v => v + 1)}>Retry</button></p>}
          {!historyLoading && !historyError && (history.length ? <div className="space-y-3">{history.map(record => <div key={record.academic_record_id} className="border rounded-xl p-3">
            <p className="font-semibold">{record.academic_year} · Class {record.class} · {record.status}</p>
            <p className="font-mono text-sm text-blue-600">{record.uid}</p>
            <p className="text-sm">{record.board || 'Board not set'} · {record.school_name || 'School not set'}</p>
            <p className="text-sm">Enrolled: {record.enrolled_at} · Completed: {record.completed_at || '—'}</p>
            {record.promoted_from_id != null && <p className="text-sm text-slate-500">Promoted from {history.find(previous => previous.academic_record_id === record.promoted_from_id)?.uid || `academic record ${record.promoted_from_id}`}</p>}
          </div>)}</div> : <p>No academic history available.</p>)}
        </> : <form onSubmit={submit} className="space-y-4">
          {view.mode === 'promote' && <>
            <p className="text-sm">Promotion creates a new academic record and UID. This record will be preserved as promoted.</p>
            <label className="block">New academic year<input required type="number" min={Math.max(2000, view.row.academic_year + 1)} max="2100" className={inputStyle} value={fields.academic_year} onChange={e => setField('academic_year', e.target.value)} disabled={saving} /></label>
            <label className="block">New class<select required className={inputStyle} value={fields.class} onChange={e => setField('class', e.target.value)} disabled={saving}>
              <option value="">Select class</option>{Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Class {n}</option>)}
            </select></label>
          </>}
          {['edit', 'promote'].includes(view.mode) ? <>
            <label className="block">Board<input className={inputStyle} value={fields.board} onChange={e => setField('board', e.target.value)} disabled={saving} /></label>
            <label className="block">School<input className={inputStyle} value={fields.school_name} onChange={e => setField('school_name', e.target.value)} disabled={saving} /></label>
            <label className="block">Interested subjects (comma separated)<input className={inputStyle} value={fields.subjects} onChange={e => setField('subjects', e.target.value)} disabled={saving} /></label>
          </> : <p>Mark this academic record as {view.mode}? Its academic history will be retained. This action cannot be reversed from Class Manager.</p>}
          {actionError && <p role="alert" className="text-red-700">{actionError}</p>}
          <div className="flex justify-end gap-2"><button type="button" className={buttonStyle} disabled={saving} onClick={() => setView(null)}>Cancel</button><button className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50" disabled={saving}>{saving ? 'Saving...' : view.mode === 'promote' ? 'Confirm Promotion' : view.mode === 'edit' ? 'Save Changes' : 'Confirm'}</button></div>
        </form>}
      </RecordDialog>}
    </div>
  );
}

function RecordDialog({ title, saving, onClose, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element.showModal();
    return () => { element.close(); previousFocus?.focus(); };
  }, []);
  return <dialog ref={dialog} aria-labelledby="academic-dialog-title" onCancel={event => { event.preventDefault(); if (!saving) onClose(); }} className="m-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 backdrop:bg-black/40">
    <div className="flex items-start justify-between gap-4 mb-4"><h2 id="academic-dialog-title" className="text-xl font-bold">{title}</h2><button type="button" className={buttonStyle} disabled={saving} onClick={onClose}>Close</button></div>
    {children}
  </dialog>;
}

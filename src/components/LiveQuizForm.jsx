import React, { useEffect, useMemo, useState } from 'react';
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiExternalLinkLine,
  RiCloseLine,
} from 'react-icons/ri';

import { supabase } from '../supabaseClient';
import PostActionNotificationDialog from './admin/PostActionNotificationDialog';
import { listNotificationStudents } from '../services/notifications';
import { CURRENT_ACADEMIC_YEAR } from '../config/academicYear';

const initialForm = {
  title: '',
  subject: '',
  chapter: '',
  class: '',
  board: 'CBSE',
  url: '',
  provider: 'google_form',
  status: 'published',
};

const LiveQuizForm = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [notificationPrompt, setNotificationPrompt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filterClass, setFilterClass] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
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
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setQuizzes(data ?? []);
    } catch (err) {
      console.error('Failed to load quiz links:', err);
      setError(err.message || 'Unable to load quizzes.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const prepareQuizNotification = async ({
    title,
    subject,
    chapter,
    classNumber,
    isUpdate = false,
  }) => {
    try {
      const students = await listNotificationStudents(
        supabase,
        {
          year: CURRENT_ACADEMIC_YEAR,
          classNumber: Number(classNumber),
        }
      );

      const activeStudents = students.filter((student) => {
        const academicStatus =
          student.academicStatus ?? student.status;

        return academicStatus === 'active';
      });

      setNotificationPrompt({
        title,
        subject,
        chapter,
        classNumber: Number(classNumber),
        isUpdate,
        recipients: activeStudents.map((student) => ({
          studentId: student.studentId,
          academicRecordId: student.academicRecordId,
        })),
      });
    } catch (err) {
      console.error(
        'Unable to prepare quiz notification:',
        err
      );

      // The quiz has already been saved.
      // Notification preparation must not roll it back.
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const parsedClass = Number(form.class);

      const savedQuiz = {
        title: form.title.trim(),
        subject: form.subject.trim(),
        chapter: form.chapter.trim() || null,
        classNumber: parsedClass,
        status: form.status,
        isUpdate: Boolean(editingId),
      };

      if (
        !form.title.trim() ||
        !form.subject.trim() ||
        !form.class ||
        !form.url.trim()
      ) {
        throw new Error(
          'Title, subject, class and quiz URL are required.'
        );
      }

      if (
        !Number.isInteger(parsedClass) ||
        parsedClass < 1 ||
        parsedClass > 12
      ) {
        throw new Error('Class must be between 1 and 12.');
      }

      const payload = {
        title: form.title.trim(),
        subject: form.subject.trim(),
        chapter: form.chapter.trim() || null,
        class: parsedClass,
        board: form.board || null,

        // Existing migrated links are global across academic years.
        academic_year: null,

        url: form.url.trim(),
        provider: form.provider,
        status: form.status,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from('quiz_links')
          .update(payload)
          .eq('id', editingId);

        if (updateError) throw updateError;

        setSuccess('Quiz updated successfully.');
      } else {
        const { error: insertError } = await supabase
          .from('quiz_links')
          .insert(payload);

        if (insertError) throw insertError;

        setSuccess('Quiz added successfully.');
      }

      // Only published quizzes should offer a student notification.
      if (savedQuiz.status === 'published') {
        await prepareQuizNotification(savedQuiz);
      }

      resetForm();
      await fetchQuizzes();
    } catch (err) {
      console.error('Quiz save failed:', err);

      setError(
        err.message ||
          'Unable to save quiz.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (quiz) => {
    setEditingId(quiz.id);

    setForm({
      title: quiz.title || '',
      subject: quiz.subject || '',
      chapter: quiz.chapter || '',
      class: String(quiz.class || ''),
      board: quiz.board || 'CBSE',
      url: quiz.url || '',
      provider: quiz.provider || 'google_form',
      status: quiz.status || 'published',
    });

    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (quiz) => {
    const confirmed = window.confirm(
      `Delete "${quiz.title}" - ${quiz.chapter || quiz.subject}?`
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    try {
      const { error: deleteError } = await supabase
        .from('quiz_links')
        .delete()
        .eq('id', quiz.id);

      if (deleteError) throw deleteError;

      setSuccess('Quiz deleted successfully.');

      if (editingId === quiz.id) {
        resetForm();
      }

      await fetchQuizzes();
    } catch (err) {
      console.error('Quiz delete failed:', err);

      setError(
        err.message ||
          'Unable to delete quiz.'
      );
    }
  };

  const subjects = useMemo(
    () =>
      [
        ...new Set(
          quizzes
            .map((quiz) => quiz.subject)
            .filter(Boolean)
        ),
      ].sort(),
    [quizzes]
  );

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      const classMatches =
        filterClass === 'All' ||
        String(quiz.class) === filterClass;

      const subjectMatches =
        filterSubject === 'All' ||
        quiz.subject === filterSubject;

      return classMatches && subjectMatches;
    });
  }, [
    quizzes,
    filterClass,
    filterSubject,
  ]);

  return (
    <>
      <div className="space-y-6">

      {/* FORM */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {editingId
                ? 'Edit External Quiz'
                : 'Add External Quiz'}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Manage Google Form and external quiz links.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <RiCloseLine size={20} />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Science"
              className="w-full px-4 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subject
            </label>

            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              placeholder="Science"
              className="w-full px-4 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Chapter
            </label>

            <input
              name="chapter"
              value={form.chapter}
              onChange={handleChange}
              placeholder="Chapter 2"
              className="w-full px-4 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Class
            </label>

            <select
              name="class"
              value={form.class}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border rounded-xl bg-white"
            >
              <option value="">
                Select Class
              </option>

              {Array.from(
                { length: 12 },
                (_, index) => index + 1
              ).map((classNumber) => (
                <option
                  key={classNumber}
                  value={classNumber}
                >
                  Class {classNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Board
            </label>

            <select
              name="board"
              value={form.board}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl bg-white"
            >
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">
                State Board
              </option>
              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Provider
            </label>

            <select
              name="provider"
              value={form.provider}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl bg-white"
            >
              <option value="google_form">
                Google Form
              </option>

              <option value="external">
                External
              </option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quiz URL
            </label>

            <input
              type="url"
              name="url"
              value={form.url}
              onChange={handleChange}
              required
              placeholder="https://forms.gle/..."
              className="w-full px-4 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded-xl bg-white"
            >
              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="archived">
                Archived
              </option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-medium flex justify-center items-center gap-2"
            >
              {editingId ? (
                <RiEditLine />
              ) : (
                <RiAddLine />
              )}

              {saving
                ? 'Saving...'
                : editingId
                ? 'Update Quiz'
                : 'Add Quiz'}
            </button>
          </div>
        </form>
      </div>

      {/* QUIZ LIST */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <h3 className="font-bold text-slate-800">
            External Quizzes ({filteredQuizzes.length})
          </h3>

          <div className="flex gap-2">
            <select
              value={filterClass}
              onChange={(event) =>
                setFilterClass(event.target.value)
              }
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="All">
                All Classes
              </option>

              {Array.from(
                { length: 12 },
                (_, index) => index + 1
              ).map((classNumber) => (
                <option
                  key={classNumber}
                  value={String(classNumber)}
                >
                  Class {classNumber}
                </option>
              ))}
            </select>

            <select
              value={filterSubject}
              onChange={(event) =>
                setFilterSubject(event.target.value)
              }
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="All">
                All Subjects
              </option>

              {subjects.map((subject) => (
                <option
                  key={subject}
                  value={subject}
                >
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-10 text-slate-400">
            Loading quizzes...
          </p>
        ) : filteredQuizzes.length === 0 ? (
          <p className="text-center py-10 text-slate-400">
            No quiz links found.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-semibold text-slate-800">
                    {quiz.title}
                  </h4>

                  <div className="text-sm text-slate-500 mt-1">
                    Class {quiz.class}
                    {' • '}
                    {quiz.subject}

                    {quiz.chapter &&
                      ` • ${quiz.chapter}`}

                    {quiz.board &&
                      ` • ${quiz.board}`}
                  </div>

                  <div className="mt-2 flex gap-2">
                    <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-md">
                      {quiz.provider}
                    </span>

                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                      {quiz.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={quiz.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                    title="Open quiz"
                  >
                    <RiExternalLinkLine />
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(quiz)
                    }
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit quiz"
                  >
                    <RiEditLine />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(quiz)
                    }
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete quiz"
                  >
                    <RiDeleteBinLine />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      <PostActionNotificationDialog
        open={Boolean(notificationPrompt)}
        onClose={() => setNotificationPrompt(null)}
        type="quiz"
        priority="normal"
        title={
          notificationPrompt
            ? notificationPrompt.isUpdate
              ? `${notificationPrompt.title} Quiz Updated`
              : `New Quiz: ${notificationPrompt.title}`
            : ''
        }
        body={
          notificationPrompt
            ? `${notificationPrompt.subject}${
                notificationPrompt.chapter
                  ? ` • ${notificationPrompt.chapter}`
                  : ''
              } quiz is now available for Class ${notificationPrompt.classNumber}.`
            : ''
        }
        actionUrl="/student-dashboard?tab=quiz"
        recipients={notificationPrompt?.recipients ?? []}
        contextLabel={
          notificationPrompt
            ? `Class ${notificationPrompt.classNumber} • ${CURRENT_ACADEMIC_YEAR}`
            : ''
        }
      />
    </>
  );
};

export default LiveQuizForm;
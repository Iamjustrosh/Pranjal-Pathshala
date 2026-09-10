
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  RiDeleteBinLine,
  RiBookOpenLine,
  RiEditLine,
  RiLinkM,
} from 'react-icons/ri';

const StudyMaterialForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    class: '10',
    board: 'CBSE',
    file: null,
    link: '',
  });

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filterClass, setFilterClass] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMaterials(data || []);
    } catch (error) {
      console.error('Supabase fetch error:', error);
      alert('Failed to load study materials: ' + error.message);
    }
  };

  const uploadMaterialFile = async (file) => {
    const safeFileName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    );

    const filePath = `${Date.now()}_${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('study-materials')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('study-materials')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('Could not generate public file URL.');
    }

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url = formData.link?.trim() || '';

      if (formData.file) {
        url = await uploadMaterialFile(formData.file);
      }

      if (!url) {
        throw new Error('Please upload a file or provide a material URL.');
      }

      const payload = {
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        class: String(formData.class || '10'),
        board: formData.board || 'CBSE',
        url,

        // Legacy/current materials are global across academic years.
        academic_year: null,

        description: null,
        material_type: 'other',
        status: 'published',

        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from('materials')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;

        alert('Updated!');
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('materials')
          .insert(payload);

        if (error) throw error;

        alert('Uploaded!');
      }

      setFormData({
        title: '',
        subject: '',
        class: '10',
        board: 'CBSE',
        file: null,
        link: '',
      });

      await fetchMaterials();
    } catch (error) {
      console.error('Supabase material save error:', error);
      alert('Error saving: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material) => {
    setEditingId(material.id);

    setFormData({
      title: material.title || '',
      subject: material.subject || '',
      class: String(material.class || '10'),
      board: material.board || 'CBSE',
      link: material.url || '',
      file: null,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this study material?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (editingId === id) {
        setEditingId(null);

        setFormData({
          title: '',
          subject: '',
          class: '10',
          board: 'CBSE',
          file: null,
          link: '',
        });
      }

      await fetchMaterials();
    } catch (error) {
      console.error('Supabase delete error:', error);
      alert('Error deleting material: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);

    setFormData({
      title: '',
      subject: '',
      class: '10',
      board: 'CBSE',
      file: null,
      link: '',
    });
  };

  const classOptions = Array.from(
    { length: 10 },
    (_, i) => (i + 1).toString()
  );

  const subjectOptions = React.useMemo(() => {
    const allSubjectsSet = new Set(
      materials
        .map((m) => (m.subject || '').trim())
        .filter(Boolean)
    );

    return Array.from(allSubjectsSet);
  }, [materials]);

  const filteredMaterials = materials.filter((material) => {
    const matchesClass =
      filterClass === 'All' ||
      String(material.class) === filterClass;

    const matchesSubject =
      filterSubject === 'All' ||
      material.subject === filterSubject;

    return matchesClass && matchesSubject;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <RiBookOpenLine className="text-blue-500" />

          {editingId ? 'Edit Material' : 'Upload Material'}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            className="border p-2 rounded"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
            required
          />

          <input
            className="border p-2 rounded"
            placeholder="Subject"
            value={formData.subject}
            onChange={(e) =>
              setFormData({
                ...formData,
                subject: e.target.value,
              })
            }
            required
          />

          <div className="flex gap-2">
            <select
              className="border p-2 rounded w-1/2 bg-white"
              value={formData.class}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  class: e.target.value,
                })
              }
            >
              {classOptions.map((className) => (
                <option
                  key={className}
                  value={className}
                >
                  Class {className}
                </option>
              ))}
            </select>

            <select
              className="border p-2 rounded w-1/2 bg-white"
              value={formData.board}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  board: e.target.value,
                })
              }
            >
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">
                State Board
              </option>
            </select>
          </div>

          <div className="md:col-span-2 border p-3 rounded bg-gray-50">
            <p className="text-xs font-bold mb-2 text-gray-500">
              Attach File OR Paste Link
            </p>

            <div className="flex gap-4">
              <input
                type="file"
                className="w-1/2 text-sm"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    file: e.target.files?.[0] || null,
                  })
                }
              />

              <input
                className="w-1/2 border p-1 rounded text-sm"
                placeholder="OR Paste URL here"
                value={formData.link}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    link: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="md:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? 'Processing...'
              : editingId
                ? 'Update Material'
                : 'Upload'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="md:col-span-2 bg-gray-200 py-2 rounded"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold mb-4">
          Library
        </h3>

        <div className="mb-4 flex gap-4 flex-wrap">
          <div>
            <label
              className="text-xs font-medium text-slate-500 mr-2"
              htmlFor="filter-class"
            >
              Filter by Class:
            </label>

            <select
              id="filter-class"
              className="border p-1 rounded bg-white text-sm"
              value={filterClass}
              onChange={(e) =>
                setFilterClass(e.target.value)
              }
            >
              <option value="All">All</option>

              {classOptions.map((className) => (
                <option
                  key={className}
                  value={className}
                >
                  {className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="text-xs font-medium text-slate-500 mr-2"
              htmlFor="filter-subject"
            >
              Filter by Subject:
            </label>

            <select
              id="filter-subject"
              className="border p-1 rounded bg-white text-sm"
              value={filterSubject}
              onChange={(e) =>
                setFilterSubject(e.target.value)
              }
            >
              <option value="All">All</option>

              {subjectOptions.map((subject) => (
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

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredMaterials.length === 0 && (
            <div className="p-3 text-center text-slate-400 text-sm border rounded bg-gray-50">
              No study materials found for selected filter.
            </div>
          )}

          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="flex justify-between items-center p-3 border rounded hover:bg-slate-50"
            >
              <div>
                <p className="font-bold text-sm">
                  {material.title}
                </p>

                <p className="text-xs text-slate-500">
                  {material.board || 'CBSE'} | Class{' '}
                  {material.class} | {material.subject}
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={material.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 p-2"
                >
                  <RiLinkM size={18} />
                </a>

                <button
                  onClick={() => handleEdit(material)}
                  className="text-yellow-500 p-2"
                >
                  <RiEditLine size={18} />
                </button>

                <button
                  onClick={() =>
                    handleDelete(material.id)
                  }
                  className="text-red-500 p-2"
                >
                  <RiDeleteBinLine size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyMaterialForm;


import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const StudyMaterialForm = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const [materials, setMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const materialsCollection = collection(db, 'materials');

  // Fetch existing materials
  const fetchMaterials = async () => {
    const snapshot = await getDocs(materialsCollection);
    setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const clearForm = () => {
    setTitle('');
    setSubject('');
    setClassLevel('');
    setFile(null);
    setLink('');
    setEditingId(null);
  };

  const handleUploadOrLink = async (e) => {
    e.preventDefault();

    if (!title || !subject || !classLevel) {
      setMessage('Please fill all fields');
      return;
    }

    let urlToSave = link;

    // If file selected, upload it and get URL
    if (file) {
      const storageRef = ref(storage, `materials/${file.name}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      urlToSave = await getDownloadURL(storageRef);
    }

    try {
      if (editingId) {
        // Update existing doc
        await updateDoc(doc(db, 'materials', editingId), {
          title,
          subject,
          class: classLevel,
          url: urlToSave,
          updatedAt: new Date(),
        });
        setMessage('Study material updated successfully!');
      } else {
        // Add new doc
        await addDoc(materialsCollection, {
          title,
          subject,
          class: classLevel,
          url: urlToSave,
          uploadedAt: new Date(),
        });
        setMessage('Study material uploaded successfully!');
      }
      clearForm();
      fetchMaterials();
    } catch (error) {
      setMessage('Error saving study material: ' + error.message);
    }
  };

  // Delete a material
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this study material?')) {
      await deleteDoc(doc(db, 'materials', id));
      setMessage('Study material deleted!');
      fetchMaterials();
    }
  };

  // Load material data into form for editing
  const handleEdit = (material) => {
    setTitle(material.title);
    setSubject(material.subject);
    setClassLevel(material.class);
    setLink(material.url);
    setEditingId(material.id);
    setFile(null); // clear file input when editing
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold">{editingId ? 'Edit' : 'Upload'} Study Material</h2>
      {message && <p className="text-green-600">{message}</p>}
      <form onSubmit={handleUploadOrLink} className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Class"
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value)}
          required
          className="border p-2 w-full rounded"
        />

        <p className="font-semibold">Either upload a file OR enter an external link:</p>
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setLink('');
          }}
          className="border p-2 w-full rounded"
          disabled={link !== ''}
        />
        <input
          type="url"
          placeholder="Or enter external link here"
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            if (e.target.value) setFile(null);
          }}
          className="border p-2 w-full rounded"
          disabled={file !== null}
        />

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? 'Update' : 'Upload'}
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="bg-gray-400 text-black px-4 py-2 rounded hover:bg-gray-500"
          >
            Clear
          </button>
        </div>
      </form>

      <hr className="my-6" />

      <h3 className="text-lg font-semibold">Existing Study Materials</h3>
      <ul className="space-y-3">
        {materials.length === 0 && <li>No study materials uploaded yet.</li>}
        {materials.map((m) => (
          <li
            key={m.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <div>
              <h4 className="font-semibold">{m.title}</h4>
              <p>Class: {m.class} | Subject: {m.subject}</p>
            </div>
            <div className="flex gap-2">
              <a
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                View
              </a>
              <button
                onClick={() => handleEdit(m)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(m.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudyMaterialForm;

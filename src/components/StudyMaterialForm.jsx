import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { RiDeleteBinLine, RiBookOpenLine, RiDownloadLine, RiEditLine, RiLinkM } from 'react-icons/ri';

const StudyMaterialForm = () => {
  // Default state ensures board is never undefined for new entries
  const [formData, setFormData] = useState({ title: '', subject: '', class: '10', board: 'CBSE', file: null, link: '' });
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const materialsCol = collection(db, 'materials');

  useEffect(() => { fetchMaterials(); }, []);

  const fetchMaterials = async () => {
    const snap = await getDocs(materialsCol);
    setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let url = formData.link;
    
    if (formData.file) {
        const fileRef = ref(storage, `materials/${Date.now()}_${formData.file.name}`);
        await uploadBytes(fileRef, formData.file);
        url = await getDownloadURL(fileRef);
    }

    // SANITIZATION: Ensure no field is undefined
    const payload = {
        title: formData.title || '',
        subject: formData.subject || '',
        class: formData.class || '10',
        board: formData.board || 'CBSE', // Fallback to prevent undefined error
        url: url || '',
        updatedAt: new Date()
    };

    try {
        if (editingId) {
            await updateDoc(doc(db, 'materials', editingId), payload);
            alert("Updated!");
            setEditingId(null);
        } else {
            await addDoc(materialsCol, { ...payload, createdAt: new Date() });
            alert("Uploaded!");
        }
        
        // Reset form
        setFormData({ title: '', subject: '', class: '10', board: 'CBSE', file: null, link: '' });
        fetchMaterials();
    } catch (error) {
        console.error("Firebase Error:", error);
        alert("Error saving: " + error.message);
    }
    
    setLoading(false);
  };

  const handleEdit = (m) => {
    setEditingId(m.id);
    // FIX: Add fallbacks (|| '') here to handle old data that might be missing fields
    setFormData({ 
        title: m.title || '', 
        subject: m.subject || '', 
        class: m.class || '10', 
        board: m.board || 'CBSE', // <--- CRITICAL FIX
        link: m.url || '', 
        file: null 
    });
    window.scrollTo({top:0, behavior:'smooth'});
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete?')) {
        await deleteDoc(doc(db, 'materials', id));
        fetchMaterials();
    }
  };

  const classOptions = Array.from({length: 12}, (_, i) => (i + 1).toString());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><RiBookOpenLine className="text-blue-500"/> {editingId ? 'Edit Material' : 'Upload Material'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border p-2 rounded" placeholder="Title" value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} required/>
                <input className="border p-2 rounded" placeholder="Subject" value={formData.subject} onChange={e=>setFormData({...formData, subject:e.target.value})} required/>
                
                <div className="flex gap-2">
                    <select className="border p-2 rounded w-1/2 bg-white" value={formData.class} onChange={e=>setFormData({...formData, class:e.target.value})}>
                        {classOptions.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <select className="border p-2 rounded w-1/2 bg-white" value={formData.board} onChange={e=>setFormData({...formData, board:e.target.value})}>
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State Board">State Board</option>
                    </select>
                </div>

                <div className="md:col-span-2 border p-3 rounded bg-gray-50">
                    <p className="text-xs font-bold mb-2 text-gray-500">Attach File OR Paste Link</p>
                    <div className="flex gap-4">
                        <input type="file" className="w-1/2 text-sm" onChange={e=>setFormData({...formData, file:e.target.files[0]})} />
                        <input className="w-1/2 border p-1 rounded text-sm" placeholder="OR Paste URL here" value={formData.link} onChange={e=>setFormData({...formData, link:e.target.value})} />
                    </div>
                </div>

                <button disabled={loading} className="md:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">{loading ? 'Processing...' : (editingId ? 'Update Material' : 'Upload')}</button>
                {editingId && <button type="button" onClick={()=>{setEditingId(null); setFormData({ title: '', subject: '', class: '10', board: 'CBSE', file: null, link: '' })}} className="md:col-span-2 bg-gray-200 py-2 rounded">Cancel Edit</button>}
            </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4">Library</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
                {materials.map(m => (
                    <div key={m.id} className="flex justify-between items-center p-3 border rounded hover:bg-slate-50">
                        <div>
                            <p className="font-bold text-sm">{m.title}</p>
                            <p className="text-xs text-slate-500">{m.board || 'CBSE'} | Class {m.class} | {m.subject}</p>
                        </div>
                        <div className="flex gap-2">
                            <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-500 p-2"><RiLinkM size={18}/></a>
                            <button onClick={()=>handleEdit(m)} className="text-yellow-500 p-2"><RiEditLine size={18}/></button>
                            <button onClick={()=>handleDelete(m.id)} className="text-red-500 p-2"><RiDeleteBinLine size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default StudyMaterialForm;
import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { RiQuestionAnswerLine, RiDeleteBinLine, RiExternalLinkLine, RiEditLine } from 'react-icons/ri';

const LiveQuizForm = () => {
  const [formData, setFormData] = useState({ title: '', topic: '', link: '', class: '10', board: 'CBSE' });
  const [quizzes, setQuizzes] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const quizCol = collection(db, 'quizzes');

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    const snap = await getDocs(quizCol);
    setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // SANITIZATION
    const payload = {
        title: formData.title || '',
        topic: formData.topic || '',
        link: formData.link || '',
        class: formData.class || '10',
        board: formData.board || 'CBSE', // Fallback
        updatedAt: new Date()
    };

    if (editingId) {
        await updateDoc(doc(db, 'quizzes', editingId), payload);
        alert('Quiz Updated!');
        setEditingId(null);
    } else {
        await addDoc(quizCol, { ...payload, createdAt: new Date() });
        alert('Quiz Added!');
    }
    
    setFormData({ title: '', topic: '', link: '', class: '10', board: 'CBSE' });
    fetchQuizzes();
  };

  const handleEdit = (q) => {
    setEditingId(q.id);
    // FIX: Add fallbacks
    setFormData({ 
        title: q.title || '', 
        topic: q.topic || '', 
        link: q.link || '', 
        class: q.class || '10', 
        board: q.board || 'CBSE' 
    });
    window.scrollTo({top:0, behavior:'smooth'});
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete Quiz?')) {
        await deleteDoc(doc(db, 'quizzes', id));
        fetchQuizzes();
    }
  };

  const classOptions = Array.from({length: 10}, (_, i) => (i + 1).toString());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><RiQuestionAnswerLine className="text-purple-600"/> {editingId ? 'Edit Quiz' : 'Add Quiz'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border p-2 rounded" placeholder="Quiz Title" value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} required/>
                <input className="border p-2 rounded" placeholder="Topic" value={formData.topic} onChange={e=>setFormData({...formData, topic:e.target.value})} required/>
                <div className="flex gap-2">
                    <select className="border p-2 rounded w-1/2 bg-white" value={formData.class} onChange={e=>setFormData({...formData, class:e.target.value})}>
                        {classOptions.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <select className="border p-2 rounded w-1/2 bg-white" value={formData.board} onChange={e=>setFormData({...formData, board:e.target.value})}>
                        <option>CBSE</option><option>ICSE</option><option>State Board</option>
                    </select>
                </div>
                <input className="border p-2 rounded md:col-span-2" placeholder="Google Form Link" value={formData.link} onChange={e=>setFormData({...formData, link:e.target.value})} required/>
                
                <button className="md:col-span-2 bg-purple-600 text-white py-2 rounded hover:bg-purple-700">{editingId ? 'Update Quiz' : 'Publish Quiz'}</button>
                {editingId && <button type="button" onClick={()=>{setEditingId(null); setFormData({ title: '', topic: '', link: '', class: '10', board: 'CBSE' })}} className="md:col-span-2 bg-gray-200 py-2 rounded">Cancel Edit</button>}
            </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4">Active Quizzes</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
                {quizzes.map(q => (
                    <div key={q.id} className="flex justify-between items-center p-3 border rounded hover:bg-purple-50">
                        <div>
                            <p className="font-bold text-sm">{q.title}</p>
                            <p className="text-xs text-slate-500">{q.board || 'CBSE'} | Class {q.class} | {q.topic}</p>
                        </div>
                        <div className="flex gap-2">
                            <a href={q.link} target="_blank" rel="noreferrer" className="text-purple-500 p-2"><RiExternalLinkLine size={18}/></a>
                            <button onClick={()=>handleEdit(q)} className="text-yellow-500 p-2"><RiEditLine size={18}/></button>
                            <button onClick={()=>handleDelete(q.id)} className="text-red-500 p-2"><RiDeleteBinLine size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default LiveQuizForm;
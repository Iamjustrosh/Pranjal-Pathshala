import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Card Styles for Materials
const card3DBase = "relative bg-white border border-blue-100/80 rounded-2xl shadow-[0_4px_20px_rgba(148,163,184,0.1)] p-5 flex justify-between items-center transition-all duration-300";
const card3DHover = "hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(148,163,184,0.2)] hover:border-blue-300";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  
  // Local filter state for subjects within the user's class
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentUser');
    if (!storedStudent) {
      navigate('/login');
      return;
    }
    const parsedStudent = JSON.parse(storedStudent);
    setStudent(parsedStudent);

    // Fetch Data
    fetchMarks(parsedStudent.id);
    fetchClassMaterials(parsedStudent.class); // Pass class explicitly
  }, [navigate]);

  const fetchMarks = async (studentId) => {
    const { data } = await supabase
      .from('marks')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (data) setMarks(data);
  };

  const fetchClassMaterials = async (studentClass) => {
    setLoadingMaterials(true);
    try {
      // Fetch all materials first (since formatting of 'class' might differ in DB, e.g. "10" vs "Class 10")
      // Then filter in JS for flexibility
      const snapshot = await getDocs(collection(db, 'materials'));
      const allMaterials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Normalize helper: "Class 10" -> "10", "10 " -> "10"
      const normalize = (val) => String(val || '').replace(/\D/g, '').trim();
      const targetClass = normalize(studentClass);

      const classSpecificMaterials = allMaterials.filter(m => normalize(m.class) === targetClass);
      setMaterials(classSpecificMaterials);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
    setLoadingMaterials(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('studentUser');
    navigate('/login');
  };

  // Filter materials by selected subject dropdown
  const filteredMaterials = selectedSubject 
    ? materials.filter(m => m.subject.toLowerCase() === selectedSubject.toLowerCase()) 
    : materials;

  // Extract unique subjects for dropdown
  const uniqueSubjects = [...new Set(materials.map(m => m.subject))];

  if (!student) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER PROFILE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome, {student.name} 👋</h1>
            <p className="text-slate-500 text-sm mt-1">
              Class: <span className="font-semibold text-blue-600">{student.class}</span> | 
              ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded ml-1">{student.username}</span>
            </p>
          </div>
          <button onClick={handleLogout} className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors">
            Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* SECTION 1: MARKS / RESULTS */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              📊 Performance Report
            </h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[300px]">
              {marks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <p>No marks uploaded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="p-3 rounded-l-lg">Subject</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Score</th>
                        <th className="p-3 rounded-r-lg">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {marks.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-medium text-slate-700">{m.subject}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              m.exam_type === 'exam' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {m.exam_type}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-blue-600">
                            {m.marks}<span className="text-slate-400 text-xs font-normal">/{m.max_marks}</span>
                          </td>
                          <td className="p-3 text-xs text-slate-400">{new Date(m.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: CLASS MATERIALS (New Feature) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                📚 Your Class Notes
              </h2>
              {/* Subject Filter Dropdown */}
              {materials.length > 0 && (
                <select 
                  className="text-sm border-slate-200 rounded-lg py-1 px-2 bg-white shadow-sm focus:ring-blue-500"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="bg-slate-100/50 p-4 rounded-2xl border border-slate-200/60 min-h-[300px] max-h-[500px] overflow-y-auto">
              {loadingMaterials ? (
                <p className="text-center py-10 text-slate-500">Loading notes...</p>
              ) : filteredMaterials.length === 0 ? (
                <div className="text-center py-10 text-slate-400 flex flex-col items-center">
                  <div className="text-4xl mb-2">📂</div>
                  <p>No study materials found for Class {student.class}.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {filteredMaterials.map((item) => (
                    <li key={item.id} className={`${card3DBase} ${card3DHover} group`}>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm md:text-base line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-medium bg-white inline-block px-1 rounded border border-slate-100">
                          {item.subject}
                        </p>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                      >
                        View PDF
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { auth } from '../firebase';
import StudyMaterialForm from '../components/StudyMaterialForm';
import LiveQuizForm from '../components/LiveQuizForm';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ICONS
import { 
  RiUserAddLine, RiGroupLine, RiFileChartLine, RiBookOpenLine, 
  RiQuestionAnswerLine, RiLogoutBoxRLine, RiArrowLeftLine,
  RiSave3Line, RiDeleteBinLine, RiCloseLine, RiEditLine, RiTrophyLine
} from 'react-icons/ri';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('admissions'); 

  // --- DATA STATES ---
  const [admissionRequests, setAdmissionRequests] = useState([]); 
  const [coachingStudents, setCoachingStudents] = useState([]); 
  const [recentMarks, setRecentMarks] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- EDIT MODES STATES ---
  const [selectedAdmission, setSelectedAdmission] = useState(null); 
  const [selectedStudent, setSelectedStudent] = useState(null); 
  const [fullStudentData, setFullStudentData] = useState(null); 
  const [studentMarks, setStudentMarks] = useState([]); // NEW: Stores specific student marks
  const [editingMark, setEditingMark] = useState(null); 

  // --- FORMS STATE ---
  const [markData, setMarkData] = useState({ student_id: '', subject: '', exam_type: 'test', marks: '', max_marks: '', exam_date: '' });

  // Auth Redirect
  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  // Fetch Data on Tab Change
  useEffect(() => {
    if (activeTab === 'admissions') fetchAdmissionRequests();
    if (activeTab === 'class_manager') fetchCoachingStudents();
    if (activeTab === 'results') {
        fetchCoachingStudents();
        fetchMarksHistory();
    }
  }, [activeTab]);

  // --- FETCHERS ---
  const fetchAdmissionRequests = async () => {
    setLoading(true);
    const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (data) setAdmissionRequests(data);
    setLoading(false);
  };

  const fetchCoachingStudents = async () => {
    const { data } = await supabase.from('coaching_students').select('*').order('class', { ascending: true });
    if (data) setCoachingStudents(data);
  };

  const fetchMarksHistory = async () => {
    const { data } = await supabase.from('marks').select(`*, coaching_students (name, class)`).order('created_at', { ascending: false }).limit(50);
    if(data) setRecentMarks(data);
  };

  // --- ACTIONS: ADMISSIONS TAB ---
  
  const handleUpdateAdmission = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('students').update({
        student_name: selectedAdmission.student_name,
        class: selectedAdmission.class,
        contact_number: selectedAdmission.contact_number,
        father_name: selectedAdmission.father_name,
        dob: selectedAdmission.dob,
        board: selectedAdmission.board,
        address: selectedAdmission.address,
        parent_contact_number: selectedAdmission.parent_contact_number,
        gender: selectedAdmission.gender
    }).eq('id', selectedAdmission.id);

    if(error) alert(error.message);
    else {
        alert("Admission Details Updated!");
        setSelectedAdmission(null);
        fetchAdmissionRequests();
    }
  };

  const handleApproveAndEnroll = async (req) => {
    if(!window.confirm(`Enroll ${req.student_name}?`)) return;
    
    // Generate ID Logic
    const yearShort = new Date().getFullYear().toString().slice(-2);
    let classNum = (req.class || '').replace(/\D/g, '').padStart(2, '0');
    if(classNum === '00') classNum = '10'; 
    
    const prefix = `PP${yearShort}${classNum}`;
    const { count } = await supabase.from('coaching_students').select('*', { count: 'exact', head: true }).ilike('username', `${prefix}%`);
    const username = `${prefix}${101 + (count || 0)}`;
    const dobParts = req.dob ? req.dob.split('-') : ['2000','01','01'];
    const password = `${dobParts[2]}${dobParts[1]}${dobParts[0]}`; 

    const newStudent = {
      name: req.student_name, class: req.class, contact_no: req.contact_number,
      dob: req.dob, username: username, board: req.board || 'CBSE', 
      photo_url: req.photo_url, original_student_id: req.id 
    };

    const { error } = await supabase.from('coaching_students').insert([newStudent]);
    if (!error) {
      await supabase.from('students').update({ status: 'enrolled', username: username }).eq('id', req.id);
      alert(`Enrolled!\nUser: ${username}\nPass: ${password}`);
      fetchAdmissionRequests();
    } else {
        alert(error.message);
    }
  };

  const handleBatchEnroll = async () => {
    const pending = admissionRequests.filter(s => s.status !== 'enrolled');
    if (pending.length === 0) { alert("No pending students."); return; }
    if(!window.confirm(`Enroll ${pending.length} students?`)) return;

    setLoading(true);
    // Placeholder for loop
    setLoading(false);
    alert("Batch function placeholder executed.");
  };

  const handleDeleteAdmission = async (id) => {
    if(!window.confirm("Permanently delete this admission inquiry?")) return;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if(error) alert(error.message);
    else fetchAdmissionRequests();
  };

  // --- ACTIONS: CLASS MANAGER TAB ---
  
  // 1. FETCH FULL DETAILS & MARKS
  const handleViewStudentDetails = async (student) => {
    setSelectedStudent(student);
    
    // Fetch Profile
    if (student.original_student_id) {
        const { data } = await supabase.from('students').select('*').eq('id', student.original_student_id).single();
        if(data) setFullStudentData(data);
        else setFullStudentData({ student_name: student.name, class: student.class });
    } else {
        setFullStudentData({ student_name: student.name, class: student.class }); 
    }

    // NEW: Fetch Marks for this student
    const { data: marks } = await supabase
        .from('marks')
        .select('*')
        .eq('student_id', student.id)
        .order('exam_date', { ascending: true }); // Ascending for Chart
    
    setStudentMarks(marks || []);
  };

  // 2. UPDATE FULL DETAILS & SYNC
  const handleUpdateStudentFull = async (e) => {
    e.preventDefault();
    
    const { error: err1 } = await supabase.from('coaching_students').update({
        name: fullStudentData.student_name,
        class: fullStudentData.class,
        contact_no: fullStudentData.contact_number,
        board: fullStudentData.board,
        username: selectedStudent.username, 
        dob: selectedStudent.dob
    }).eq('id', selectedStudent.id);

    if(!err1) {
        if(selectedStudent.original_student_id && fullStudentData.id) {
            await supabase.from('students').update(fullStudentData).eq('id', fullStudentData.id);
        }
        alert("Student Updated & Synced!");
        // We don't close the modal here to allow viewing marks, but refresh list
        fetchCoachingStudents();
    } else {
        alert(err1.message);
    }
  };

  // --- ACTIONS: RESULTS TAB ---
  const handleUploadOrUpdateMark = async (e) => {
    e.preventDefault();
    if(editingMark) {
        const { error } = await supabase.from('marks').update(markData).eq('id', editingMark);
        if(!error) { alert("Mark Updated!"); setEditingMark(null); }
        else alert(error.message);
    } else {
        const { error } = await supabase.from('marks').insert([markData]);
        if(!error) alert("Mark Uploaded!");
        else alert(error.message);
    }
    setMarkData({ student_id: '', subject: '', exam_type: 'test', marks: '', max_marks: '', exam_date: '' });
    fetchMarksHistory();
  };

  const handleEditMarkClick = (mark) => {
    setEditingMark(mark.id);
    setMarkData({
        student_id: mark.student_id,
        subject: mark.subject,
        exam_type: mark.exam_type,
        marks: mark.marks,
        max_marks: mark.max_marks,
        exam_date: mark.exam_date
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logout = () => { auth.signOut(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <button onClick={logout} className="text-red-500 font-medium hover:bg-red-50 px-3 py-1 rounded transition flex items-center gap-2">
            <RiLogoutBoxRLine/> Logout
          </button>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex flex-wrap gap-2">
          <TabButton active={activeTab === 'admissions'} onClick={() => setActiveTab('admissions')} label="Admission Requests" icon={<RiUserAddLine/>} />
          <TabButton active={activeTab === 'class_manager'} onClick={() => setActiveTab('class_manager')} label="Class Manager" icon={<RiGroupLine/>} />
          <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} label="Class & Results" icon={<RiFileChartLine/>} />
          <TabButton active={activeTab === 'materials'} onClick={() => setActiveTab('materials')} label="Study Materials" icon={<RiBookOpenLine/>} />
          <TabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} label="Live Quizzes" icon={<RiQuestionAnswerLine/>} />
        </div>

        {/* --- 1. ADMISSIONS TAB --- */}
        {activeTab === 'admissions' && (
            !selectedAdmission ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">New Admission Requests</h2>
                        <button onClick={handleBatchEnroll} className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-700 transition text-sm font-semibold flex items-center gap-2">
                            ⚡ Enroll All Pending
                        </button>
                    </div>
                    {loading ? <p>Loading...</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase">
                                    <tr><th className="p-4">Photo</th><th className="p-4">Name</th><th className="p-4">Class</th><th className="p-4">Board</th><th className="p-4">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {admissionRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={(e) => { if(e.target.tagName !== 'BUTTON') setSelectedAdmission(req) }}>
                                            <td className="p-4">
                                                {req.photo_url ? <img src={req.photo_url} alt="s" className="w-10 h-10 rounded-full object-cover border"/> : <div className="w-10 h-10 bg-slate-200 rounded-full"/>}
                                            </td>
                                            <td className="p-4 font-semibold text-slate-700">{req.student_name}</td>
                                            <td className="p-4">{req.class}</td>
                                            <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">{req.board}</span></td>
                                            <td className="p-4 flex items-center gap-3">
                                                {req.status === 'enrolled' ? (
                                                    <span className="text-green-600 font-mono text-sm bg-green-50 px-2 py-1 rounded">{req.username}</span>
                                                ) : (
                                                    <button onClick={(e) => {e.stopPropagation(); handleApproveAndEnroll(req)}} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 shadow-sm transition">Enroll</button>
                                                )}
                                                <button onClick={(e) => {e.stopPropagation(); handleDeleteAdmission(req.id)}} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition">
                                                    <RiDeleteBinLine size={18}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                // EDIT ADMISSION FORM
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                        <h2 className="text-xl font-bold flex items-center gap-2"><RiEditLine/> Edit Admission Details</h2>
                        <button onClick={()=>setSelectedAdmission(null)} className="text-gray-500 hover:text-gray-800"><RiCloseLine size={24}/></button>
                    </div>
                    <form onSubmit={handleUpdateAdmission} className="grid md:grid-cols-2 gap-6">
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student Name</label><input className="w-full border p-2 rounded" value={selectedAdmission.student_name} onChange={e=>setSelectedAdmission({...selectedAdmission, student_name:e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class</label><input className="w-full border p-2 rounded" value={selectedAdmission.class} onChange={e=>setSelectedAdmission({...selectedAdmission, class:e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Board</label>
                            <select className="w-full border p-2 rounded bg-white" value={selectedAdmission.board || 'CBSE'} onChange={e=>setSelectedAdmission({...selectedAdmission, board:e.target.value})}>
                                <option>CBSE</option><option>ICSE</option><option>State Board</option>
                            </select>
                        </div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact</label><input className="w-full border p-2 rounded" value={selectedAdmission.contact_number} onChange={e=>setSelectedAdmission({...selectedAdmission, contact_number:e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Father's Name</label><input className="w-full border p-2 rounded" value={selectedAdmission.father_name} onChange={e=>setSelectedAdmission({...selectedAdmission, father_name:e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Phone</label><input className="w-full border p-2 rounded" value={selectedAdmission.parent_contact_number} onChange={e=>setSelectedAdmission({...selectedAdmission, parent_contact_number:e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label><input type="date" className="w-full border p-2 rounded" value={selectedAdmission.dob} onChange={e=>setSelectedAdmission({...selectedAdmission, dob:e.target.value})} /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label><textarea className="w-full border p-2 rounded" rows="2" value={selectedAdmission.address} onChange={e=>setSelectedAdmission({...selectedAdmission, address:e.target.value})} /></div>
                        
                        <div className="md:col-span-2 flex gap-4 mt-2">
                            <button type="button" onClick={()=>setSelectedAdmission(null)} className="w-1/3 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold">Cancel</button>
                            <button type="submit" className="w-2/3 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">Save Changes</button>
                        </div>
                    </form>
                </div>
            )
        )}

        {/* --- 2. CLASS MANAGER TAB --- */}
        {activeTab === 'class_manager' && (
          <>
            {selectedStudent ? (
                // FULL STUDENT EDIT FORM + MARKS HISTORY
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b flex items-center gap-4 bg-slate-50 sticky top-0 z-10">
                        <button onClick={() => {setSelectedStudent(null); setFullStudentData(null)}} className="p-2 hover:bg-white rounded-full transition"><RiArrowLeftLine size={20}/></button>
                        <h2 className="font-bold text-lg">Student Profile: {selectedStudent.name}</h2>
                    </div>
                    
                    {fullStudentData ? (
                        <div className="p-6">
                            {/* Profile Form */}
                            <form onSubmit={handleUpdateStudentFull} className="grid md:grid-cols-2 gap-6 mb-10">
                                <h3 className="md:col-span-2 font-bold text-blue-600 border-b pb-2 flex items-center gap-2"><RiUserAddLine/> Academic Info</h3>
                                <div><label className="text-xs text-slate-500 uppercase font-bold">Name</label><input className="w-full border p-2 rounded" value={fullStudentData.student_name || ''} onChange={e=>setFullStudentData({...fullStudentData, student_name: e.target.value})} /></div>
                                <div><label className="text-xs text-slate-500 uppercase font-bold">Class</label><input className="w-full border p-2 rounded" value={fullStudentData.class || ''} onChange={e=>setFullStudentData({...fullStudentData, class: e.target.value})} /></div>
                                <div><label className="text-xs text-slate-500 uppercase font-bold">Board</label>
                                    <select className="w-full border p-2 rounded bg-white" value={fullStudentData.board || 'CBSE'} onChange={e=>setFullStudentData({...fullStudentData, board: e.target.value})}>
                                        <option>CBSE</option><option>ICSE</option><option>State Board</option>
                                    </select>
                                </div>
                                {/* <div><label className="text-xs text-slate-500 uppercase font-bold">Gender</label><input className="w-full border p-2 rounded" value={fullStudentData.gender || ''} onChange={e=>setFullStudentData({...fullStudentData, gender: e.target.value})} /></div> */}

                                <h3 className="md:col-span-2 font-bold text-blue-600 border-b pb-2 pt-2">Login Credentials (Editable)</h3>
                                <div className="bg-yellow-50 p-3 rounded border border-yellow-200"><label className="text-xs text-yellow-700 uppercase font-bold">Username</label><input className="w-full border p-2 rounded bg-white" value={selectedStudent.username || ''} onChange={e=>setSelectedStudent({...selectedStudent, username: e.target.value})} /></div>
                                <div className="bg-yellow-50 p-3 rounded border border-yellow-200"><label className="text-xs text-yellow-700 uppercase font-bold">DOB (Password)</label><input type="date" className="w-full border p-2 rounded bg-white" value={selectedStudent.dob || ''} onChange={e=>setSelectedStudent({...selectedStudent, dob: e.target.value})} /></div>

                                {/* <h3 className="md:col-span-2 font-bold text-blue-600 border-b pb-2 pt-2">Contact & Parents</h3>
                                <div><label className="text-xs text-slate-500 uppercase font-bold">Phone</label><input className="w-full border p-2 rounded" value={fullStudentData.contact_number || ''} onChange={e=>setFullStudentData({...fullStudentData, contact_number: e.target.value})} /></div>
                                <div><label className="text-xs text-slate-500 uppercase font-bold">Father's Name</label><input className="w-full border p-2 rounded" value={fullStudentData.father_name || ''} onChange={e=>setFullStudentData({...fullStudentData, father_name: e.target.value})} /></div>
                                <div className="md:col-span-2"><label className="text-xs text-slate-500 uppercase font-bold">Address</label><textarea className="w-full border p-2 rounded" rows="2" value={fullStudentData.address || ''} onChange={e=>setFullStudentData({...fullStudentData, address: e.target.value})} /></div> */}

                                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"><RiSave3Line/> Update & Sync</button>
                                </div>
                            </form>

                            {/* --- NEW SECTION: PERFORMANCE ANALYTICS --- */}
                            <div className="border-t-4 border-slate-100 pt-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><RiTrophyLine className="text-amber-500"/> Performance & Marks History</h3>
                                
                                {studentMarks.length > 0 ? (
                                    <div className="grid lg:grid-cols-2 gap-8">
                                        {/* CHART */}
                                        <div className="bg-white p-4 border rounded-xl shadow-sm h-64">
                                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Score Trend (Recent Tests)</h4>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={studentMarks.slice(-10)}> {/* Last 10 marks */}
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    {/* <XAxis dataKey="exam_date" tickFormatter={(t)=> t ? t.slice(5) : ''} style={{ fontSize: '12px' }}/> */}
                                                    <XAxis dataKey="subject" tick={{fontSize: 11, fill: '#64748B'}} interval={0} tickMargin={10} />
                                                    {/* <YAxis style={{ fontSize: '12px' }}/> */}
                                                    <YAxis domain={[0, 100]} tick={{fontSize: 12, fill: '#64748B'}} axisLine={false} tickLine={false} />
                                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}/>
                                                    <Line type="monotone" dataKey="marks" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* TABLE */}
                                        <div className="overflow-hidden border rounded-xl">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                                                    <tr><th className="p-3">Date</th><th className="p-3">Subject</th><th className="p-3">Type</th><th className="p-3 text-right">Score</th></tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {[...studentMarks].reverse().map((m) => ( // Reverse to show latest first in table
                                                        <tr key={m.id} className="hover:bg-blue-50">
                                                            <td className="p-3 text-slate-500">{m.exam_date}</td>
                                                            <td className="p-3 font-medium">{m.subject}</td>
                                                            <td className="p-3"><span className="text-xs uppercase border px-1 rounded bg-white">{m.exam_type}</span></td>
                                                            <td className="p-3 text-right font-bold text-blue-600">{m.marks} / {m.max_marks}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <p className="text-slate-500">No marks uploaded for this student yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : <p className="p-10 text-center">Loading Profile...</p>}
                </div>
            ) : (
                // LIST VIEW
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><RiGroupLine className="text-blue-500"/> Class Manager</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {coachingStudents.map(s => (
                            <div key={s.id} onClick={() => handleViewStudentDetails(s)} className="cursor-pointer bg-white border border-slate-100 p-4 rounded-xl hover:shadow-md hover:border-blue-300 transition group relative">
                                <div className="flex items-center gap-4">
                                    {s.photo_url ? <img src={s.photo_url} className="w-12 h-12 rounded-full object-cover border"/> : <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">{s.name[0]}</div>}
                                    <div>
                                        <p className="font-bold text-slate-800 group-hover:text-blue-600">{s.name}</p>
                                        <p className="text-xs text-slate-500">{s.class} | {s.board}</p>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 text-slate-300 group-hover:text-blue-500"><RiEditLine size={20}/></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </>
        )}

        {/* --- 3. RESULTS TAB --- */}
        {activeTab === 'results' && (
             <div className="grid lg:grid-cols-2 gap-6">
                {/* Upload Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2"><RiFileChartLine className="text-green-600"/> {editingMark ? 'Edit Mark' : 'Upload Marks'}</h3>
                    <form onSubmit={handleUploadOrUpdateMark} className="space-y-4">
                        <select className="w-full border p-3 rounded-lg bg-slate-50" value={markData.student_id} onChange={e => setMarkData({...markData, student_id: e.target.value})} required>
                            <option value="">-- Select Student --</option>
                            {coachingStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
                        </select>
                        <div className="flex gap-3">
                            <select className="w-1/2 border p-3 rounded-lg bg-slate-50" value={markData.exam_type} onChange={e => setMarkData({...markData, exam_type: e.target.value})}>
                                <option value="test">Test</option><option value="quiz">Quiz</option>
                            </select>
                            <input type="date" className="w-1/2 border p-3 rounded-lg bg-slate-50" value={markData.exam_date} onChange={e => setMarkData({...markData, exam_date: e.target.value})} required />
                        </div>
                        <input className="w-full border p-3 rounded-lg bg-slate-50" placeholder="Subject" value={markData.subject} onChange={e => setMarkData({...markData, subject: e.target.value})} required />
                        <div className="flex gap-3">
                            <input type="number" placeholder="Marks" className="w-1/2 border p-3 rounded-lg bg-slate-50" value={markData.marks} onChange={e => setMarkData({...markData, marks: e.target.value})} required />
                            <input type="number" placeholder="Max" className="w-1/2 border p-3 rounded-lg bg-slate-50" value={markData.max_marks} onChange={e => setMarkData({...markData, max_marks: e.target.value})} required />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 font-bold">{editingMark ? 'Update Mark' : 'Submit Result'}</button>
                            {editingMark && <button type="button" onClick={()=>{setEditingMark(null); setMarkData({ student_id: '', subject: '', exam_type: 'test', marks: '', max_marks: '', exam_date: '' })}} className="px-4 bg-gray-200 rounded-lg font-bold">Cancel</button>}
                        </div>
                    </form>
                </div>

                {/* Recent Results Table */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-4 text-slate-700">Marks History (Recent 50)</h3>
                    <div className="overflow-auto max-h-[500px]">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 border-b sticky top-0">
                                <tr><th className="p-3">Name</th><th className="p-3">Subject</th><th className="p-3">Score</th><th className="p-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y">
                                {recentMarks.map(m => (
                                    <tr key={m.id} className="hover:bg-slate-50">
                                        <td className="p-3 font-medium">{m.coaching_students?.name}</td>
                                        <td className="p-3 text-slate-500">{m.subject} <span className="text-xs border px-1 rounded uppercase">{m.exam_type}</span></td>
                                        <td className="p-3 font-bold text-blue-600">{m.marks}/{m.max_marks}</td>
                                        <td className="p-3"><button onClick={()=>handleEditMarkClick(m)} className="text-blue-500 hover:bg-blue-100 p-1 rounded"><RiEditLine/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>
        )}

        {/* --- 4. FIREBASE MODULES --- */}
        {activeTab === 'materials' && <StudyMaterialForm />}
        {activeTab === 'quiz' && <LiveQuizForm />}

      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
    {icon} {label}
  </button>
);

export default AdminPanel;
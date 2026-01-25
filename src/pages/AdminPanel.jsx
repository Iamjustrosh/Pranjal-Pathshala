import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import StudyMaterialForm from '../components/StudyMaterialForm';
import LiveQuizForm from '../components/LiveQuizForm';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [section, setSection] = useState('admissions'); 

  // --- Data States ---
  const [admissionRequests, setAdmissionRequests] = useState([]); 
  const [coachingStudents, setCoachingStudents] = useState([]); 
  const [loading, setLoading] = useState(false);

  // --- Form States ---
  const [markData, setMarkData] = useState({ student_id: '', subject: '', exam_type: 'test', marks: '', max_marks: '' });
  const [studentForm, setStudentForm] = useState({ id: null, name: '', class: '', contact_no: '', username: '', dob: '' });
  const [isEditing, setIsEditing] = useState(false);

  // --- Auth Check ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) navigate('/login');
      else setUser(currentUser);
    });
    return () => unsubscribe();
  }, [navigate]);

  // --- Data Fetching ---
  useEffect(() => {
    if (user) {
      if (section === 'admissions') fetchAdmissionRequests();
      if (section === 'class_manager') fetchCoachingStudents();
    }
  }, [section, user]);

  const fetchAdmissionRequests = async () => {
    setLoading(true);
    const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (data) setAdmissionRequests(data);
    setLoading(false);
  };

  const fetchCoachingStudents = async () => {
    setLoading(true);
    const { data } = await supabase.from('coaching_students').select('*').order('class', { ascending: true }).order('username', { ascending: true });
    if (data) setCoachingStudents(data);
    setLoading(false);
  };

  // ==========================================================
  // 🧠 SMART ID GENERATOR
  // ==========================================================
  const generateCredentials = async (studentReq) => {
    const yearFull = new Date().getFullYear();
    const yearShort = yearFull.toString().slice(-2);

    let classNum = studentReq.class.replace(/\D/g, ''); 
    if (classNum.length === 0) classNum = "00"; 
    if (classNum.length === 1) classNum = "0" + classNum; 

    const prefix = `PP${yearShort}${classNum}`;

    const { count, error } = await supabase
      .from('coaching_students')
      .select('*', { count: 'exact', head: true })
      .ilike('username', `${prefix}%`); 
    
    if (error) { console.error(error); return null; }

    const serial = 101 + (count || 0);
    const username = `${prefix}${serial}`;
    
    const dobParts = studentReq.dob.split('-'); 
    const password = `${dobParts[2]}${dobParts[1]}${dobParts[0]}`; // DDMMYYYY

    return { username, password };
  };

  // ==========================================================
  // TAB 1 ACTIONS: ADMISSIONS
  // ==========================================================

  // 1. Enroll Student
  const handleApproveAndEnroll = async (req) => {
    if(!window.confirm(`Enroll ${req.student_name}?`)) return;

    const creds = await generateCredentials(req);
    if (!creds) { alert("Error generating ID."); return; }

    const newStudent = {
      name: req.student_name,
      class: req.class,
      contact_no: req.contact_number,
      dob: req.dob,
      username: creds.username 
    };

    const { error } = await supabase.from('coaching_students').insert([newStudent]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      await supabase.from('students').update({ status: 'enrolled', username: creds.username }).eq('id', req.id);
      alert(`✅ Success!\nUsername: ${creds.username}\nPassword: ${creds.password}`);
      fetchAdmissionRequests();
    }
  };

  // 2. Batch Enroll
  const handleBatchEnroll = async () => {
    const pendingStudents = admissionRequests.filter(s => s.status !== 'enrolled');
    if (pendingStudents.length === 0) { alert("No pending students."); return; }
    if(!window.confirm(`Enroll ${pendingStudents.length} students?`)) return;

    setLoading(true);
    let successCount = 0;

    for (const req of pendingStudents) {
       const creds = await generateCredentials(req);
       if (creds) {
         const newStudent = { name: req.student_name, class: req.class, contact_no: req.contact_number, dob: req.dob, username: creds.username };
         const { error } = await supabase.from('coaching_students').insert([newStudent]);
         if (!error) {
           await supabase.from('students').update({ status: 'enrolled', username: creds.username }).eq('id', req.id);
           successCount++;
         }
       }
    }
    setLoading(false);
    alert(`Batch Complete! Enrolled ${successCount} students.`);
    fetchAdmissionRequests();
  };

  // 3. Delete Admission Request (PERMANENT DELETE)
  const handleDeleteAdmission = async (id) => {
    if(!window.confirm("Permanently delete this admission inquiry?")) return;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if(error) alert(error.message);
    else fetchAdmissionRequests();
  };

  // ==========================================================
  // TAB 2 ACTIONS: CLASS MANAGER
  // ==========================================================

  // 1. Add/Edit Active Student
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      const { error } = await supabase.from('coaching_students').update({
          name: studentForm.name, class: studentForm.class, contact_no: studentForm.contact_no, username: studentForm.username, dob: studentForm.dob
        }).eq('id', studentForm.id);
      if (!error) { alert("Updated!"); setIsEditing(false); setStudentForm({ id: null, name: '', class: '', contact_no: '', username: '', dob: '' }); fetchCoachingStudents(); }
    } else {
      const { error } = await supabase.from('coaching_students').insert([{ ...studentForm, id: undefined }]);
      if (!error) { alert("Added!"); setStudentForm({ id: null, name: '', class: '', contact_no: '', username: '', dob: '' }); fetchCoachingStudents(); }
    }
  };

  // 2. Delete Active Student (AND RESET ADMISSION STATUS)
  const handleDeleteActiveStudent = async (student) => {
    if(!window.confirm(`Remove ${student.name} from Active Class?\n\nThis will RESET their Admission Status to 'Pending' so you can re-enroll them if needed.`)) return;

    // A. Delete from Coaching Table
    const { error } = await supabase.from('coaching_students').delete().eq('id', student.id);
    
    if (error) {
      alert(error.message);
    } else {
      // B. Reset status in Main Admission Table (if linked by username)
      if (student.username) {
        await supabase.from('students')
          .update({ status: 'pending', username: null })
          .eq('username', student.username);
      }
      alert("Student removed from class. Admission status reset to Pending.");
      fetchCoachingStudents();
    }
  };

  const handleEditClick = (s) => { setIsEditing(true); setStudentForm(s); window.scrollTo({top:0, behavior:'smooth'}); };

  // 3. Upload Marks
  const handleUploadMark = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('marks').insert([markData]);
    if (!error) { alert('Marks Uploaded!'); setMarkData({ ...markData, subject: '', marks: '', max_marks: '' }); }
  };

  const logout = () => { auth.signOut(); navigate('/login'); };
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <button onClick={logout} className="text-red-500 font-medium">Logout</button>
        </div>

        <div className="flex flex-wrap gap-2">
          <TabButton active={section === 'admissions'} onClick={() => setSection('admissions')} label="Admission Requests" />
          <TabButton active={section === 'class_manager'} onClick={() => setSection('class_manager')} label="Class & Results" />
          <TabButton active={section === 'materials'} onClick={() => setSection('materials')} label="Study Materials" />
          <TabButton active={section === 'quiz'} onClick={() => setSection('quiz')} label="Live Quizzes" />
        </div>

        {/* TAB 1: ADMISSIONS */}
        {section === 'admissions' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-700">Online Admission Requests</h2>
              <button onClick={handleBatchEnroll} className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700">
                ⚡ Enroll All Pending
              </button>
            </div>
            {loading ? <p>Loading...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="p-3">Name</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissionRequests.map((req) => (
                      <tr key={req.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-medium">{req.student_name}</td>
                        <td className="p-3">{req.class}</td>
                        <td className="p-3">{req.contact_number}</td>
                        <td className="p-3 flex items-center gap-3">
                          {req.status === 'enrolled' ? (
                            <div className="bg-green-50 text-green-700 px-3 py-1 rounded border border-green-200 text-sm font-mono">
                              {req.username}
                            </div>
                          ) : (
                            <button onClick={() => handleApproveAndEnroll(req)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 shadow-sm">
                              Approve & Enroll
                            </button>
                          )}
                          
                          {/* DELETE BUTTON: Always available to clean up inquiries */}
                          <button 
                            onClick={() => handleDeleteAdmission(req.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition"
                            title="Delete Inquiry"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLASS MANAGER */}
        {section === 'class_manager' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Form */}
              <div className={`p-6 rounded-xl shadow-sm border ${isEditing ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between mb-4">
                  <h3 className="font-bold text-slate-700">{isEditing ? '✏️ Edit Student' : '➕ Add Manual Student'}</h3>
                  {isEditing && <button onClick={() => { setIsEditing(false); setStudentForm({ id: null, name: '', class: '', contact_no: '', username: '', dob: '' }); }} className="text-red-500 text-xs underline">Cancel</button>}
                </div>
                <form onSubmit={handleStudentSubmit} className="space-y-3">
                  <input placeholder="Name" className="w-full border p-2 rounded" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} required />
                  <div className="flex gap-2">
                    <input placeholder="Class" className="w-1/2 border p-2 rounded" value={studentForm.class} onChange={e => setStudentForm({...studentForm, class: e.target.value})} required />
                    <input placeholder="Contact" className="w-1/2 border p-2 rounded" value={studentForm.contact_no} onChange={e => setStudentForm({...studentForm, contact_no: e.target.value})} required />
                  </div>
                  <div className="flex gap-2">
                    <input placeholder="Username" className="w-1/2 border p-2 rounded" value={studentForm.username} onChange={e => setStudentForm({...studentForm, username: e.target.value})} required />
                    <input type="date" className="w-1/2 border p-2 rounded" value={studentForm.dob} onChange={e => setStudentForm({...studentForm, dob: e.target.value})} required />
                  </div>
                  <button className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-900">{isEditing ? 'Update' : 'Add Student'}</button>
                </form>
              </div>

              {/* Active List */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold mb-4">Active Students ({coachingStudents.length})</h3>
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {coachingStudents.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 bg-white">
                      <div><p className="font-semibold">{s.name}</p><p className="text-xs text-gray-500">{s.class} | {s.username}</p></div>
                      <div>
                        <button onClick={() => handleEditClick(s)} className="mr-2 text-blue-500">✏️</button>
                        <button onClick={() => handleDeleteActiveStudent(s)} className="text-red-500">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Marks */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6 h-fit">
              <h3 className="font-bold mb-4 text-green-700">📊 Upload Marks</h3>
              <form onSubmit={handleUploadMark} className="space-y-4">
                <select className="w-full border p-2 rounded" value={markData.student_id} onChange={e => setMarkData({...markData, student_id: e.target.value})} required>
                  <option value="">-- Select Student --</option>
                  {coachingStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
                </select>
                <div className="flex gap-2">
                  <select className="w-1/3 border p-2 rounded" value={markData.exam_type} onChange={e => setMarkData({...markData, exam_type: e.target.value})}><option value="test">Test</option><option value="exam">Exam</option><option value="quiz">Quiz</option></select>
                  <input placeholder="Subject" className="w-2/3 border p-2 rounded" value={markData.subject} onChange={e => setMarkData({...markData, subject: e.target.value})} required />
                </div>
                <div className="flex gap-2">
                  <input type="number" placeholder="Marks" className="w-1/2 border p-2 rounded" value={markData.marks} onChange={e => setMarkData({...markData, marks: e.target.value})} required />
                  <input type="number" placeholder="Max" className="w-1/2 border p-2 rounded" value={markData.max_marks} onChange={e => setMarkData({...markData, max_marks: e.target.value})} required />
                </div>
                <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Submit Result</button>
              </form>
            </div>
          </div>
        )}

        {section === 'materials' && <StudyMaterialForm />}
        {section === 'quiz' && <LiveQuizForm />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{label}</button>
);

export default AdminPanel;
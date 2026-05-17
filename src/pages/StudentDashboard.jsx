import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore'; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  RiLogoutBoxRLine, RiBookOpenLine, RiQuestionAnswerLine, 
  RiDownloadLine, RiExternalLinkLine, RiTrophyLine, RiTableLine, RiBarChartLine,
  RiCalendarCheckLine, RiRefreshLine, RiExpandUpDownLine
} from 'react-icons/ri';

// Card Styles
const cardBase = "relative bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center transition-all duration-300 shadow-sm";
const cardHover = "hover:-translate-y-1 hover:shadow-md hover:border-blue-200";

// ─── IMPORTANT ───────────────────────────────────────────────────────────────
// Replace the value below with your actual Google Sheet publish URL.
// Steps to get it:
//   1. Open your Google Sheet → File → Share → Publish to web
//   2. Choose "Entire Document" + "Web page" → Click "Publish"
//   3. Copy the URL and paste it here
// ─────────────────────────────────────────────────────────────────────────────
const ATTENDANCE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1wFdGhXMf5biwrQ4g4G8PS_2e3suzuOBrwNACRPCSfX8/edit?usp=sharing";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // View Controls
  const [graphMode, setGraphMode] = useState('test'); // 'test' or 'quiz'
  const [viewType, setViewType] = useState('chart'); // 'chart' or 'table'

  // Subject filter for study materials
  const [materialSubject, setMaterialSubject] = useState('All');

  // Attendance sheet controls
  const [attendanceExpanded, setAttendanceExpanded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // used to force-reload iframe

  useEffect(() => {
    const stored = localStorage.getItem('studentUser');
    if (!stored) { navigate('/login'); return; }
    
    const localData = JSON.parse(stored);
    fetchFreshData(localData.id);
  }, [navigate]);

  // --- HELPER: Normalize Class for Comparison ---
  const normalizeClass = (val) => String(val || '').replace(/\D/g, '').trim();

  const fetchFreshData = async (studentId) => {
    // 1. Fetch Student Profile
    const { data: studentData, error } = await supabase
        .from('coaching_students')
        .select('*')
        .eq('id', studentId)
        .single();
    
    if (error || !studentData) {
        localStorage.removeItem('studentUser');
        navigate('/login');
        return;
    }
    setStudent(studentData);

    // 2. Fetch Marks
    const { data: mData } = await supabase
        .from('marks')
        .select('*')
        .eq('student_id', studentId)
        .order('exam_date', { ascending: true });
    if(mData) setMarks(mData);

    // 3. Fetch Firebase Data (Client-Side Filtering)
    setLoadingContent(true);
    try {
        const targetClass = normalizeClass(studentData.class);
        // --- FETCH MATERIALS ---
        const matRef = collection(db, "materials");
        const matSnap = await getDocs(matRef);
        const allMats = matSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter in Memory
        const myMaterials = allMats.filter(m => normalizeClass(m.class) === targetClass);
        setMaterials(myMaterials);

        // --- FETCH QUIZZES ---
        const quizRef = collection(db, "quizzes");
        const quizSnap = await getDocs(quizRef);
        const allQuizzes = quizSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter in Memory
        const myQuizzes = allQuizzes.filter(q => normalizeClass(q.class) === targetClass);
        setQuizzes(myQuizzes);

    } catch (err) {
        console.error("Firebase Fetch Error:", err);
    }
    setLoadingContent(false);
  };

  const handleLogout = () => { localStorage.removeItem('studentUser'); navigate('/login'); };

  // --- GRAPH FILTER ---
  const filteredMarks = marks.filter(m => {
      const type = (m.exam_type || '').toLowerCase().trim();
      if (graphMode === 'test') {
          return type === 'test' || type === 'exam';
      } else {
          return type === 'quiz';
      }
  });

  const graphData = filteredMarks.map(m => ({
      date: m.exam_date,
      subject: m.subject, 
      marks: m.marks,
      max: m.max_marks,
      percentage: ((m.marks / m.max_marks) * 100).toFixed(1)
  }));

  // --- SUBJECT LIST FOR FILTER ---
  const materialSubjects = React.useMemo(() => {
    const subs = materials
      .map(m => m.subject)
      .filter(Boolean)
      .reduce((acc, s) => acc.includes(s) ? acc : [...acc, s], []);
    return subs;
  }, [materials]);

  // Filtered Materials based on selected subject
  const filteredMaterials = React.useMemo(() => {
    if (!materials || materialSubject === 'All') return materials;
    return materials.filter(m => m.subject === materialSubject);
  }, [materials, materialSubject]);

  if (!student) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-5">
                {student.photo_url ? (
                    <img src={student.photo_url} className="w-20 h-20 rounded-full object-cover border-4 border-blue-50 shadow-sm" alt="Profile"/>
                ) : (
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-500 border-4 border-white shadow-sm">
                        {student.name[0]}
                    </div>
                )}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Hi, {student.name.split(' ')[0]}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-600">UID: {student.username}</span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full text-xs font-bold uppercase">{student.board}</span>
                        <span className="text-slate-500 font-medium text-sm">Class {student.class}</span>
                    </div>
                </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-5 py-3 rounded-xl transition font-semibold">
                <RiLogoutBoxRLine size={20}/> <span className="hidden md:inline">Logout</span>
            </button>
        </div>

        {/* ANALYTICS & NCERT GRID */}
        <div className="grid lg:grid-cols-3 gap-8">
            
            {/* PERFORMANCE SECTION */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <RiTrophyLine className="text-amber-500"/> Performance
                    </h2>
                    
                    <div className="flex gap-2">
                         {/* Toggle: Test vs Quiz */}
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button onClick={()=>setGraphMode('test')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${graphMode==='test' ? 'bg-white shadow text-blue-600':'text-slate-500'}`}>Tests</button>
                            <button onClick={()=>setGraphMode('quiz')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${graphMode==='quiz' ? 'bg-white shadow text-blue-600':'text-slate-500'}`}>Quizzes</button>
                        </div>
                        {/* Toggle: Chart vs Table */}
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button onClick={()=>setViewType('chart')} className={`p-1.5 rounded-md transition ${viewType==='chart' ? 'bg-white shadow text-blue-600':'text-slate-400'}`}><RiBarChartLine size={18}/></button>
                            <button onClick={()=>setViewType('table')} className={`p-1.5 rounded-md transition ${viewType==='table' ? 'bg-white shadow text-blue-600':'text-slate-400'}`}><RiTableLine size={18}/></button>
                        </div>
                    </div>
                </div>

                <div className="h-72 w-full min-h-[300px] [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none" style={{ outline: 'none' }}>
                    {filteredMarks.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 border border-dashed rounded-2xl">
                            No {graphMode} records found.
                        </div>
                    ) : (
                        viewType === 'chart' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={graphData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="subject" tick={{fontSize: 11, fill: '#64748B'}} interval={0} tickMargin={10} />
                                    <YAxis domain={[0, 100]} tick={{fontSize: 12, fill: '#64748B'}} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        cursor={{ stroke: '#94ab8', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                        formatter={(value) => [`${value}%`, `Percentage`]}
                                        labelFormatter={(label) => `Subject: ${label}`}
                                    />
                                    <Line type="monotone" dataKey="percentage" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, fill:'#3B82F6', strokeWidth:2, stroke:'#fff'}} activeDot={{r: 6,}} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full overflow-y-auto pr-2">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                                        <tr><th className="p-3 rounded-tl-lg">Subject</th><th className="p-3">Date</th><th className="p-3 rounded-tr-lg text-right">Score</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[...filteredMarks].reverse().map((m) => (
                                            <tr key={m.id} className="hover:bg-slate-50 transition">
                                                <td className="p-3 font-medium text-slate-700">{m.subject}</td>
                                                <td className="p-3 text-slate-500 text-xs">{m.exam_date}</td>
                                                <td className="p-3 text-right">
                                                    <span className="font-bold text-blue-600">{m.marks}</span>
                                                    <span className="text-slate-400 text-xs">/{m.max_marks}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* NCERT CARD */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-200 flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">NCERT Corner</h2>
                    <p className="text-blue-100 text-sm mb-6">Access official textbooks and solutions specifically for Class {student.class}.</p>
                </div>
                <div className="space-y-3 relative z-10">
                    <a href="https://ncert.nic.in/textbook.php" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-white/20 hover:bg-white/30 backdrop-blur py-3 rounded-xl font-semibold transition border border-white/20">
                        <RiDownloadLine size={18}/> Download Books
                    </a>
                    <a href="https://www.learncbse.in/ncert-solutions-2/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg">
                        <RiExternalLinkLine size={18}/> View Solutions
                    </a>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid md:grid-cols-2 gap-8">
            {/* MATERIALS */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800"><RiBookOpenLine size={24} className="text-blue-500"/> Study Material</h3>
                {/* Subject filter dropdown */}
                <div className="flex items-center gap-2 mb-3">
                    <label htmlFor="materialSubject" className="font-semibold text-sm text-slate-700">Filter:</label>
                    <select
                        id="materialSubject"
                        value={materialSubject}
                        onChange={e => setMaterialSubject(e.target.value)}
                        className="text-sm px-3 py-1 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="All">All Subjects</option>
                        {materialSubjects.map(subj => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                    </select>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-100 min-h-[200px] max-h-[400px] overflow-y-auto shadow-sm">
                    {loadingContent ? <p className="text-center py-10 text-slate-400">Loading notes...</p> : 
                     (!filteredMaterials || filteredMaterials.length === 0) ? <p className="text-center py-12 text-slate-400">No notes found for Class {student.class}{materialSubject !== 'All' ? ` (${materialSubject})` : ""}.</p> : (
                        filteredMaterials.map(m => (
                            <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className={`${cardBase} ${cardHover} group mb-3`}>
                                <div>
                                    <p className="font-bold text-slate-700 group-hover:text-blue-600 transition">{m.title}</p>
                                    <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded mt-1 inline-block">{m.subject}</span>
                                </div>
                                <div className="bg-blue-50 text-blue-600 p-2 rounded-full group-hover:bg-blue-600 group-hover:text-white transition">
                                    <RiExternalLinkLine size={18}/>
                                </div>
                            </a>
                        ))
                    )}
                </div>
            </div>

            {/* QUIZZES */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800"><RiQuestionAnswerLine size={24} className="text-purple-500"/> Active Quizzes</h3>
                <div className="bg-white p-5 rounded-3xl border border-slate-100 min-h-[200px] max-h-[400px] overflow-y-auto shadow-sm">
                    {loadingContent ? <p className="text-center py-10 text-slate-400">Loading quizzes...</p> : 
                     quizzes.length === 0 ? <p className="text-center py-12 text-slate-400">No quizzes active currently.</p> : (
                        quizzes.map(q => (
                            <a key={q.id} href={q.link} target="_blank" rel="noreferrer" className={`${cardBase} hover:border-purple-200 hover:shadow-md group mb-3`}>
                                <div>
                                    <p className="font-bold text-slate-800 group-hover:text-purple-700">{q.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{q.topic}</p>
                                </div>
                                <div className="bg-purple-50 text-purple-600 p-2 rounded-full shadow-sm group-hover:scale-110 transition">
                                    <RiQuestionAnswerLine size={20}/>
                                </div>
                            </a>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* ── ATTENDANCE SECTION ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2.5 rounded-xl">
                <RiCalendarCheckLine size={22} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Attendance Register</h3>
                <p className="text-xs text-slate-400 mt-0.5">Live data from the class attendance sheet</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Reload button */}
              <button
                onClick={() => setIframeKey(k => k + 1)}
                title="Refresh sheet"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 px-3 py-2 rounded-lg transition"
              >
                <RiRefreshLine size={16} /> Refresh
              </button>

              {/* Expand / Collapse button */}
              <button
                onClick={() => setAttendanceExpanded(v => !v)}
                title={attendanceExpanded ? 'Collapse' : 'Expand'}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-2 rounded-lg transition"
              >
                <RiExpandUpDownLine size={16} />
                {attendanceExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>

          {/* Embedded Google Sheet iframe */}
          <div
            className="transition-all duration-500 ease-in-out overflow-hidden"
            style={{ height: attendanceExpanded ? '600px' : '380px' }}
          >
            {ATTENDANCE_SHEET_URL.includes('YOUR_SHEET_ID') ? (
              /* ── Placeholder shown until the real URL is configured ── */
              <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-400 px-6 text-center">
                <RiCalendarCheckLine size={48} className="text-slate-300" />
                <div>
                  <p className="font-semibold text-slate-500 text-base">Sheet not configured yet</p>
                  <p className="text-sm mt-1 max-w-sm">
                    Replace <code className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-xs font-mono">ATTENDANCE_SHEET_URL</code> at the top of this file with your published Google Sheet link to show live attendance data here.
                  </p>
                </div>
                <a
                  href="https://support.google.com/docs/answer/37579"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:underline"
                >
                  <RiExternalLinkLine size={14}/> How to publish a Google Sheet
                </a>
              </div>
            ) : (
              <iframe
                key={iframeKey}
                src={ATTENDANCE_SHEET_URL}
                title="Attendance Sheet"
                width="100%"
                height="100%"
                frameBorder="0"
                className="block"
                loading="lazy"
              />
            )}
          </div>

          {/* Footer hint */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-400">
              Data is pulled live from Google Sheets. Hit <strong>Refresh</strong> if it looks outdated.
            </p>
            {!ATTENDANCE_SHEET_URL.includes('YOUR_SHEET_ID') && (
              <a
                href={ATTENDANCE_SHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline shrink-0"
              >
                <RiExternalLinkLine size={13}/> Open in Sheets
              </a>
            )}
          </div>
        </div>
        {/* ── END ATTENDANCE SECTION ────────────────────────────────────────── */}

      </div>
    </div>
  );
};

export default StudentDashboard;
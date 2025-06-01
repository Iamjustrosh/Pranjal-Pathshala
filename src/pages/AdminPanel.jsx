import React from 'react'

const AdminPanel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [section, setSection] = useState('materials');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) navigate('/login');
      else setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const logout = () => {
    auth.signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button onClick={logout} className="text-red-500">Logout</button>
      </div>

      <div className="flex gap-4 mb-4">
        <button onClick={() => setSection('materials')} className="bg-blue-500 text-white px-4 py-2 rounded">Study Materials</button>
        <button onClick={() => setSection('quiz')} className="bg-green-500 text-white px-4 py-2 rounded">Quizzes</button>
        {/* <button onClick={() => setSection('admissions')} className="bg-gray-500 text-white px-4 py-2 rounded">Admissions</button> */}
      </div>

      {section === 'materials' && <StudyMaterialForm />}
      {section === 'quiz' && <LiveQuizForm />}
      {/* {section === 'admissions' && <AdmissionList />} */}
    </div>
  );
};

export default AdminPanel;

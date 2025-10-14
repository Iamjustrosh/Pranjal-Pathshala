import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import StudyMaterialForm from '../components/StudyMaterialForm';
import LiveQuizForm from '../components/LiveQuizForm';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [section, setSection] = useState('materials');

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Auth check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) navigate('/login');
      else setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch students
  const fetchStudents = async () => {
    setLoadingStudents(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) console.error(error);
    else setStudents(data);
    setLoadingStudents(false);
  };

  useEffect(() => {
    if (section === 'students') fetchStudents();
  }, [section]);

  // Logout
  const logout = () => {
    auth.signOut();
    navigate('/login');
  };

  // Approve student (optional, for immediate approve)
  const approveStudent = async (id) => {
    const { error } = await supabase.rpc('approve_student', { p_id: id });
    if (error) console.error(error);
    else {
      alert('Student approved');
      fetchStudents();
    }
  };

  // Reject student
  const rejectStudent = async (id) => {
    const { error } = await supabase.rpc('reject_student', { p_id: id });
    if (error) console.error(error);
    else {
      alert('Student rejected');
      fetchStudents();
    }
};


  // Generate usernames & passwords
  const assignUsernames = async () => {
    const year = new Date().getFullYear();
    const { error } = await supabase.rpc('assign_usernames', { year });
    if (error) console.error(error);
    else {
      alert('Usernames and passwords assigned!');
      fetchStudents();
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button onClick={logout} className="text-red-500">Logout</button>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setSection('materials')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Study Materials
        </button>
        <button
          onClick={() => setSection('quiz')}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Quizzes
        </button>
        <button
          onClick={() => setSection('students')}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Student Management
        </button>
      </div>

      {section === 'materials' && <StudyMaterialForm />}
      {section === 'quiz' && <LiveQuizForm />}

      {section === 'students' && (
        <div className='overflow-x-auto'>
          <button
            onClick={assignUsernames}
            className="bg-purple-500 text-white px-4 py-2 rounded mb-4"
          >
            Generate Usernames & Passwords
          </button>

          {loadingStudents ? (
            <p>Loading students...</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300 ">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Class</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Username</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="border px-2 py-1">{student.student_name}</td>
                    <td className="border px-2 py-1">{student.class}</td>
                    <td className="border px-2 py-1">{student.status}</td>
                    <td className="border px-2 py-1">{student.username || '-'}</td>
                    <td className="border px-2 py-1 flex gap-2">
                      {student.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveStudent(student.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectStudent(student.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {student.status === 'approved' && <span className="text-green-600">Approved</span>}
                      {student.status === 'rejected' && <span className="text-red-600">Rejected</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

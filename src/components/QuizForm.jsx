import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

const QuizForm = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], answer: '' }]);
  const [message, setMessage] = useState('');
  const [quizList, setQuizList] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const snapshot = await getDocs(collection(db, 'quizzes'));
      setQuizList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchQuizzes();
  }, [message]);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === 'question' || field === 'answer') {
      updated[index][field] = value;
    } else {
      updated[index].options[field] = value;
    }
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'quizzes'), {
      title,
      subject,
      class: classLevel,
      questions,
    });
    setMessage('Quiz uploaded successfully!');
    setTitle('');
    setSubject('');
    setClassLevel('');
    setQuestions([{ question: '', options: ['', '', '', ''], answer: '' }]);
  };

  const deleteQuiz = async (id) => {
    await deleteDoc(doc(db, 'quizzes', id));
    setMessage('Quiz deleted successfully!');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Add Quiz</h2>
      {message && <p className="text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Quiz Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 w-full rounded" required />
        <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="border p-2 w-full rounded" required />
        <input type="text" placeholder="Class" value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className="border p-2 w-full rounded" required />
        {questions.map((q, index) => (
          <div key={index} className="border p-4 rounded space-y-2">
            <input type="text" placeholder="Question" value={q.question} onChange={(e) => handleQuestionChange(index, 'question', e.target.value)} className="border p-2 w-full rounded" />
            {q.options.map((opt, i) => (
              <input key={i} type="text" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => handleQuestionChange(index, i, e.target.value)} className="border p-2 w-full rounded" />
            ))}
            <input type="text" placeholder="Correct Answer" value={q.answer} onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)} className="border p-2 w-full rounded" />
          </div>
        ))}
        <button type="button" onClick={addQuestion} className="bg-gray-300 px-3 py-1 rounded">Add Another Question</button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Upload Quiz</button>
      </form>

      <h3 className="text-lg font-bold mt-8">Existing Quizzes</h3>
      <ul className="space-y-2">
        {quizList.map((quiz) => (
          <li key={quiz.id} className="border p-4 rounded flex justify-between items-center">
            <span>{quiz.title} - Class {quiz.class} - {quiz.subject}</span>
            <button onClick={() => deleteQuiz(quiz.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizForm;
import React from 'react';
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext'; // <--- IMPORT THIS

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import AdmissionForm from "./pages/AdmissionForm";
import NewAdmissionForm from "./pages/NewAdmissionForm";
import AdmissionPDF from "./pages/AdmissionPDF";
import StudyMaterial from "./pages/StudyMaterial";
import Contact from "./pages/Contact";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import Quiz from "./pages/Quiz"; 

// Styles
import 'remixicon/fonts/remixicon.css';

function App() {
  return (
    <AuthProvider> {/* <--- WRAP EVERYTHING INSIDE THIS */}
      <div className="min-h-screen flex flex-col overflow-x-hidden">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admission" element={<AdmissionForm />} />
            <Route path="/new-admission" element={<NewAdmissionForm />} />
            <Route path="/admission-pdf" element={<AdmissionPDF />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/study-material" element={<StudyMaterial />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Protected Admin Route */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
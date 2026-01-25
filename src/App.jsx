import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AdmissionForm from "./pages/AdmissionForm";
import Quiz from "./pages/Quiz";
import StudyMaterial from "./pages/StudyMaterial";
import Contact from "./pages/Contact";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import 'remixicon/fonts/remixicon.css';
import InstallPWA from "./components/InstallPWA";
import NewAdmissionForm from "./pages/NewAdmissionForm";
import AdmissionPDF from "./pages/AdmissionPDF";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/StudentDashboard";

function App() {
  return (
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
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/login" element={<Login />} />

        </Routes>
      </main>
      {/* <InstallPWA /> */}
      <Footer />
    </div>
  );
}

export default App;

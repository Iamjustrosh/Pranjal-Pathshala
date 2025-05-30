import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AdmissionForm from "./pages/AdmissionForm";
import Quiz from "./pages/Quiz";
import StudyMaterial from "./pages/StudyMaterial";
import Contact from "./pages/Contact";
import AdminPanel from "./pages/AdminPanel";
import 'remixicon/fonts/remixicon.css';


function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admission" element={<AdmissionForm />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/study-material" element={<StudyMaterial />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

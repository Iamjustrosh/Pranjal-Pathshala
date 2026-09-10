import React from 'react';
import {
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import NewAdmissionForm from './pages/NewAdmissionForm';
import AdmissionPDF from './pages/AdmissionPDF';
import StudyMaterial from './pages/StudyMaterial';
import Contact from './pages/Contact';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import Quiz from './pages/Quiz';
import Labs from './pages/Labs';
import StudentNotifications from './pages/StudentNotifications';

// Styles
import 'remixicon/fonts/remixicon.css';

function AppContent() {
  const location = useLocation();

  // Pages that should use their own full-screen application layout
  // instead of the main public website Navbar/Footer.
  const standaloneRoutes = [
    '/student-dashboard',
  ];

  const isStandalonePage = standaloneRoutes.some(
    (route) =>
      location.pathname === route ||
      location.pathname.startsWith(`${route}/`)
  );

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {!isStandalonePage && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/new-admission"
            element={<NewAdmissionForm />}
          />

          <Route
            path="/admission-pdf"
            element={<AdmissionPDF />}
          />

          <Route
            path="/quiz"
            element={<Quiz />}
          />

          <Route
            path="/labs"
            element={<Labs />}
          />

          <Route
            path="/study-material"
            element={<StudyMaterial />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'admin',
                  'super_admin',
                ]}
              >
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Protected Student App */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={['student']}
              >
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-dashboard/notifications"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentNotifications />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!isStandalonePage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
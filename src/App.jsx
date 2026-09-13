import React, { lazy, Suspense } from 'react';
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
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
import AdminDashboard from './pages/admin/AdminDashboard';
import AdmissionsPage from './pages/admin/AdmissionsPage';
import ClassManagerPage from './pages/admin/ClassManagerPage';
import ResultsPage from './pages/admin/ResultsPage';
import MaterialsPage from './pages/admin/MaterialsPage';
import QuizzesPage from './pages/admin/QuizzesPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AttendancePage from './pages/admin/AttendancePage';
import NotificationsPage from './pages/admin/NotificationsPage';
import SettingsPage from './pages/admin/SettingsPage';
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
    '/admin',
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
                <Suspense fallback={<div className="p-8 text-slate-500" role="status">Loading admin console...</div>}><AdminPanel /></Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="admissions" element={<AdmissionsPage />} />
            <Route path="students" element={<ClassManagerPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="materials" element={<MaterialsPage />} />
            <Route path="quizzes" element={<QuizzesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

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

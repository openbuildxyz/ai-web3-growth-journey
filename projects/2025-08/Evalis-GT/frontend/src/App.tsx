import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import LandingPage from './pages/LandingPage';
import GetStarted from './pages/GetStarted';
import TeacherPortal from './pages/TeacherPortal';
import StudentPortal from './pages/StudentPortal';
import AdminPortal from './pages/AdminPortal';
import Login from './pages/Login';
import AuthListener from './components/AuthListener';
import AuthPersistenceHandler from './components/AuthPersistenceHandler';

// Import token refresh interceptor
import './api/tokenRefresh';
import './api/sessionManager';

// Import new isolated auth pages
import AdminSignIn from './pages/AdminSignIn';
import AdminSignUp from './pages/AdminSignUp';
import TeacherSignIn from './pages/TeacherSignIn';
import TeacherSignUp from './pages/TeacherSignUp';
import StudentSignIn from './pages/StudentSignIn';
import StudentSignUp from './pages/StudentSignUp';
import VerifyCertificate from './pages/VerifyCertificate';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthListener />
        <AuthPersistenceHandler />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Portal Routes */}
          <Route path="/admin/sign-in/*" element={<AdminSignIn />} />
          <Route path="/admin/sign-up/*" element={<AdminSignUp />} />
          <Route path="/admin" element={<AdminPortal />} />
          
          {/* Teacher Portal Routes */}
          <Route path="/teacher/sign-in/*" element={<TeacherSignIn />} />
          <Route path="/teacher/sign-up/*" element={<TeacherSignUp />} />
          <Route path="/teacher" element={<TeacherPortal />} />
          
          {/* Student Portal Routes */}
          <Route path="/student/sign-in/*" element={<StudentSignIn />} />
          <Route path="/student/sign-up/*" element={<StudentSignUp />} />
          <Route path="/student" element={<StudentPortal />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />
          
          {/* Fallback redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

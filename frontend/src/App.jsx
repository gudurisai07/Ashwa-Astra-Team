import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Applications from './pages/Applications';
import CandidateDashboard from './pages/CandidateDashboard';
import Home from './pages/Home';
import InterviewPreparation from './pages/InterviewPreparation';
import JobDetails from './pages/JobDetails';
import JobMatching from './pages/JobMatching';
import Jobs from './pages/Jobs';
import Login from './pages/Login';
import PostJob from './pages/PostJob';
import RecruiterDashboard from './pages/RecruiterDashboard';
import Register from './pages/Register';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import ResumeImprovement from './pages/ResumeImprovement';

function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'RECRUITER' ? '/recruiter' : '/candidate'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/applications" element={<Applications />} />

          <Route element={<ProtectedRoute roles={['CANDIDATE']} />}>
            <Route path="/candidate" element={<CandidateDashboard />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/job-matching" element={<JobMatching />} />
            <Route path="/interview-prep" element={<InterviewPreparation />} />
            <Route path="/resume-improvement" element={<ResumeImprovement />} />
          </Route>

          <Route element={<ProtectedRoute roles={['RECRUITER']} />}>
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            <Route path="/jobs/new" element={<PostJob />} />
            <Route path="/jobs/:id/edit" element={<PostJob />} />
          </Route>

          <Route path="/jobs/:id" element={<JobDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

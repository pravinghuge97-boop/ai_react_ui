import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../routes/ProtectedRoute'
import AppLayout from '../components/layout/AppLayout'
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import LeadsPage from '../pages/leads/LeadsPage'
import CallLogsPage from '../pages/calls/CallLogsPage'
import UploadTrackingPage from '../pages/uploads/UploadTrackingPage'
import PublicUploadPage from '../pages/uploads/PublicUploadPage'

const ProtectedShell = ({ children }) => <AppLayout>{children}</AppLayout>

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/upload/:token" element={<PublicUploadPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<ProtectedShell><DashboardPage /></ProtectedShell>} />
        <Route path="/leads" element={<ProtectedShell><LeadsPage /></ProtectedShell>} />
        <Route path="/call-logs" element={<ProtectedShell><CallLogsPage /></ProtectedShell>} />
        <Route path="/upload-tracking" element={<ProtectedShell><UploadTrackingPage /></ProtectedShell>} />
      </Route>
    </Routes>
  )
}

export default App

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import ApplyLeave from './modules/PTOTracker/ApplyLeave';
import LeaveRequests from './modules/PTOTracker/LeaveRequests';
import StandupDashboard from './modules/StandupAI/StandupDashboard';
import Login from './pages/Login';
import Register from './pages/register';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      return (token && savedUser) ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <Router>
      {user ? (
        <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
          <Navbar user={user} onLogout={handleLogout} />
          <div className="flex flex-1 flex-col md:flex-row">
            <Sidebar role={user?.role || 'Employee'} />
            <main className="flex-1 bg-slate-950 p-6 md:p-8 overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                <Routes>
                  <Route path="/pto/apply" element={<ProtectedRoute><ApplyLeave /></ProtectedRoute>} />
                  <Route path="/pto/requests" element={<ProtectedRoute><LeaveRequests /></ProtectedRoute>} />
                  <Route path="/standup" element={<ProtectedRoute><StandupDashboard /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/standup" replace />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}
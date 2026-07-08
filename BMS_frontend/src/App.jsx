import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import InstanceList from './pages/InstanceList.jsx';
import AddEditInstance from './pages/AddEditInstance.jsx';
import InstanceDetails from './pages/InstanceDetails.jsx';
import ManualBackup from './pages/ManualBackup.jsx';
import BackupHistory from './pages/BackupHistory.jsx';
import ScheduleBackup from './pages/ScheduleBackup.jsx';

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/instances" element={<ProtectedRoute><InstanceList /></ProtectedRoute>} />
            <Route path="/instances/new" element={<ProtectedRoute><AddEditInstance /></ProtectedRoute>} />
            <Route path="/instances/:id" element={<ProtectedRoute><InstanceDetails /></ProtectedRoute>} />
            <Route path="/instances/:id/edit" element={<ProtectedRoute><AddEditInstance /></ProtectedRoute>} />
            <Route path="/backup/run" element={<ProtectedRoute><ManualBackup /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><BackupHistory /></ProtectedRoute>} />
            <Route path="/schedules" element={<ProtectedRoute><ScheduleBackup /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import LibrarianDashboard from './pages/LibrarianDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Home from './pages/Home';

export default function App(){
  // simple auth guard using token in localStorage
  const token = localStorage.getItem('ils_token');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/librarian/*" element={ token ? <LibrarianDashboard /> : <Navigate to="/login" /> } />
      <Route path="/student/*" element={ token ? <StudentDashboard /> : <Navigate to="/login" /> } />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

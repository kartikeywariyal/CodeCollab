import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { Sessions } from './components/Sessions';
import CodeEditor from './components/CodeEditor';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (stored && token) return JSON.parse(stored);
    } catch { /* ignore parse errors */ }
    return null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Routes>
      <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
      <Route path="/editor/:roomId" element={<CodeEditor />} />
      <Route path="/signin" element={<Auth onLogin={handleLogin} />} />
      <Route path="/signup" element={<Auth onLogin={handleLogin} />} />
      <Route path="/sessions" element={<Sessions user={user} />} />
    </Routes>
  );
}

export default App;

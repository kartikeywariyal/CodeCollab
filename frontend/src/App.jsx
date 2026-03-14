import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { Sessions } from './components/Sessions';
import CodeEditor from './components/CodeEditor';
function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <Routes>
      <Route path="/" element={<Dashboard user={user} onLogout={() => setUser(null)} />} />
      <Route path="/editor" element={<CodeEditor />} />
      <Route path="/signin" element={<Auth onLogin={handleLogin} />} />
      <Route path="/signup" element={<Auth onLogin={handleLogin} />} />
      <Route path="/sessions" element={<Sessions />} />
    </Routes>
  );
}

export default App;

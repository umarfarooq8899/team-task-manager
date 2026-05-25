import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Test backend connection
    axios.get('http://localhost:5000/')
      .then(response => setMessage(response.data.message))
      .catch(error => console.error('Error connecting to backend:', error));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 text-gray-800">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Team Task Manager</h1>
      <p className="text-lg mb-8">Frontend is running with React + Vite + Tailwind!</p>
      
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-semibold mb-2">Backend Connection Status:</h2>
        {message ? (
          <p className="text-green-600 font-medium">✅ {message}</p>
        ) : (
          <p className="text-red-500 font-medium">❌ Not connected (Start the backend server)</p>
        )}
      </div>
    </div>
  );
}

function Tasks() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
      <p className="text-gray-600 mt-2">Task management features will go here.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <nav className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex gap-6">
            <Link to="/" className="font-bold hover:text-blue-200 transition">Home</Link>
            <Link to="/tasks" className="font-bold hover:text-blue-200 transition">Tasks</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

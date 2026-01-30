import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from '@/sections/HomePage';
import CreateJobPage from '@/sections/CreateJobPage';
import DashboardPage from '@/sections/DashboardPage';
import ApplyPage from '@/sections/ApplyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-job" element={<CreateJobPage />} />
        <Route path="/dashboard/:jobId" element={<DashboardPage />} />
        <Route path="/apply/:jobId" element={<ApplyPage />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { SubmitComplaint } from './pages/SubmitComplaint';
import { ComplaintList } from './pages/ComplaintList';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentLogin } from './pages/StudentLogin';
import { EmailToast } from './components/EmailToast';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/submit" element={<SubmitComplaint />} />
          <Route path="/view" element={<ComplaintList />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <EmailToast />
      </Layout>
    </HashRouter>
  );
};

export default App;

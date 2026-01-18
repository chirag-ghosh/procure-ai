import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import { CreateRFP } from './components/RFP/CreateRFP';
import { VendorList } from './components/Vendors/VendorList';
import { RFPList } from './components/RFP/RFPList';
import { RFPDetail } from './components/RFP/RFPDetail';
import './styles/index.scss'; 

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<CreateRFP />} />
            <Route path="/vendors" element={<VendorList />} />
            <Route path="/rfps" element={<RFPList />} />
            <Route path="/rfps/:id" element={<RFPDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

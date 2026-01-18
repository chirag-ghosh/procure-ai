import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Bot } from 'lucide-react';
import './Sidebar.scss';

export const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <Bot size={28} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
        Procure<span>AI</span>
      </div>
      
      <nav>
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
          <LayoutDashboard size={20} />
          AI Generator
        </NavLink>
        
        <NavLink to="/rfps" className={({ isActive }) => (isActive ? 'active' : '')}>
          <FileText size={20} />
          My RFPs
        </NavLink>
        
        <NavLink to="/vendors" className={({ isActive }) => (isActive ? 'active' : '')}>
          <Users size={20} />
          Vendors
        </NavLink>
      </nav>
    </div>
  );
};

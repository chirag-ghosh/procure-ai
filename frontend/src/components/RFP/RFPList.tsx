import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search } from 'lucide-react';
import type { RFP } from '../../types';
import './RFP.scss';
import { formatDate } from '../../utils';

export const RFPList: React.FC = () => {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
    const [rfps, setRfps] = useState<RFP[]>([]);
  
    const refreshData = async () => {
      try {
        const res = await fetch(`${API_URL}/rfps`);
        const data = await res.json();
        setRfps(data);
      } catch (e) {
        console.error("API Error:", e);
      }
    };
  
    useEffect(() => {
      refreshData();
    }, [])

  return (
    <div className="rfp-page">
      <div className="page-header">
        <h2>Procurements</h2>
      </div>

      <div className="rfp-list">
        {rfps.map((rfp) => (
          <div 
            key={rfp.id} 
            className="rfp-item"
            onClick={() => navigate(`/rfps/${rfp.id}`)}
          >
            <div className="info">
              <h3>{rfp.title}</h3>
              <div className="meta">
                <span>
                  <Calendar size={14} style={{ marginRight: '4px' }} />
                  {formatDate(rfp.createdAt)}
                </span>
              </div>
            </div>
            <div className={`status-badge ${rfp.status}`}>
              {rfp.status?.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {rfps.length === 0 && (
        <div className="empty-state-container">
        <div className="icon-circle">
          <Search size={48} color="#787886" />
        </div>
        <h3>No RFPs Found</h3>
        <p>You haven't created any Requests for Proposal yet. <br /> Start by describing what you need.</p>
        <button className="create-btn" onClick={() => navigate('/')}>
          <Plus size={18} /> Create your first RFP
        </button>
      </div>
      )}
    </div>
  );
};

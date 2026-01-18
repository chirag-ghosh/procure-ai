import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bot, CheckSquare, Square, Send } from 'lucide-react';
import type { RFP, Vendor } from '../../types';
import { DynamicDataGrid } from '../shared/DynamicDataGrid';
import { DynamicComparisonTable } from '../shared/DynamicComparisonTable';
import './RFP.scss';

export const RFPDetail: React.FC = () => {
  const { id } = useParams();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rfp, setRfp] = useState<RFP>();
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);
  const [isSending, setIsSending] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const refreshVendors = async () => {
    try {
      const res = await fetch(`${API_URL}/vendors`);
      const data = await res.json();
      setVendors(data);
    } catch (e) {
      console.error("API Error:", e);
    }
  };
    
  const refreshRfp = async () => {
    try {
      const res = await fetch(`${API_URL}/rfps/${id}`);
      const data = await res.json();
      setRfp(data);
    } catch (e) {
      console.error("API Error:", e);
    }
  };

  useEffect(() => {
    refreshVendors();
    refreshRfp();
  }, [])

  const toggleVendor = (vendorId: number) => {
    setSelectedVendorIds(prev => 
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );
  };

  const handleSendRFP = async () => {
    if (selectedVendorIds.length === 0) return;
    setIsSending(true);

    try {
      const res = await fetch(`${API_URL}/rfps/${id}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vendorIds: selectedVendorIds }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      setIsSending(false);
      refreshRfp();

    } catch (error) {
      console.error("Failed to send RFP:", error);
      setIsSending(false);
      alert("Failed to send RFP. Please try again.");
    }
  };

  if(!rfp) {
    return(
      <div>Loading....</div>
    )
  }

  return (
    <div className="rfp-detail-container">
      <header>
        <div className="title-row">
          <h1>{rfp.title}</h1>
          <span className={`status-badge ${rfp.status}`}>{rfp.status.toUpperCase()}</span>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ color: '#787886', fontSize: '0.9rem' }}>Structured Requirements</h4>
          <DynamicDataGrid data={rfp.structuredRequirements} />
        </div>
      </header>
      
      <div className="content-body">
        
        {rfp.status == 'draft' && (
          <div className="vendor-selection-section">
          <div className="section-header">
            <h2>Select Vendors to Invite</h2>
          </div>
          <div className="vendor-list-select">
            {vendors.map(vendor => (
              <div 
                key={vendor.id} 
                className={`vendor-select-item ${selectedVendorIds.includes(vendor.id) ? 'selected' : ''}`}
                onClick={() => toggleVendor(vendor.id)}
              >
                <div className="check-icon">
                  {selectedVendorIds.includes(vendor.id) ? <CheckSquare size={20} color="#646cff" /> : <Square size={20} color="#555" />}
                </div>
                <div className="vendor-info">
                  <h4>{vendor.name} ({vendor.contactPerson})</h4>
                  <span className="tag">{vendor.category}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="action-bar">
            <span>{selectedVendorIds.length} vendors selected</span>
            <button className="send-btn" onClick={handleSendRFP} disabled={isSending}>
              {isSending ? 'Sending...' : <>Send Emails <Send size={18} /></>}
            </button>
          </div>
        </div>
        )}

        {rfp.status === 'active' && (
          <div className="comparison-section">
            <h2><Bot color="#646cff" /> AI Proposal Comparison</h2>
            <DynamicComparisonTable proposals={rfp.proposals} />
          </div>
        )}
      </div>
    </div>
  );
};

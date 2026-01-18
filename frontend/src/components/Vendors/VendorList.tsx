import React, { useEffect, useState } from 'react';
import { Plus, Mail, Contact } from 'lucide-react';
import type { Vendor } from '../../types';
import './VendorList.scss';

export const VendorList: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const refreshData = async () => {
    try {
      const res = await fetch(`${API_URL}/vendors`);
      const data = await res.json();
      setVendors(data);
    } catch (e) {
      console.error("API Error:", e);
    }
  };

  useEffect(() => {
    refreshData();
  }, [])

  return (
    <div className="vendor-page">
      <div className="page-header">
        <h2>Vendor Directory</h2>
        <button className="add-btn">
          <Plus size={18} />
          <span>Add Vendor</span>
        </button>
      </div>

      <div className="vendor-grid">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="vendor-card">
            <div className="card-header">
              <h3>{vendor.name}</h3>
              <span className="tag">{vendor.category}</span>
            </div>
            
            <div className="contact-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Contact size={14} /> {vendor.contactPerson}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Mail size={14} /> {vendor.email}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

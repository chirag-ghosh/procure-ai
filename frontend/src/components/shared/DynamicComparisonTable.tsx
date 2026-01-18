import React, { useMemo } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import type { Proposal } from '../../types';
import { formatKey, formatValue } from './Formatters';

interface Props {
  proposals: Proposal[];
}

export const DynamicComparisonTable: React.FC<Props> = ({ proposals }) => {
  
  const dynamicKeys = useMemo(() => {
    const keys = new Set<string>();
    proposals.forEach(p => {
      if (p.extractedData) {
        Object.keys(p.extractedData).forEach(k => keys.add(k));
      }
    });
    return Array.from(keys).sort(); 
  }, [proposals]);

  if (proposals.length === 0) return <div className="empty-state">No vendors invited yet.</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Vendor</th>
            
            {dynamicKeys.map(key => (
              <th key={key}>{formatKey(key)}</th>
            ))}
            
            <th>AI Score</th>
            <th>Analysis</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((proposal) => {
            const data = proposal.extractedData as Record<string, any> || {};
            const isRecommended = (proposal.aiScore || 0) > 90;
            const isPending = proposal.status === 'sent';

            return (
              <tr 
                key={proposal.id} 
                className={`
                  ${isRecommended ? 'recommended' : ''} 
                  ${isPending ? 'pending-row' : ''}
                `}
              >
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong>{proposal.vendor?.name || 'Unknown'}</strong>
                    
                    {isPending && (
                       <span style={{ 
                         fontSize: '0.75rem', 
                         color: '#787886', 
                         display: 'flex', 
                         alignItems: 'center', 
                         gap: '4px',
                         marginTop: '4px'
                       }}>
                         <Clock size={12} /> Awaiting Reply
                       </span>
                    )}
                    {isRecommended && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: '#4caf50', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        marginTop: '4px' 
                      }}>
                        <CheckCircle size={12} /> Recommended
                      </span>
                    )}
                  </div>
                </td>

                {dynamicKeys.map(key => (
                  <td key={key}>
                    {isPending ? (
                      <span className="skeleton-text">Pending...</span>
                    ) : (
                      formatValue(data[key])
                    )}
                  </td>
                ))}

                <td>
                  {isPending ? (
                    <span style={{ color: '#555' }}>-</span>
                  ) : (
                    <span style={{ 
                      color: isRecommended ? '#4caf50' : '#eebb00', 
                      fontWeight: 'bold', 
                      fontFamily: 'Noto Sans Mono' 
                    }}>
                      {proposal.aiScore ? `${proposal.aiScore}/100` : '-'}
                    </span>
                  )}
                </td>

                <td className="analysis-cell">
                  {isPending ? (
                    <span style={{ fontStyle: 'italic', color: '#555' }}>
                      Waiting for vendor response to generate analysis...
                    </span>
                  ) : (
                    proposal.aiSummary || '-'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

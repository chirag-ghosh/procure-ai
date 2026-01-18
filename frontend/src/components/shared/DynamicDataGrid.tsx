import React, { useMemo } from 'react';
import { formatKey, formatValue } from './Formatters';
import './DynamicData.scss';

interface Props {
  data: Record<string, any> | null;
}

export const DynamicDataGrid: React.FC<Props> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return null;

  const { simpleFields, tableFields } = useMemo(() => {
    const simple: [string, any][] = [];
    const tables: [string, any[]][] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        tables.push([key, value]);
      } else {
        simple.push([key, value]);
      }
    });

    return { simpleFields: simple, tableFields: tables };
  }, [data]);

  return (
    <div className="dynamic-data-container">
      {simpleFields.length > 0 && (
        <div className="dynamic-data-grid">
          {simpleFields.map(([key, value]) => (
            <div key={key} className="data-card">
              <div className="label">{formatKey(key)}</div>
              <div className="value">{formatValue(value)}</div>
            </div>
          ))}
        </div>
      )}

      {tableFields.map(([key, list]) => (
        <div key={key} className="dynamic-sub-table">
          <h4>{formatKey(key)}</h4>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {Object.keys(list[0] || {}).map((headerKey) => (
                    <th key={headerKey}>{formatKey(headerKey)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((item, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(item).map((val, cellIndex) => (
                      <td key={cellIndex}>{formatValue(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

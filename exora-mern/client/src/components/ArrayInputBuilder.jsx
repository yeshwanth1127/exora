// client/src/components/ArrayInputBuilder.jsx

import React, { useState } from 'react';
import './ArrayInputBuilder.css';

/**
 * Array Input Builder
 * User-friendly interface for building arrays (e.g., spreadsheet rows)
 * Converts to JSON array automatically
 */
function ArrayInputBuilder({ value, onChange, parameter }) {
  const [rows, setRows] = useState(value || [['']]);

  const handleCellChange = (rowIndex, colIndex, newValue) => {
    const newRows = [...rows];
    
    // Ensure row exists
    if (!newRows[rowIndex]) {
      newRows[rowIndex] = [];
    }
    
    // Update cell
    newRows[rowIndex][colIndex] = newValue;
    
    setRows(newRows);
    onChange(newRows);
  };

  const addRow = () => {
    const newRows = [...rows, ['']];
    setRows(newRows);
    onChange(newRows);
  };

  const removeRow = (rowIndex) => {
    const newRows = rows.filter((_, idx) => idx !== rowIndex);
    setRows(newRows);
    onChange(newRows);
  };

  const addColumn = () => {
    const newRows = rows.map(row => [...row, '']);
    setRows(newRows);
    onChange(newRows);
  };

  const removeColumn = (colIndex) => {
    const newRows = rows.map(row => row.filter((_, idx) => idx !== colIndex));
    setRows(newRows);
    onChange(newRows);
  };

  // Determine number of columns from first row
  const columnCount = rows[0]?.length || 1;

  return (
    <div className="array-input-builder">
      <div className="array-hint">
        {parameter.hint || 'Add rows of data. Each row will become an array in the output.'}
      </div>

      <div className="array-table-container">
        <table className="array-table">
          <thead>
            <tr>
              <th className="row-number">#</th>
              {Array.from({ length: columnCount }).map((_, idx) => (
                <th key={idx}>
                  Column {idx + 1}
                  {columnCount > 1 && (
                    <button 
                      className="remove-col-btn"
                      onClick={() => removeColumn(idx)}
                      title="Remove column"
                    >
                      ✕
                    </button>
                  )}
                </th>
              ))}
              <th className="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="row-number">{rowIndex + 1}</td>
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      className="cell-input"
                      value={row[colIndex] || ''}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      placeholder={`Value ${colIndex + 1}`}
                    />
                  </td>
                ))}
                <td className="actions-col">
                  <button
                    className="remove-row-btn"
                    onClick={() => removeRow(rowIndex)}
                    disabled={rows.length === 1}
                    title="Remove row"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="array-controls">
        <button className="add-row-btn" onClick={addRow}>
          ➕ Add Row
        </button>
        <button className="add-column-btn" onClick={addColumn}>
          ➕ Add Column
        </button>
      </div>

      <div className="array-preview">
        <strong>Preview:</strong>
        <code>{JSON.stringify(rows, null, 2)}</code>
      </div>
    </div>
  );
}

export default ArrayInputBuilder;



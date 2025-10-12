// client/src/components/DynamicFormField.jsx

import React, { useState } from 'react';
import './DynamicFormField.css';

/**
 * Dynamic Form Field Component
 * Renders appropriate input based on parameter type
 * Supports: string, email, url, number, text, json, boolean, date, file
 */
function DynamicFormField({ parameter, value, onChange, error }) {
  const [jsonError, setJsonError] = useState(null);
  const { field, type, label, required, placeholder, hint, defaultValue } = parameter;

  const handleChange = (e) => {
    let newValue = e.target.value;

    // Type-specific processing
    if (type === 'number') {
      newValue = newValue === '' ? '' : parseFloat(newValue);
    } else if (type === 'boolean') {
      newValue = e.target.checked;
    } else if (type === 'json') {
      // Validate JSON
      try {
        if (newValue.trim()) {
          JSON.parse(newValue);
          setJsonError(null);
        }
      } catch (err) {
        setJsonError('Invalid JSON format');
      }
    }

    onChange(newValue);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, store file object
      // TODO: Upload to server and get URL
      onChange(file);
    }
  };

  const renderInput = () => {
    switch (type) {
      case 'email':
        return (
          <input
            type="email"
            className="form-input"
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            required={required}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            className="form-input"
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder || 'https://'}
            required={required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className="form-input"
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
          />
        );

      case 'text':
        return (
          <textarea
            className="form-textarea"
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
            required={required}
            rows={4}
          />
        );

      case 'json':
        return (
          <div className="json-input-container">
            <textarea
              className="form-textarea json-textarea"
              value={value || ''}
              onChange={handleChange}
              placeholder={placeholder || '{"key": "value"}'}
              required={required}
              rows={6}
              spellCheck={false}
            />
            {jsonError && (
              <div className="json-error">⚠️ {jsonError}</div>
            )}
            {hint && (
              <div className="json-hint">💡 {hint}</div>
            )}
          </div>
        );

      case 'boolean':
        return (
          <label className="checkbox-container">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={value || false}
              onChange={handleChange}
            />
            <span className="checkbox-label">
              {hint || `Enable ${label.toLowerCase()}`}
            </span>
          </label>
        );

      case 'date':
      case 'datetime':
        return (
          <input
            type={type === 'datetime' ? 'datetime-local' : 'date'}
            className="form-input"
            value={value || ''}
            onChange={handleChange}
            required={required}
          />
        );

      case 'file':
        return (
          <div className="file-input-container">
            <input
              type="file"
              className="form-file-input"
              onChange={handleFileChange}
              required={required}
            />
            {value && (
              <div className="file-preview">
                📎 {value.name || value}
              </div>
            )}
          </div>
        );

      case 'string':
      default:
        return (
          <input
            type="text"
            className="form-input"
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            required={required}
          />
        );
    }
  };

  return (
    <div className={`dynamic-form-field ${error ? 'has-error' : ''}`}>
      <label className="field-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      
      {renderInput()}
      
      {hint && type !== 'json' && (
        <div className="field-hint">💡 {hint}</div>
      )}
      
      {error && (
        <div className="field-error">❌ {error}</div>
      )}

      {parameter.source === 'expression' && (
        <div className="field-source">
          <small>Detected from: {parameter.nodeContext}</small>
        </div>
      )}
    </div>
  );
}

export default DynamicFormField;


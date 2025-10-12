// client/src/components/DynamicFormRenderer.jsx

import React from 'react';
import DynamicFormField from './DynamicFormField';
import './DynamicFormRenderer.css';

/**
 * Dynamic Form Renderer Component
 * Renders a complete form based on parameter schema
 * Universal form builder that works for any workflow type
 */
function DynamicFormRenderer({ parameters, values, onChange, errors = {} }) {
  
  const handleFieldChange = (field, value) => {
    onChange({
      ...values,
      [field]: value
    });
  };

  const groupedParameters = groupParametersBySection(parameters);

  return (
    <div className="dynamic-form-renderer">
      {Object.keys(groupedParameters).length === 0 && (
        <div className="no-parameters">
          <div className="no-params-icon">⚡</div>
          <p>This workflow doesn't require any input parameters.</p>
          <p className="no-params-hint">Just click "Execute" to run it!</p>
        </div>
      )}

      {Object.entries(groupedParameters).map(([section, params]) => (
        <div key={section} className="form-section">
          {section !== 'default' && (
            <h3 className="section-title">{section}</h3>
          )}
          
          <div className="form-fields">
            {params.map(param => (
              <DynamicFormField
                key={param.field}
                parameter={param}
                value={values[param.field]}
                onChange={(val) => handleFieldChange(param.field, val)}
                error={errors[param.field]}
              />
            ))}
          </div>
        </div>
      ))}

      {parameters.length > 0 && (
        <div className="form-footer-info">
          <small>
            <span className="required-indicator">*</span> Required fields
          </small>
        </div>
      )}
    </div>
  );
}

/**
 * Group parameters by section based on node context
 * @private
 */
function groupParametersBySection(parameters) {
  const groups = {};

  parameters.forEach(param => {
    // Group by node context or use 'default'
    const section = param.nodeContext || 'default';
    
    if (!groups[section]) {
      groups[section] = [];
    }
    
    groups[section].push(param);
  });

  // If only one group and it's 'default', return flat
  if (Object.keys(groups).length === 1 && groups.default) {
    return { default: groups.default };
  }

  return groups;
}

export default DynamicFormRenderer;


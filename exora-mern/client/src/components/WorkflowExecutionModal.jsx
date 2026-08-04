// client/src/components/WorkflowExecutionModal.jsx

import React, { useState, useEffect } from 'react';
import './WorkflowExecutionModal.css';
import DynamicFormRenderer from './DynamicFormRenderer';
import ExecutionResult from './ExecutionResult';
import { API_BASE_URL } from '../config/api';

/**
 * Workflow Execution Modal
 * Main modal for executing workflows with dynamic parameter detection
 */
function WorkflowExecutionModal({ isOpen, onClose, workflow }) {
  const [step, setStep] = useState('loading'); // loading, form, executing, result
  const [parameters, setParameters] = useState([]);
  const [inputs, setInputs] = useState({});
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [workflowInfo, setWorkflowInfo] = useState(null);

  useEffect(() => {
    if (isOpen && workflow) {
      fetchParameters();
    } else {
      // Reset state when closed
      setStep('loading');
      setParameters([]);
      setInputs({});
      setErrors({});
      setResult(null);
    }
  }, [isOpen, workflow]);

  const fetchParameters = async () => {
    try {
      setStep('loading');
      
      const response = await fetch(
        `${API_BASE_URL}/execution/workflow-parameters/${workflow.id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setWorkflowInfo(data.data);
        setParameters(data.data.parameters || []);
        
        // Initialize inputs with default values
        const defaults = {};
        data.data.parameters.forEach(param => {
          if (param.default !== undefined) {
            defaults[param.field] = param.default;
          }
        });
        setInputs(defaults);
        
        setStep('form');
      } else {
        console.error('Failed to fetch parameters:', data.error);
        alert(`Failed to load workflow parameters: ${data.error}`);
        onClose();
      }
    } catch (error) {
      console.error('Error fetching parameters:', error);
      alert('Failed to load workflow parameters. Please try again.');
      onClose();
    }
  };

  const handleExecute = async () => {
    try {
      setStep('executing');
      setErrors({});

      const response = await fetch(`${API_BASE_URL}/execution/execute-workflow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflowId: workflow.id,
          inputs: inputs
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setStep('result');
      } else {
        // Handle validation errors
        if (data.validationErrors) {
          const errorMap = {};
          data.validationErrors.forEach(err => {
            errorMap[err.field] = err.message;
          });
          setErrors(errorMap);
          setStep('form');
          alert('Please fix the validation errors and try again.');
        } else {
          // Execution failed
          setResult({
            success: false,
            status: 'error',
            error: data.error || data.message,
            output: null
          });
          setStep('result');
        }
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      setResult({
        success: false,
        status: 'error',
        error: error.message,
        output: null
      });
      setStep('result');
    }
  };

  const handleRunAgain = () => {
    setStep('form');
    setResult(null);
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="execution-modal-overlay">
      <div className="execution-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2 className="modal-title">
              {step === 'result' ? '📊 Execution Result' : '⚡ Run Automation'}
            </h2>
            <p className="modal-subtitle">
              {workflow?.name || 'Workflow'}
            </p>
          </div>
          <button className="modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Loading State */}
          {step === 'loading' && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing workflow parameters...</p>
            </div>
          )}

          {/* Form Step */}
          {step === 'form' && (
            <div className="form-step">
              <div className="form-intro">
                {parameters.length > 0 ? (
                  <p>Fill in the required information to run this automation:</p>
                ) : (
                  <p>This workflow is ready to execute without any additional input.</p>
                )}
              </div>

              <DynamicFormRenderer
                parameters={parameters}
                values={inputs}
                onChange={setInputs}
                errors={errors}
              />

              <div className="form-actions">
                <button 
                  className="execute-button"
                  onClick={handleExecute}
                >
                  ⚡ Execute Workflow
                </button>
                <button 
                  className="cancel-button"
                  onClick={handleClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Executing State */}
          {step === 'executing' && (
            <div className="executing-state">
              <div className="executing-animation">
                <div className="pulse-circle"></div>
                <div className="pulse-circle-2"></div>
              </div>
              <h3>Executing Workflow...</h3>
              <p>Please wait while your automation runs</p>
              <div className="execution-progress">
                <div className="progress-bar">
                  <div className="progress-fill animated"></div>
                </div>
              </div>
            </div>
          )}

          {/* Result Step */}
          {step === 'result' && (
            <ExecutionResult
              result={result}
              onClose={handleClose}
              onRunAgain={handleRunAgain}
            />
          )}
        </div>

        {/* Modal Footer */}
        {step === 'form' && workflowInfo && (
          <div className="modal-footer">
            <div className="workflow-info">
              <small>
                Workflow: {workflowInfo.workflowName} • 
                Nodes: {workflowInfo.metadata?.nodeCount || 0} • 
                Complexity: {workflowInfo.metadata?.complexity || 'unknown'}
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowExecutionModal;



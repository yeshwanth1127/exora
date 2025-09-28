import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import './WorkflowTemplates.css';

const WorkflowTemplates = ({ onClose, onWorkflowSelected }) => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflows, setSelectedWorkflows] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      console.log('Fetching workflows from API...');
      const response = await fetch(`${API_BASE_URL}/workflows`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Workflows API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Workflows data received:', data);
        setWorkflows(data.workflows || []);
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowToggle = (workflowId) => {
    setSelectedWorkflows(prev => 
      prev.includes(workflowId) 
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const handleSaveSelected = async () => {
    if (selectedWorkflows.length === 0) return;

    setSaving(true);
    try {
      const selectedWorkflowData = workflows.filter(w => selectedWorkflows.includes(w.id));
      
      const response = await fetch(`${API_BASE_URL}/dashboard/workflows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workflows: selectedWorkflowData })
      });

      if (response.ok) {
        onWorkflowSelected(selectedWorkflowData);
        onClose();
      } else {
        console.error('Failed to save workflows');
      }
    } catch (error) {
      console.error('Error saving workflows:', error);
    } finally {
      setSaving(false);
    }
  };

  const getWorkflowIcon = (workflow) => {
    const name = workflow.name.toLowerCase();
    if (name.includes('whatsapp') || name.includes('chatbot')) return '💬';
    if (name.includes('booking') || name.includes('calendar')) return '📅';
    if (name.includes('email')) return '📧';
    if (name.includes('data') || name.includes('sync')) return '🔄';
    return '⚡';
  };

  const getWorkflowCategory = (workflow) => {
    const name = workflow.name.toLowerCase();
    if (name.includes('whatsapp') || name.includes('chatbot')) return 'Communication';
    if (name.includes('booking') || name.includes('calendar')) return 'Scheduling';
    if (name.includes('email')) return 'Email Automation';
    if (name.includes('data') || name.includes('sync')) return 'Data Management';
    return 'General Automation';
  };

  if (loading) {
    return (
      <div className="workflow-templates-overlay">
        <div className="workflow-templates-container">
          <div className="loading-spinner">Loading workflows...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-templates-overlay">
      <div className="workflow-templates-container">
        <div className="workflow-templates-header">
          <h2>Available Workflow Templates</h2>
          <p>Select the workflows you'd like to add to your dashboard</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="workflow-templates-grid">
          {workflows.map((workflow) => (
            <div 
              key={workflow.id} 
              className={`workflow-template-card ${selectedWorkflows.includes(workflow.id) ? 'selected' : ''}`}
              onClick={() => handleWorkflowToggle(workflow.id)}
            >
              <div className="workflow-template-header">
                <div className="workflow-icon">{getWorkflowIcon(workflow)}</div>
                <div className="workflow-status">
                  <span className={`status-indicator ${workflow.active ? 'active' : 'inactive'}`}>
                    {workflow.active ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="workflow-template-content">
                <h3>{workflow.name}</h3>
                <p className="workflow-category">{getWorkflowCategory(workflow)}</p>
                <p className="workflow-description">
                  {workflow.description || 'No description available'}
                </p>
                
                <div className="workflow-stats">
                  <div className="stat">
                    <span className="stat-label">Nodes:</span>
                    <span className="stat-value">{workflow.nodes}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Connections:</span>
                    <span className="stat-value">{workflow.connections}</span>
                  </div>
                </div>

                <div className="workflow-triggers">
                  <strong>Triggers:</strong>
                  <div className="trigger-tags">
                    {workflow.triggers?.slice(0, 2).map((trigger, index) => (
                      <span key={index} className="trigger-tag">
                        {typeof trigger === 'string' ? trigger.replace('n8n-nodes-base.', '') : trigger.type?.replace('n8n-nodes-base.', '') || 'Unknown'}
                      </span>
                    ))}
                    {workflow.triggers?.length > 2 && (
                      <span className="trigger-tag more">+{workflow.triggers.length - 2} more</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="workflow-template-footer">
                <div className="selection-indicator">
                  {selectedWorkflows.includes(workflow.id) ? '✓ Selected' : 'Click to select'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="workflow-templates-footer">
          <div className="selection-summary">
            {selectedWorkflows.length} workflow{selectedWorkflows.length !== 1 ? 's' : ''} selected
          </div>
          <div className="action-buttons">
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
            <button 
              className="save-btn" 
              onClick={handleSaveSelected}
              disabled={selectedWorkflows.length === 0 || saving}
            >
              {saving ? 'Saving...' : `Add ${selectedWorkflows.length} Workflow${selectedWorkflows.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTemplates;

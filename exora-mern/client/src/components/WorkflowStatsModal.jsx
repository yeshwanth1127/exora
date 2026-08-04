import React from 'react';
import './WorkflowStatsModal.css';

const WorkflowStatsModal = ({ isOpen, onClose, stats }) => {
  if (!isOpen || !stats) return null;
  
  return (
    <div className="stats-modal-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stats-modal-header">
          <div>
            <h2>Workflow Statistics</h2>
            <p className="stats-modal-subtitle">{stats.workflowName || 'Loading...'}</p>
          </div>
          <button className="stats-modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="stats-modal-body">
          <div className="stats-grid">
            <div className="stat-card-modal">
              <div className="stat-value-modal">{stats.totalExecutions || 0}</div>
              <div className="stat-label-modal">Total Executions</div>
            </div>
            
            <div className="stat-card-modal">
              <div className="stat-value-modal success">{stats.successfulExecutions || 0}</div>
              <div className="stat-label-modal">Successful</div>
            </div>
            
            <div className="stat-card-modal">
              <div className="stat-value-modal error">{stats.failedExecutions || 0}</div>
              <div className="stat-label-modal">Failed</div>
            </div>
            
            <div className="stat-card-modal">
              <div className="stat-value-modal">{stats.successRate || 0}%</div>
              <div className="stat-label-modal">Success Rate</div>
            </div>
            
            <div className="stat-card-modal">
              <div className="stat-value-modal">{stats.averageExecutionTime || 0}s</div>
              <div className="stat-label-modal">Avg Duration</div>
            </div>
          </div>
          
          {stats.recentExecutions && stats.recentExecutions.length > 0 && (
            <div className="recent-executions">
              <h3>Recent Executions</h3>
              <div className="executions-list">
                {stats.recentExecutions.map(exec => (
                  <div key={exec.id} className="execution-row">
                    <span className={`status-badge ${exec.status}`}>
                      {exec.status === 'success' ? '✅' : '❌'} {exec.status}
                    </span>
                    <span className="execution-time">
                      {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : 'N/A'}
                    </span>
                    <span className="execution-duration">
                      {exec.duration ? `${exec.duration}s` : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(!stats.recentExecutions || stats.recentExecutions.length === 0) && (
            <div className="no-executions">
              <p>No executions yet. This workflow hasn't run.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowStatsModal;


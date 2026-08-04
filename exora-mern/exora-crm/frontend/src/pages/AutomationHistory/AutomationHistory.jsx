import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAutomationHistory, getAutomationStats } from '../../services/api';
import './AutomationHistory.css';

const AutomationHistory = () => {
  const [days, setDays] = useState(7);
  const [filter, setFilter] = useState('all');

  const { data: history } = useQuery({
    queryKey: ['automation-history', days, filter],
    queryFn: () => getAutomationHistory({ 
      days,
      automation_type: filter === 'all' ? undefined : filter 
    })
  });

  const { data: stats } = useQuery({
    queryKey: ['automation-stats', days],
    queryFn: () => getAutomationStats(days)
  });

  const automationTypes = [
    { key: 'all', label: 'All Automations' },
    { key: 'ai_response', label: 'AI Responses' },
    { key: 'reminder', label: 'Reminders' },
    { key: 'confirmation', label: 'Confirmations' },
    { key: 'calendar_sync', label: 'Calendar Sync' },
    { key: 'notification', label: 'Notifications' }
  ];

  return (
    <div className="automation-history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Automation History</h1>
          <p className="page-subtitle">Track all automated actions in your CRM</p>
        </div>
      </div>

      {stats && (
        <div className="stats-summary">
          <div className="stat-box">
            <span className="stat-label">Total Automations</span>
            <span className="stat-value">{stats.summary.total_automations}</span>
          </div>
          <div className="stat-box success">
            <span className="stat-label">Successful</span>
            <span className="stat-value">{stats.summary.successful}</span>
          </div>
          <div className="stat-box failed">
            <span className="stat-label">Failed</span>
            <span className="stat-value">{stats.summary.failed}</span>
          </div>
          <div className="stat-box rate">
            <span className="stat-label">Success Rate</span>
            <span className="stat-value">{stats.summary.success_rate}%</span>
          </div>
        </div>
      )}

      <div className="filters">
        <div className="filter-group">
          <label>Time Period:</label>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {automationTypes.map(type => (
              <option key={type.key} value={type.key}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="history-list">
        {history?.automation_history?.map((item) => (
          <div key={item.id} className={`history-item ${item.result}`}>
            <div className="history-icon">
              {item.result === 'success' ? '✅' : '❌'}
            </div>
            <div className="history-content">
              <div className="history-header">
                <span className="history-type">{item.automation_type}</span>
                <span className="history-time">
                  {new Date(item.executed_at).toLocaleString()}
                </span>
              </div>
              <p className="history-action">{item.action_taken}</p>
              {item.contact_name && (
                <span className="history-contact">Contact: {item.contact_name}</span>
              )}
              {item.event_title && (
                <span className="history-event">Event: {item.event_title}</span>
              )}
              {item.error_message && (
                <p className="history-error">{item.error_message}</p>
              )}
            </div>
            <div className={`history-result ${item.result}`}>
              {item.result}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomationHistory;


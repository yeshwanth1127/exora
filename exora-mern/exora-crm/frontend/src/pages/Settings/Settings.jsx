import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import './Settings.css';

const Settings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('business');
  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    admin_email: '',
    admin_whatsapp: '',
    whatsapp_instance_name: '',
    telegram_chat_id: '',
    notify_admin_email: true,
    notify_admin_whatsapp: true,
    notify_admin_telegram: true
  });

  // Fetch current user settings
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    }
  });

  // Fetch industry templates
  const { data: industriesData } = useQuery({
    queryKey: ['industries'],
    queryFn: async () => {
      const res = await api.get('/industry/templates');
      return res.data;
    }
  });

  useEffect(() => {
    if (userData?.crm_user) {
      setFormData({
        business_name: userData.crm_user.business_name || '',
        industry: userData.crm_user.industry || '',
        admin_email: userData.crm_user.admin_email || '',
        admin_whatsapp: userData.crm_user.admin_whatsapp || '',
        whatsapp_instance_name: userData.crm_user.whatsapp_instance_name || '',
        telegram_chat_id: userData.crm_user.telegram_chat_id || '',
        notify_admin_email: userData.crm_user.notify_admin_email ?? true,
        notify_admin_whatsapp: userData.crm_user.notify_admin_whatsapp ?? true,
        notify_admin_telegram: userData.crm_user.notify_admin_telegram ?? true
      });
    }
  }, [userData]);

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.put('/settings/business', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-settings']);
      alert('Settings updated successfully!');
    },
    onError: (error) => {
      alert('Failed to update settings: ' + (error.response?.data?.error || error.message));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="settings-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your CRM configuration and preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            🏢 Business Info
          </button>
          <button
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
          </button>
          <button
            className={`tab-button ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            🔗 Integrations
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'business' && (
            <form onSubmit={handleSubmit} className="settings-form">
              <h2>Business Information</h2>
              
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => handleChange('business_name', e.target.value)}
                  placeholder="Your business name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  required
                >
                  <option value="">Select industry...</option>
                  {industriesData?.industries?.map(ind => (
                    <option key={ind.key} value={ind.key}>{ind.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Admin Email</label>
                <input
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) => handleChange('admin_email', e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={handleSubmit} className="settings-form">
              <h2>Notification Preferences</h2>
              
              <div className="form-section">
                <h3>Admin Notifications</h3>
                <p className="section-description">Choose how you want to receive notifications</p>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.notify_admin_email}
                      onChange={(e) => handleChange('notify_admin_email', e.target.checked)}
                    />
                    <span>Email Notifications</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.notify_admin_whatsapp}
                      onChange={(e) => handleChange('notify_admin_whatsapp', e.target.checked)}
                    />
                    <span>WhatsApp Notifications</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.notify_admin_telegram}
                      onChange={(e) => handleChange('notify_admin_telegram', e.target.checked)}
                    />
                    <span>Telegram Notifications</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Admin WhatsApp Number</label>
                <input
                  type="text"
                  value={formData.admin_whatsapp}
                  onChange={(e) => handleChange('admin_whatsapp', e.target.value)}
                  placeholder="+55 11 98765-4321"
                />
                <span className="field-hint">For receiving important notifications</span>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'integrations' && (
            <form onSubmit={handleSubmit} className="settings-form">
              <h2>Integration Settings</h2>
              
              <div className="integration-card">
                <div className="integration-header">
                  <span className="integration-icon">💬</span>
                  <h3>WhatsApp (Evolution API)</h3>
                  <span className={`status-badge ${formData.whatsapp_instance_name ? 'connected' : ''}`}>
                    {formData.whatsapp_instance_name ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <div className="form-group">
                  <label>Instance Name</label>
                  <input
                    type="text"
                    value={formData.whatsapp_instance_name}
                    onChange={(e) => handleChange('whatsapp_instance_name', e.target.value)}
                    placeholder="my-business-instance"
                  />
                  <span className="field-hint">Your Evolution API instance name</span>
                </div>
              </div>

              <div className="integration-card">
                <div className="integration-header">
                  <span className="integration-icon">📱</span>
                  <h3>Telegram Bot</h3>
                  <span className={`status-badge ${formData.telegram_chat_id ? 'connected' : ''}`}>
                    {formData.telegram_chat_id ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <div className="form-group">
                  <label>Telegram Chat ID</label>
                  <input
                    type="text"
                    value={formData.telegram_chat_id}
                    onChange={(e) => handleChange('telegram_chat_id', e.target.value)}
                    placeholder="123456789"
                  />
                  <span className="field-hint">Message @userinfobot on Telegram to get your chat ID</span>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

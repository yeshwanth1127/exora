import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './Automations.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-api.exora.solutions/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Automations = () => {
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState(null);
  const [configData, setConfigData] = useState({});

  // Fetch available modules
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ['automation-modules'],
    queryFn: async () => {
      const res = await api.get('/automations/modules');
      return res.data;
    }
  });

  // Fetch user's enabled configs
  const { data: configsData, isLoading: configsLoading } = useQuery({
    queryKey: ['automation-configs'],
    queryFn: async () => {
      const res = await api.get('/automations/configs');
      return res.data;
    }
  });

  // Enable automation mutation
  const enableMutation = useMutation({
    mutationFn: async ({ module_key, config_data }) => {
      const res = await api.post('/automations/enable', { module_key, config_data });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['automation-configs']);
      setSelectedModule(null);
      setConfigData({});
    }
  });

  // Update config mutation
  const updateMutation = useMutation({
    mutationFn: async ({ module_key, config_data }) => {
      const res = await api.put(`/automations/${module_key}/config`, { config_data });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['automation-configs']);
      setSelectedModule(null);
      setConfigData({});
    }
  });

  // Disable mutation
  const disableMutation = useMutation({
    mutationFn: async (module_key) => {
      const res = await api.delete(`/automations/${module_key}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['automation-configs']);
    }
  });

  const modules = modulesData?.modules || [];
  const enabledConfigs = configsData?.configs || [];
  const enabledModuleKeys = enabledConfigs.map(c => c.module_key);

  const handleEnableModule = (module) => {
    setSelectedModule(module);
    setConfigData({});
  };

  const handleConfigureModule = (module) => {
    const config = enabledConfigs.find(c => c.module_key === module.module_key);
    setSelectedModule(module);
    setConfigData(config?.config_data || {});
  };

  const handleSaveConfig = () => {
    if (!selectedModule) return;
    
    if (enabledModuleKeys.includes(selectedModule.module_key)) {
      updateMutation.mutate({
        module_key: selectedModule.module_key,
        config_data: configData
      });
    } else {
      enableMutation.mutate({
        module_key: selectedModule.module_key,
        config_data: configData
      });
    }
  };

  const handleDisableModule = (module_key) => {
    if (window.confirm('Are you sure you want to disable this automation?')) {
      disableMutation.mutate(module_key);
    }
  };

  if (modulesLoading || configsLoading) {
    return (
      <div className="automations-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading automations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="automations-page">
      <div className="page-header">
        <h1 className="page-title">Automation Marketplace</h1>
        <p className="page-subtitle">Enable and configure powerful automations for your business</p>
      </div>

      <div className="automations-grid">
        {modules.map(module => {
          const isEnabled = enabledModuleKeys.includes(module.module_key);
          const config = enabledConfigs.find(c => c.module_key === module.module_key);

          return (
            <div key={module.id} className={`automation-card ${isEnabled ? 'enabled' : ''}`}>
              <div className="automation-icon">{module.icon}</div>
              <h3>{module.name}</h3>
              <p className="automation-category">{module.category}</p>
              <p className="automation-description">{module.description}</p>
              
              <div className="automation-actions">
                {isEnabled ? (
                  <>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleConfigureModule(module)}
                    >
                      ⚙️ Configure
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => handleDisableModule(module.module_key)}
                      disabled={disableMutation.isPending}
                    >
                      Disable
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn-primary"
                    onClick={() => handleEnableModule(module)}
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {selectedModule && (
        <div className="config-modal" onClick={() => setSelectedModule(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Configure {selectedModule.name}</h2>
              <button className="modal-close" onClick={() => setSelectedModule(null)}>×</button>
            </div>
            
            <div className="modal-body">
              {selectedModule.config_schema?.properties ? (
                Object.entries(selectedModule.config_schema.properties).map(([key, schema]) => (
                  <div key={key} className="form-group">
                    <label>{schema.title || key}</label>
                    {schema.type === 'boolean' ? (
                      <div className="checkbox-wrapper">
                        <input 
                          type="checkbox"
                          id={`config-${key}`}
                          checked={configData[key] || false}
                          onChange={(e) => setConfigData({
                            ...configData,
                            [key]: e.target.checked
                          })}
                        />
                        <label htmlFor={`config-${key}`}>Enable</label>
                      </div>
                    ) : schema.enum ? (
                      <select
                        value={configData[key] || ''}
                        onChange={(e) => setConfigData({
                          ...configData,
                          [key]: e.target.value
                        })}
                      >
                        <option value="">Select...</option>
                        {schema.enum.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : schema.type === 'number' ? (
                      <input 
                        type="number"
                        min={schema.minimum}
                        max={schema.maximum}
                        step={schema.type === 'number' && !Number.isInteger(schema.minimum) ? '0.1' : '1'}
                        value={configData[key] || ''}
                        onChange={(e) => setConfigData({
                          ...configData,
                          [key]: parseFloat(e.target.value)
                        })}
                      />
                    ) : (
                      <input 
                        type="text"
                        value={configData[key] || ''}
                        onChange={(e) => setConfigData({
                          ...configData,
                          [key]: e.target.value
                        })}
                        placeholder={schema.title}
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="no-config">No configuration needed for this module.</p>
              )}
            </div>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSelectedModule(null)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSaveConfig}
                disabled={enableMutation.isPending || updateMutation.isPending}
              >
                {enableMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automations;


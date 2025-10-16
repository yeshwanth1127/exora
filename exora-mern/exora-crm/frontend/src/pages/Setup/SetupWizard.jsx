import { useState } from 'react';
import { getIndustryTemplates, completeSetup } from '../../services/api';
import './SetupWizard.css';

const SetupWizard = ({ onComplete, user }) => {
  const [step, setStep] = useState(1);
  const [industries, setIndustries] = useState([]);
  const [setupData, setSetupData] = useState({
    business_name: '',
    industry: '',
    admin_email: user?.email || '',
    admin_whatsapp: '',
    whatsapp_instance_name: '',
    telegram_chat_id: ''
  });

  useState(() => {
    loadIndustries();
  }, []);

  const loadIndustries = async () => {
    try {
      const data = await getIndustryTemplates();
      setIndustries(data.industries || []);
    } catch (error) {
      console.error('Failed to load industries:', error);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    try {
      await completeSetup(setupData);
      onComplete();
    } catch (error) {
      console.error('Setup failed:', error);
      alert('Setup failed. Please try again.');
    }
  };

  return (
    <div className="setup-wizard">
      <div className="setup-container">
        <div className="setup-header">
          <h1>Welcome to Exora CRM</h1>
          <p>Let's set up your CRM in 3 simple steps</p>
          
          <div className="setup-steps">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Industry</span>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Business Info</span>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Notifications</span>
            </div>
          </div>
        </div>

        <div className="setup-content">
          {step === 1 && (
            <div className="setup-step">
              <h2>Select Your Industry</h2>
              <p>Choose the industry that best describes your business</p>
              
              <div className="industry-grid">
                {industries.map((industry) => (
                  <div
                    key={industry.key}
                    className={`industry-card ${setupData.industry === industry.key ? 'selected' : ''}`}
                    onClick={() => setSetupData({ ...setupData, industry: industry.key })}
                  >
                    <h3>{industry.name}</h3>
                  </div>
                ))}
              </div>

              <div className="step-actions">
                <button 
                  className="btn-primary"
                  onClick={handleNext}
                  disabled={!setupData.industry}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="setup-step">
              <h2>Business Information</h2>
              <p>Tell us about your business</p>

              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  value={setupData.business_name}
                  onChange={(e) => setSetupData({ ...setupData, business_name: e.target.value })}
                  placeholder="Enter your business name"
                />
              </div>

              <div className="form-group">
                <label>Admin Email</label>
                <input
                  type="email"
                  value={setupData.admin_email}
                  onChange={(e) => setSetupData({ ...setupData, admin_email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="form-group">
                <label>Admin WhatsApp (Optional)</label>
                <input
                  type="text"
                  value={setupData.admin_whatsapp}
                  onChange={(e) => setSetupData({ ...setupData, admin_whatsapp: e.target.value })}
                  placeholder="+55 11 98765-4321"
                />
                <span className="form-hint">For important notifications</span>
              </div>

              <div className="step-actions">
                <button className="btn-secondary" onClick={handleBack}>
                  ← Back
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleNext}
                  disabled={!setupData.business_name || !setupData.admin_email}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="setup-step">
              <h2>Notification Settings</h2>
              <p>Configure how you want to receive notifications (you can skip this)</p>

              <div className="form-group">
                <label>Telegram Chat ID (Optional)</label>
                <input
                  type="text"
                  value={setupData.telegram_chat_id}
                  onChange={(e) => setSetupData({ ...setupData, telegram_chat_id: e.target.value })}
                  placeholder="Your Telegram chat ID"
                />
                <span className="form-hint">
                  Message <strong>@ExoraCRMBot</strong> on Telegram to get your chat ID
                </span>
              </div>

              <div className="step-actions">
                <button className="btn-secondary" onClick={handleBack}>
                  ← Back
                </button>
                <button className="btn-primary" onClick={handleComplete}>
                  Complete Setup ✓
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;


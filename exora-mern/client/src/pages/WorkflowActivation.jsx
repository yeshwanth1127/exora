import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './WorkflowActivation.css';

const WorkflowActivation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Activating your workflow...');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const workflowId = searchParams.get('workflowId');

    if (success === 'true' && workflowId) {
      setStatus('success');
      setMessage('✅ Workflow activated successfully!');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else if (error) {
      setStatus('error');
      setMessage(`❌ Activation failed: ${decodeURIComponent(error)}`);
      
      // Redirect to dashboard after 4 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 4000);
    } else {
      setStatus('error');
      setMessage('❌ Invalid activation response');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="workflow-activation-page">
      <div className="activation-container">
        <div className={`activation-card ${status}`}>
          {status === 'processing' && (
            <div className="spinner"></div>
          )}
          <h1 className="activation-message">{message}</h1>
          {status === 'success' && (
            <p className="activation-redirect">Redirecting to your dashboard...</p>
          )}
          {status === 'error' && (
            <button onClick={() => navigate('/dashboard')} className="retry-btn">
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowActivation;


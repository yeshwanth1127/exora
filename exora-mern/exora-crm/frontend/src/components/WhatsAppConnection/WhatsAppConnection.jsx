import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import './WhatsAppConnection.css';

const WhatsAppConnection = () => {
  const queryClient = useQueryClient();
  const [pollingEnabled, setPollingEnabled] = useState(false);

  // Fetch WhatsApp status
  const { data: statusData, isLoading, refetch } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: async () => {
      const res = await api.get('/whatsapp/status');
      return res.data;
    },
    refetchInterval: pollingEnabled ? 3000 : false, // Poll every 3 seconds when QR shown
    refetchOnWindowFocus: true
  });

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/whatsapp/connect');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['whatsapp-status']);
      if (data.status === 'pending_qr') {
        setPollingEnabled(true); // Start polling for connection
      }
    },
    onError: (error) => {
      alert('Failed to connect: ' + (error.response?.data?.error || error.message));
    }
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/whatsapp/disconnect');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['whatsapp-status']);
      setPollingEnabled(false);
    },
    onError: (error) => {
      alert('Failed to disconnect: ' + (error.response?.data?.error || error.message));
    }
  });

  // Refresh QR mutation
  const refreshQRMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/whatsapp/refresh-qr');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['whatsapp-status']);
      setPollingEnabled(true);
    }
  });

  // Reconnect mutation
  const reconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/whatsapp/reconnect');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['whatsapp-status']);
      setPollingEnabled(true);
    }
  });

  // Stop polling when connected
  useEffect(() => {
    if (statusData?.connected) {
      setPollingEnabled(false);
    }
  }, [statusData?.connected]);

  const handleConnect = () => {
    if (window.confirm('Connect your WhatsApp account? You will need to scan a QR code.')) {
      connectMutation.mutate();
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect WhatsApp? This will stop all WhatsApp automations.')) {
      disconnectMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="whatsapp-connection">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading WhatsApp status...</p>
        </div>
      </div>
    );
  }

  const isConnected = statusData?.connected || false;
  const isPending = statusData?.status === 'pending_qr';
  const qrCode = statusData?.qr_code;
  const qrExpired = statusData?.qr_expired;

  return (
    <div className="whatsapp-connection">
      <h2>WhatsApp Connection</h2>
      <p className="section-description">
        Connect your WhatsApp account to enable automated messaging and AI responses
      </p>

      <div className="connection-status-card">
        <div className="status-header">
          <div className="status-indicator">
            <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
            <span className="status-text">
              {isConnected ? 'Connected' : isPending ? 'Waiting for QR Scan' : 'Disconnected'}
            </span>
          </div>
        </div>

        {isConnected && (
          <div className="connection-details">
            <div className="detail-item">
              <span className="detail-label">Phone Number:</span>
              <span className="detail-value">{statusData.phone_number || 'Unknown'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Instance ID:</span>
              <span className="detail-value">{statusData.instance_id?.substring(0, 12)}...</span>
            </div>
            {statusData.last_connected && (
              <div className="detail-item">
                <span className="detail-label">Last Connected:</span>
                <span className="detail-value">
                  {new Date(statusData.last_connected).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {isPending && qrCode && !qrExpired && (
          <div className="qr-code-container">
            <p className="qr-instructions">
              Scan this QR code with WhatsApp:
            </p>
            <ol className="qr-steps">
              <li>Open WhatsApp on your phone</li>
              <li>Tap Menu or Settings → Linked Devices</li>
              <li>Tap "Link a Device"</li>
              <li>Point your phone at this screen to scan the code</li>
            </ol>
            <div className="qr-image-wrapper">
              <img 
                src={qrCode} 
                alt="WhatsApp QR Code" 
                className="qr-code-image"
              />
            </div>
            <p className="qr-note">
              QR code expires in 40 seconds. 
              <button 
                className="link-button" 
                onClick={() => refreshQRMutation.mutate()}
                disabled={refreshQRMutation.isPending}
              >
                {refreshQRMutation.isPending ? 'Refreshing...' : 'Refresh QR'}
              </button>
            </p>
          </div>
        )}

        {isPending && qrExpired && (
          <div className="qr-expired">
            <p>QR code expired.</p>
            <button 
              className="btn-primary"
              onClick={() => refreshQRMutation.mutate()}
              disabled={refreshQRMutation.isPending}
            >
              {refreshQRMutation.isPending ? 'Generating...' : 'Generate New QR'}
            </button>
          </div>
        )}

        {statusData?.needs_reconnect && !isPending && (
          <div className="reconnect-prompt">
            <p>WhatsApp session disconnected. Reconnect to continue using automations.</p>
            <button 
              className="btn-primary"
              onClick={() => reconnectMutation.mutate()}
              disabled={reconnectMutation.isPending}
            >
              {reconnectMutation.isPending ? 'Reconnecting...' : 'Reconnect WhatsApp'}
            </button>
          </div>
        )}

        <div className="connection-actions">
          {!isConnected && !isPending && (
            <button 
              className="btn-primary"
              onClick={handleConnect}
              disabled={connectMutation.isPending}
            >
              {connectMutation.isPending ? 'Connecting...' : 'Connect WhatsApp'}
            </button>
          )}

          {isConnected && (
            <button 
              className="btn-danger"
              onClick={handleDisconnect}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
            </button>
          )}
        </div>
      </div>

      <div className="whatsapp-info">
        <h3>About WhatsApp Integration</h3>
        <ul>
          <li>Connect your WhatsApp Business or personal account</li>
          <li>Receive customer messages directly in your CRM</li>
          <li>Send automated responses using AI</li>
          <li>Track all conversations in one place</li>
          <li>Your phone can stay online while messages are managed here</li>
        </ul>
      </div>
    </div>
  );
};

export default WhatsAppConnection;



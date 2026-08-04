import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getContact } from '../../services/api';
import './ContactDetail.css';

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => getContact(id)
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Contact not found</div>;
  }

  return (
    <div className="contact-detail">
      <button className="btn-back" onClick={() => navigate('/contacts')}>
        ← Back to Contacts
      </button>

      <div className="contact-header-card">
        <div className="contact-header-avatar">
          {data.name.charAt(0)}
        </div>
        <div className="contact-header-info">
          <h1>{data.name}</h1>
          <div className="contact-header-meta">
            {data.phone && <span>📞 {data.phone}</span>}
            {data.email && <span>✉️ {data.email}</span>}
            {data.whatsapp_number && <span>💬 {data.whatsapp_number}</span>}
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          Activities ({data.recent_activities?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Events ({data.upcoming_events?.length || 0})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="info-section">
              <h3>Contact Information</h3>
              {data.birth_date && <p><strong>Birth Date:</strong> {data.birth_date}</p>}
              {data.address && <p><strong>Address:</strong> {data.address}</p>}
              {data.notes && <p><strong>Notes:</strong> {data.notes}</p>}
              <p><strong>Source:</strong> {data.source}</p>
              <p><strong>Created:</strong> {new Date(data.created_at).toLocaleString()}</p>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="activities-tab">
            {data.recent_activities?.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{activity.channel === 'whatsapp' ? '💬' : '📝'}</div>
                <div className="activity-content">
                  <p className="activity-body">{activity.body}</p>
                  <span className="activity-time">
                    {new Date(activity.created_at).toLocaleString()}
                  </span>
                </div>
                <span className={`activity-direction ${activity.direction}`}>
                  {activity.direction}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="events-tab">
            {data.upcoming_events?.map((event) => (
              <div key={event.id} className="event-item-detail">
                <h4>{event.title}</h4>
                <p>{new Date(event.start_time).toLocaleString()}</p>
                <span className={`status-badge ${event.status}`}>{event.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactDetail;


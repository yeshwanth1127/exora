import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUpcomingEvents, listContacts, getAutomationStats } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { data: upcomingEvents } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => getUpcomingEvents(7)
  });

  const { data: contacts } = useQuery({
    queryKey: ['contacts-summary'],
    queryFn: () => listContacts({ limit: 5 })
  });

  const { data: automationStats } = useQuery({
    queryKey: ['automation-stats'],
    queryFn: () => getAutomationStats(30)
  });

  const stats = [
    {
      label: 'Total Contacts',
      value: contacts?.total || 0,
      icon: '👥',
      color: '#667eea'
    },
    {
      label: 'Upcoming Events',
      value: upcomingEvents?.count || 0,
      icon: '📅',
      color: '#764ba2'
    },
    {
      label: 'Automations (30d)',
      value: automationStats?.summary?.total_automations || 0,
      icon: '🤖',
      color: '#10b981'
    },
    {
      label: 'Success Rate',
      value: `${automationStats?.summary?.success_rate || 0}%`,
      icon: '✓',
      color: '#22c55e'
    }
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your CRM activity</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
            <div className="stat-icon" style={{ background: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Upcoming Events</h2>
          {upcomingEvents?.upcoming_events?.length > 0 ? (
            <div className="events-list">
              {upcomingEvents.upcoming_events.slice(0, 5).map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-time">
                    {new Date(event.start_time).toLocaleDateString()}
                  </div>
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    <p>{event.contact_name}</p>
                  </div>
                  <div className={`event-status ${event.status}`}>
                    {event.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No upcoming events</p>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Recent Contacts</h2>
          {contacts?.contacts?.length > 0 ? (
            <div className="contacts-list">
              {contacts.contacts.slice(0, 5).map((contact) => (
                <div key={contact.id} className="contact-item">
                  <div className="contact-avatar">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="contact-details">
                    <h4>{contact.name}</h4>
                    <p>{contact.phone || contact.whatsapp_number}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No contacts yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


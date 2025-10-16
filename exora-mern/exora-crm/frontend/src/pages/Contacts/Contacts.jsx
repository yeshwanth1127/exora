import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listContacts, createContact, deleteContact, getIndustryConfig } from '../../services/api';
import { Link } from 'react-router-dom';
import CreateContactModal from './CreateContactModal';
import './Contacts.css';

const Contacts = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: industryConfig } = useQuery({
    queryKey: ['industry-config'],
    queryFn: getIndustryConfig
  });

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', searchTerm],
    queryFn: () => listContacts({ search: searchTerm })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
    }
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const contactLabel = industryConfig?.template?.contact_label_plural || 'Contacts';

  return (
    <div className="contacts-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{contactLabel}</h1>
          <p className="page-subtitle">Manage your {contactLabel.toLowerCase()}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Add {industryConfig?.template?.contact_label || 'Contact'}
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder={`Search ${contactLabel.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="contacts-list">
          {data?.contacts?.length > 0 ? (
            data.contacts.map((contact) => (
              <div key={contact.id} className="contact-card">
                <div className="contact-avatar">
                  {contact.name.charAt(0)}
                </div>
                <div className="contact-info">
                  <Link to={`/contacts/${contact.id}`} className="contact-name">
                    {contact.name}
                  </Link>
                  <div className="contact-details">
                    {contact.phone && <span>📞 {contact.phone}</span>}
                    {contact.email && <span>✉️ {contact.email}</span>}
                    {contact.whatsapp_number && <span>💬 {contact.whatsapp_number}</span>}
                  </div>
                  <div className="contact-meta">
                    <span className="contact-source">{contact.source}</span>
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="contact-tags">
                        {contact.tags.map((tag, i) => (
                          <span key={i} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="contact-actions">
                  <Link to={`/contacts/${contact.id}`} className="btn-view">
                    View
                  </Link>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(contact.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No {contactLabel.toLowerCase()} found</p>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                Add your first {industryConfig?.template?.contact_label || 'contact'}
              </button>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <CreateContactModal
          onClose={() => setShowCreateModal(false)}
          industryConfig={industryConfig}
        />
      )}
    </div>
  );
};

export default Contacts;


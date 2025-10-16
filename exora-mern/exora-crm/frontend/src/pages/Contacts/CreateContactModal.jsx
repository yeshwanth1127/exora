import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContact } from '../../services/api';
import './CreateContactModal.css';

const CreateContactModal = ({ onClose, industryConfig }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    whatsapp_number: '',
    birth_date: '',
    address: '',
    notes: '',
    custom_fields: {},
    tags: [],
    source: 'manual'
  });

  const createMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      onClose();
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactLabel = industryConfig?.template?.contact_label || 'Contact';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New {contactLabel}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Full name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+55 11 98765-4321"
              />
            </div>

            <div className="form-group">
              <label>WhatsApp</label>
              <input
                type="tel"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                placeholder="+55 11 98765-4321"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
            />
          </div>

          {industryConfig?.template?.custom_fields?.map((field) => (
            <div key={field.key} className="form-group">
              <label>
                {field.label}
                {field.required && ' *'}
              </label>
              {field.type === 'date' ? (
                <input
                  type="date"
                  name={field.key}
                  onChange={(e) => setFormData({
                    ...formData,
                    custom_fields: {
                      ...formData.custom_fields,
                      [field.key]: e.target.value
                    }
                  })}
                  required={field.required}
                />
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.key}
                  onChange={(e) => setFormData({
                    ...formData,
                    custom_fields: {
                      ...formData.custom_fields,
                      [field.key]: e.target.value
                    }
                  })}
                  required={field.required}
                  rows={3}
                />
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  name={field.key}
                  onChange={(e) => setFormData({
                    ...formData,
                    custom_fields: {
                      ...formData.custom_fields,
                      [field.key]: e.target.value
                    }
                  })}
                  required={field.required}
                />
              )}
            </div>
          ))}

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : `Create ${contactLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContactModal;


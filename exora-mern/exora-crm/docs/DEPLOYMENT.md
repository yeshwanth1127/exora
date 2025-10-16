# Exora CRM - Production Deployment Guide

## Overview

This guide covers deploying Exora CRM to production using Docker.

## Architecture

```
Production Setup:
- exora.solutions (main platform)
- crm.exora.solutions (CRM frontend)
- api.exora.solutions/crm/* (CRM backend APIs)
- n8n-crm.exora.solutions (n8n instance - internal only)
```

## Option 1: Docker Compose (Simplest)

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  crm-backend:
    build: ./exora-crm/backend
    container_name: exora-crm-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/exora
      - JWT_SECRET=${JWT_SECRET}
      - N8N_WEBHOOK_BASE_URL=http://n8n-crm:5678/webhook
      - EVOLUTION_API_URL=${EVOLUTION_API_URL}
      - EVOLUTION_API_KEY=${EVOLUTION_API_KEY}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - OLLAMA_BASE_URL=http://ollama:11434
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
    networks:
      - exora-network
    restart: unless-stopped

  crm-frontend:
    build: ./exora-crm/frontend
    container_name: exora-crm-frontend
    ports:
      - "3001:3000"
    environment:
      - VITE_API_URL=https://api.exora.solutions
    networks:
      - exora-network
    restart: unless-stopped

  n8n-crm:
    image: n8nio/n8n:latest
    container_name: n8n-crm
    ports:
      - "5679:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=exora
      - DB_POSTGRESDB_USER=${DB_USER}
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - WEBHOOK_URL=https://n8n-crm.exora.solutions
    volumes:
      - n8n-crm-data:/home/node/.n8n
    networks:
      - exora-network
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    networks:
      - exora-network
    restart: unless-stopped

networks:
  exora-network:
    external: true

volumes:
  n8n-crm-data:
  ollama-data:
```

### Deploy

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f crm-backend
```

## Option 2: Manual Deployment

See documentation for manual deployment steps.

## Environment Variables

Required for production:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/exora

# JWT (must match Exora)
JWT_SECRET=your-production-secret

# n8n
CRM_N8N_BASE_URL=https://n8n-crm.exora.solutions
CRM_N8N_API_KEY=secure-api-key
CRM_TEMPLATE_WORKFLOW_ID=workflow-id-here

# WhatsApp
EVOLUTION_API_URL=https://your-evolution-api
EVOLUTION_API_KEY=your-api-key

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Ollama
OLLAMA_BASE_URL=http://ollama:11434

# Frontend
CRM_FRONTEND_URL=https://crm.exora.solutions
```

## Nginx Configuration

```nginx
# CRM Frontend
server {
    listen 443 ssl http2;
    server_name crm.exora.solutions;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# n8n (Internal only)
server {
    listen 443 ssl http2;
    server_name n8n-crm.exora.solutions;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Restrict to internal IPs
    allow 10.0.0.0/8;
    deny all;

    location / {
        proxy_pass http://localhost:5679;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] All environment variables set
- [ ] SSL certificates configured
- [ ] Nginx reverse proxy working
- [ ] CRM accessible at https://crm.exora.solutions
- [ ] Exora dashboard shows CRM card
- [ ] Activation flow works (Google OAuth)
- [ ] n8n workflows imported and activated
- [ ] Ollama models downloaded
- [ ] Test end-to-end flow

## Monitoring

Set up monitoring for:
- Backend API health endpoint
- Database connections
- n8n workflow execution status
- WhatsApp/Telegram message delivery
- AI response times

## Backups

- PostgreSQL daily backups
- n8n workflow exports (weekly)
- Configuration backups


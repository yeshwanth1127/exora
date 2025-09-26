-- Sample user agents for testing
INSERT INTO user_agents (user_id, agent_type, name, status, configuration) VALUES 
(1, 'customer_service', 'Customer Support Bot', 'active', '{"language": "en", "response_time": "2s", "escalation_threshold": 3}'),
(1, 'sales', 'Lead Qualification Agent', 'active', '{"qualification_score": 75, "follow_up_days": 3}'),
(1, 'operations', 'Process Optimizer', 'active', '{"optimization_level": "high", "monitoring_enabled": true}'),
(2, 'data_intelligence', 'Scribe', 'active', '{"note_taking": true, "voice_recognition": true, "auto_categorization": true}');
